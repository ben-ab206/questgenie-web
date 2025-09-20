'use client';

import { Card, CardContent } from "@/components/ui/card";
import HeaderProfile from "./_components/Header";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/services/auth";
import { useState } from "react";
import EmailDialog from "./_components/EmailDialog";
import ProfileImageDialog from "./_components/ProfileImageDialog";
import PricingDialog from "./_components/PricingDialog";

const ProfilePage = () => {

    const [ showEmailDialog, setShowEmailDialog ] = useState(false);
    const [ showProfileImageDialog, setShowProfileImageDialog ] = useState(false);
    const [ showPricing, setShowPricing ] = useState(false);

    const { data: profile } = useQuery({
        queryKey: ["ME"],
        queryFn: getCurrentUser
    });

    const handleProfilePictureChange = () => {
        setShowProfileImageDialog(true);
     }

     const onDialogClose = () => {
        setShowEmailDialog(false);
        setShowProfileImageDialog(false);
        setShowPricing(false);
     }

    const handleChangeEmail = () => { setShowEmailDialog(true); }

    const handlePricing = () => { setShowPricing(true)}

    return <div className="bg-primary/10 min-h-screen h-full w-full">
        <HeaderProfile />
        <div className="p-3">
            <Card className="shadow-sm bg-white border border-gray-200">
                <CardContent className="space-y-3">
                    <div className="space-y-8">
                        <div className="space-y-3">
                            <div className="py-4 border-b border-b-gray-200"><h2 className="text-xl font-semibold text-gray-900">Account</h2></div>

                            <div className="flex items-center space-x-4 mb-4">
                                { profile?.image_path ? 
                                    <div className="relative w-20 h-20">
                                        <div className="w-full h-full rounded-full flex items-center justify-center overflow-hidden">
                                            <img 
                                                src={profile.image_path} 
                                                className="w-full h-full rounded-full object-cover" 
                                                alt="Profile"
                                            />
                                        </div>
                                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center border-2 border-white">
                                            <span className="text-white text-xs font-bold">+</span>
                                        </div>
                                    </div>
                                 :<div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center">
                                    <svg
                                        className="w-10 h-10 text-white"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                    </svg>
                                </div>}

                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Name
                                    </label>
                                    <div className="p-2 bg-gray-200 rounded-lg lg:w-[30%] sm:w-[50%]">
                                        <p>{profile?.name}</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleProfilePictureChange}
                                className="text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors duration-200"
                            >
                                Change your profile picture
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="py-4 border-b border-b-gray-200"><h2 className="text-xl font-semibold text-gray-900">General</h2></div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-1 leading-3">
                                    <label className="block  font-medium text-gray-700">
                                        Email
                                    </label>
                                    <p className="text-gray-500 text-sm">
                                        {profile?.email}
                                    </p>
                                </div>

                                <button
                                    onClick={handleChangeEmail}
                                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 font-medium text-sm transition-colors duration-200"
                                >
                                    Change Email
                                </button>
                            </div>
                            {/* Subsription Plan  */}
                            <div className="flex items-center justify-between">
                                <div className="space-y-1 leading-3">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Subscription Plan
                                    </label>
                                    <p className="text-gray-500 text-sm">
                                        {profile?.email}
                                    </p>
                                </div>

                                <button
                                    onClick={handlePricing}
                                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 font-medium text-sm transition-colors duration-200"
                                >
                                    Upgrade
                                </button>
                            </div>

                            {/* Premiun Menbership  */}
                             <div className="flex items-center justify-between">
                                <div className="">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Subscription Plan
                                    </label>
                                    <p className="text-gray-500 text-sm">
                                        {profile?.email}
                                    </p>
                                </div>

                               
                            </div>

                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        <EmailDialog dialogOpen={showEmailDialog} onClose={onDialogClose}/>
        <PricingDialog dialogOpen={showPricing} onClose={onDialogClose}/>
        {profile && <ProfileImageDialog dialogOpen={showProfileImageDialog} user={profile} onDialogClose={onDialogClose}/> }
    </div>
}

export default ProfilePage;