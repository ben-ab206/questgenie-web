'use client';

import { Card, CardContent } from "@/components/ui/card";
import HeaderProfile from "./_components/Header";

const ProfilePage = () => {

    const handleProfilePictureChange = () => { }

    const handleChangeEmail = () => { }

    return <div className="bg-primary/10 min-h-screen h-full w-full">
        <HeaderProfile />
        <div className="p-3">
            <Card className="shadow-sm bg-white border border-gray-200">
                <CardContent className="space-y-3">
                    <div className="space-y-8">
                        <div className="space-y-3">
                            <div className="py-4 border-b border-b-gray-200"><h2 className="text-xl font-semibold text-gray-900">Account</h2></div>

                            <div className="flex items-center space-x-4 mb-4">
                                <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center">
                                    <svg
                                        className="w-10 h-10 text-white"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                    </svg>
                                </div>

                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Name
                                    </label>

                                </div>
                            </div>

                            <button
                                onClick={handleProfilePictureChange}
                                className="text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors duration-200"
                            >
                                Change your profile picture
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="py-4 border-b border-b-gray-200"><h2 className="text-xl font-semibold text-gray-900">Account Security</h2></div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Email
                                    </label>
                                    <p className="text-gray-600">
                                        {"email@gmail.com"}
                                    </p>
                                </div>

                                <button
                                    onClick={handleChangeEmail}
                                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 font-medium text-sm transition-colors duration-200"
                                >
                                    Change Email
                                </button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
}

export default ProfilePage;