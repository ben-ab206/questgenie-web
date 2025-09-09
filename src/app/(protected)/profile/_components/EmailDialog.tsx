"use client";

import { Button } from "@/components/ui/button";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { updateCurrentUser } from "@/services/auth";
import { Dialog } from "@radix-ui/react-dialog";
import { useMutation } from "@tanstack/react-query";
import { LoaderIcon } from "lucide-react";
import { useState } from "react";

interface ExportDialogProps {
    onClose: () => void;
    dialogOpen: boolean;
}

const EmailDialog = ({ dialogOpen, onClose }: ExportDialogProps) => {
    const [inputEmail, setInputEmail] = useState("");

    const { mutateAsync: updateUser, isPending } = useMutation({
        mutationFn: updateCurrentUser,
        onSuccess: () => {
            onClose();
        },
        onError: (error) => console.error(error.message)
    })

    const handleUpdate = async () => {
        await updateUser({ email: inputEmail })
    }

    return <Dialog open={dialogOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl w-full">
            <DialogHeader>
                <DialogTitle className="font-bold text-xl">Email</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col space-y-1 items-start">
                <label>New Email</label>
                <Input value={inputEmail} onChange={(e) => setInputEmail(e.target.value)} />
            </div>
            <div className="w-full flex justify-end">
                <Button onClick={handleUpdate}>
                    <div className="flex flex-row space-x-1 items-center justify-center">
                        {isPending && <LoaderIcon className="h-4 w-5 animate-spin" />}
                        <p>Change</p>
                    </div>
                </Button>
            </div>
        </DialogContent>
    </Dialog>
}

export default EmailDialog;