import { DownloadIcon, RoseIcon, UploadIcon } from "lucide-react";

interface HeaderQuestionBankDetailProps {
    title: string;
    description: string;
    onExportAction: () => void;
}

const HeaderQuestionBankDetail = ({ title, description, onExportAction }: HeaderQuestionBankDetailProps) => {
    return <div className="flex flex-row w-full items-center justify-between px-2 bg-white shadow-sm">
        <div className="w-full space-y-1 py-2 px-5">
            <h1 className="text-2xl font-semibold">{title}</h1>
            <p>{description}</p>
        </div>
        <div className="flex flex-row items-center space-x-2 w-full justify-end">
            <button className="flex flex-row items-center bg-blue-200 rounded-lg p-2 space-x-1 px-3" onClick={onExportAction}>
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

export default HeaderQuestionBankDetail