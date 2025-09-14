"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { deleteProfileImage, uploadProfileImage } from "@/services/file_services";
import { UserProfile } from "@/types/user";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2Icon, Upload } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface ProfileImageDialogProps {
    dialogOpen?: boolean;
    onDialogClose: () => void;
    user: UserProfile;
}

const ProfileImageDialog = ({ dialogOpen = false, onDialogClose, user }: ProfileImageDialogProps) => {
    const queryClient = useQueryClient();

    const { mutateAsync: profileUpload, isPending } = useMutation({
        mutationFn: uploadProfileImage,
        onSuccess: () => {
            toast.success("Profile Image updated successfully!");
            // Invalidate user profile query to refetch updated data
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
            onDialogClose();
        },
        onError: (err) => toast.error(err.message)
    });

    const { mutateAsync: removeImage, isPending: isRemoving } = useMutation({
        mutationFn: deleteProfileImage,
        onSuccess: () => {
            toast.success("Your profile image is removed successfully!");
            // Invalidate user profile query to refetch updated data
            queryClient.invalidateQueries({ queryKey: ['ME'] });
            onDialogClose();
        },
        onError: (err) => toast.error(err.message)
    });

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const result = await profileUpload(file);
            if (!result.success) {
                toast.error(result.error || "Upload failed");
            }
        } catch (error) {
            console.error("Upload error:", error);
        }
    };

    const handleRemoveImage = async () => {
        try {
            await removeImage();
        } catch (error) {
            console.error("Remove image error:", error);
        }
    };

    return (
        <Dialog open={dialogOpen} onOpenChange={onDialogClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Profile Image</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center space-y-4">
                    {/* Profile Image Display */}
                    <div className="relative w-[150px] h-[150px] rounded-full overflow-hidden border-2 border-gray-200">
                        {user.image_path ? (
                            <img 
                                src={user.image_path} 
                                alt="Profile image"
                                className="object-cover"
                            />
                        ) : (
                            <div className="h-full w-full bg-blue-200 flex items-center justify-center text-gray-600">
                                No Image
                            </div>
                        )}
                    </div>

                    {/* Upload Input */}
                    <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        data-testid="image-upload-input"
                        disabled={isPending}
                    />

                    {/* Action Buttons */}
                    <div className="flex flex-col w-full space-y-2">
                        <label 
                            htmlFor="image-upload"
                            className={`cursor-pointer rounded-md flex flex-row items-center justify-center space-x-2 bg-blue-100 border border-blue-500 hover:bg-blue-500 hover:text-white text-blue-500 p-2 px-4 transition-colors ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Upload className="h-4 w-4" />
                            <span>{isPending ? 'Uploading...' : 'Upload New Image'}</span>
                        </label>

                        {user.image_path && (
                            <button 
                                onClick={handleRemoveImage}
                                disabled={isRemoving}
                                className="rounded-md flex flex-row items-center justify-center space-x-2 bg-red-100 border border-red-500 hover:bg-red-500 hover:text-white text-red-500 p-2 px-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Trash2Icon className="h-4 w-4" />
                                <span>{isRemoving ? 'Removing...' : 'Remove Image'}</span>
                            </button>
                        )}

                        <Button 
                            variant="outline" 
                            onClick={onDialogClose}
                            className="mt-2"
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ProfileImageDialog;