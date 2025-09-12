'use client';

import { DownloadIcon, RoseIcon, UploadIcon } from "lucide-react";

interface HeaderGenerateProps {
    onExportFunc: () => void;
}

const HeaderGenerate = ({ onExportFunc }: HeaderGenerateProps) => {
    return <div className="w-full bg-white shadow-sm flex flex-row justify-between items-center px-5 py-3">
        <div className="space-y-1 ">
            <h1 className="text-2xl font-semibold">Generate Questions</h1>
            <p className="text-sm text-gray-800">Create professional quiz questions from any content using AI</p>
        </div>
        <div className="flex flex-row items-center space-x-2">
            <button className="flex flex-row items-center bg-[#ECFCFF] text-[#089BB2] rounded-lg p-2 space-x-1 px-3 hover:shadow-sm" onClick={onExportFunc}>
                <DownloadIcon className="h-4 w-4"/>
                <span>Export</span>
            </button>
            <button className="flex flex-row items-center bg-primary/10 text-primary rounded-lg p-2 space-x-1 px-3 hover:shadow-sm">
                <UploadIcon className="h-4 w-4"/>
                <span>Share</span>
            </button>
            <button className="flex flex-row items-center bg-primary text-white rounded-lg p-2 space-x-1 px-3 hover:shadow-sm">
                <RoseIcon className="h-4 w-4"/>
                <span>Publish Quiz</span>
            </button>
        </div>
    </div>
}

export default HeaderGenerate