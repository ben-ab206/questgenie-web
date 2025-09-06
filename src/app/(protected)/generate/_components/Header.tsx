'use client';

import { DownloadIcon, RoseIcon, UploadIcon } from "lucide-react";

interface HeaderGenerateProps {
    onExportFunc: () => void;
}

const HeaderGenerate = ({ onExportFunc }: HeaderGenerateProps) => {
    return <div className="flex justify-between items-center w-full bg-white py-3 px-5">
        <div className="space-y-2">
            <h1 className="text-2xl">Generate Questions</h1>
            <p>Create professional quiz questions from any content using AI</p>
        </div>
        <div className="flex flex-row items-center space-x-2">
            <button className="flex flex-row items-center bg-blue-200 rounded-lg p-2 space-x-1 px-3" onClick={onExportFunc}>
                <DownloadIcon className="h-4 w-4"/>
                <span>Export</span>
            </button>
            <button className="flex flex-row items-center bg-secondary/50 rounded-lg p-2 space-x-1 px-3">
                <UploadIcon className="h-4 w-4"/>
                <span>Share</span>
            </button>
            <button className="flex flex-row items-center bg-primary rounded-lg p-2 space-x-1 px-3">
                <RoseIcon className="h-4 w-4"/>
                <span>Publish Quiz</span>
            </button>
        </div>
    </div>
}

export default HeaderGenerate