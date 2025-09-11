"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { Card, CardContent } from "../ui/card"
import { useEffect, useState } from "react"
import { useTemp } from "@/context/temp-context"
import { useMutation } from "@tanstack/react-query"
import { signInWithoutPassword, verifyOTP } from "@/services/auth"
import { useRouter } from "next/navigation"

const FormSchema = z.object({
    pin: z.string().min(6, {
        message: "Your one-time password must be 6 characters.",
    }),
})

export function VerifyForm() {
    const [secondsLeft, setSecondsLeft] = useState(90)
    const [canResend, setCanResend] = useState(false)
    const { value } = useTemp();
    const router = useRouter();

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            pin: "",
        },
    })

    const { mutateAsync: verifyOTPCode, isPending: isVerifying } = useMutation({
        mutationFn: verifyOTP,
        onSuccess: () => {
            router.push("/dashboard");
        },
        onError: (err) => console.error(err.message) 
    });

    const { mutateAsync: resendOTP, isPending: isResending } = useMutation({
        mutationFn: signInWithoutPassword,
        onSuccess: () => {
            setSecondsLeft(90);
        },
        onError: (err) => console.error(err.message)
    })

    useEffect(() => {
        let timer: NodeJS.Timeout

        if (secondsLeft > 0) {
            setCanResend(false)
            timer = setInterval(() => {
                setSecondsLeft((prev) => prev - 1)
            }, 1000)
        } else {
            setCanResend(true)
        }

        return () => clearInterval(timer)
    }, [secondsLeft])

    const handleResend = async () => {
        await resendOTP({ email: value });
    }

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        await verifyOTPCode({email: value, token: data.pin });
    }

    return (
        <Card className="bg-white rounded-3xl">
            <CardContent className="p-9">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="pin"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>OTP Code</FormLabel>
                                    <FormControl>
                                        <div>
                                            <InputOTP maxLength={6} {...field}>
                                                <InputOTPGroup className="space-x-3 w-full">
                                                    <InputOTPSlot index={0} />
                                                    <InputOTPSlot index={1} />
                                                    <InputOTPSlot index={2} />
                                                    <InputOTPSlot index={3} />
                                                    <InputOTPSlot index={4} />
                                                    <InputOTPSlot index={5} />
                                                </InputOTPGroup>
                                            </InputOTP>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            className="w-full"
                            loading={isVerifying}
                            data-testid="button-otp-submit"
                        >
                            Verify code
                        </Button>

                        {canResend ? (
                            <div className="w-full flex justify-center">
                                <Button
                                    variant="ghost"
                                    loading={isResending}
                                    onClick={handleResend}
                                    className="text-primary"
                                >
                                    Resend Code
                                </Button>
                            </div>
                        ) : (
                            <div className="w-full flex space-x-2 items-center justify-center">
                                <p className="text-sm">Resend again in</p>
                                <p className="text-sm text-primary">{secondsLeft}</p>
                                <p className="text-sm">sec</p>
                            </div>
                        )}
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
