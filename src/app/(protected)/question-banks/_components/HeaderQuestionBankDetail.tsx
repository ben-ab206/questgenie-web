import { ChevronLeft, DownloadIcon, RoseIcon, UploadIcon } from "lucide-react";

interface HeaderQuestionBankDetailProps {
    title: string;
    description: string;
    onExportAction: () => void;
    onBack:() => void;
}

const HeaderQuestionBankDetail = ({ title, description, onExportAction, onBack }: HeaderQuestionBankDetailProps) => {
    return <div className="flex flex-row w-full items-center justify-between px-2 bg-white shadow-sm">
        <div className="flex flex-row space-x-2 items-center w-full">
            <button className="p-2 rounded-full hover:bg-primary/5" onClick={onBack}>
                <ChevronLeft />
            </button>
            <div className="w-full space-y-1 py-2 px-5">
            <h1 className="text-2xl font-semibold">{title}</h1>
            <p>{description}</p>
        </div>
        </div>
        <div className="flex flex-row items-center space-x-2 w-full justify-end">
            <button className="flex flex-row items-center bg-[#ECFCFF] text-[#089BB2] rounded-lg p-2 space-x-1 px-3 hover:shadow-sm" onClick={onExportAction}>
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

export default HeaderQuestionBankDetail