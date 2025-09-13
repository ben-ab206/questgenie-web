"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { logout } from "@/services/auth";
import { useMutation } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
// import { redirect } from "next/navigation";

interface LogoutDialogProps {
    dialogOpen: boolean,
    onClose: () => void
}

const LogoutDialog = ({ dialogOpen, onClose }: LogoutDialogProps) => {
    const { mutateAsync: signOut, isPending } = useMutation({
        mutationFn: logout,
        onError: (err) => console.error(err.message)
    })

    const handleLogout = async () => {
        await signOut();
    }
    return <AlertDialog open={dialogOpen} onOpenChange={onClose}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Sign out</AlertDialogTitle>
                <AlertDialogDescription>
                    Are you sure you want to sign out of your account?  
                    You can always sign back in later.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="flexf lex-row space-x-2" onClick={handleLogout}>
                    {isPending && <Loader2Icon className="animate-spin h-4 w-4"/> }
                    <span>Continue</span>
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
}

export default LogoutDialog;