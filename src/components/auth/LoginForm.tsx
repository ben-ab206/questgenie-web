/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState } from 'react'
import { redirect, useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { login, signInWithoutPassword } from '@/services/auth'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { useTemp } from '@/context/temp-context'

// Zod validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { setValue } = useTemp();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
    },
  })

  const { mutateAsync: signIn, isPending } = useMutation({
    mutationFn: signInWithoutPassword,
    onError: (error) => {
      setError(error.message);
    },
    onSuccess: () => {
      router.push("/verify")
    }
  })

  const onSubmit = async (values: LoginFormValues) => {
    await signIn(values)
    setValue(values.email);
  }

  return (
    <Card className='bg-white rounded-3xl shadow-md'>
      <CardContent className='p-9'>
        <div className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          {...field}
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10"
                          data-testid="input-email"
                          disabled={isPending}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                loading={isPending}
                disabled={isPending}
                data-testid="button-login"
              >
                Continue
              </Button>

              <div className='w-full'>
                <div className='flex flex-row items-center space-x-3'>
                  <div className='flex-grow border-t border-gray-300' />
                  <div className='text-gray-500 text-sm'>or</div>
                  <div className='flex-grow border-t border-gray-300' />
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-300"
                onClick={() => {
                  // trigger Google login here
                  console.log("Google login clicked")
                }}
              >
                <Image
                  src={"/icons/google-icon.png"}
                  alt="Google"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
                Continue with Google
              </Button>
              
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  )
}