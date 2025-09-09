"use client";

import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { exportQuestionsToCSV, exportQuestionsToPDF } from "@/lib/utils";
import { Question } from "@/types/questions";
import { Dialog } from "@radix-ui/react-dialog";

import { CodeIcon, DownloadIcon, FileIcon } from "lucide-react";

interface ExportDialogProps {
    data: Question[];
    onClose: () => void;
    dialogOpen: boolean;
}

const ExportDialog = ({ dialogOpen, data, onClose }: ExportDialogProps) => {

    const exportQuestionsWithFilename = (questions: Question[], filename?: string) => {
        const jsonString = JSON.stringify(questions, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || `questions-export-${Date.now()}.json`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const onExport = (type: "pdf" | "json" | "csv") => {
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        if(type === "json") exportQuestionsWithFilename(data);
        if(type === "pdf") exportQuestionsToPDF(data, `testing-${timestamp}`)
        if(type === "csv") exportQuestionsToCSV(data, `testing-${timestamp}`)
        onClose();
    }

    return <Dialog open={dialogOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl w-full">
            <DialogHeader>
                <DialogTitle className="font-bold text-xl">Export</DialogTitle>
            </DialogHeader>
            <div className="flex flex-row space-x-5 items-center">
                <button className="hover:bg-secondary/10 p-2 rounded-lg w-full flex flex-col items-center justify-center space-y-4" onClick={()=> onExport("pdf")}>
                    <div className="bg-red-200 rounded-lg p-3">
                        <DownloadIcon className="text-red-500 h-4 w-4" />
                    </div>
                   <div>
                     <div><span className="font-semibold text-xl">Export as PDF</span></div>
                    <div><p className="text-xs">Download printable questions</p></div>
                   </div>
                </button>
                <button className="hover:bg-secondary/10 p-2 rounded-lg w-full flex flex-col items-center justify-center space-y-4" onClick={()=> onExport("json")}>
                    <div className="bg-blue-200 rounded-lg p-3">
                        <CodeIcon className="text-blue-500 h-4 w-4" />
                    </div>
                    <div>
                        <div><span className="font-semibold text-xl">Export as JSON</span></div>
                    <div><p className="text-xs">For LMS & assessment tools</p></div>
                    </div>
                    
                </button>
                <button className="hover:bg-secondary/10 p-2 rounded-lg w-full flex flex-col items-center justify-center space-y-4" onClick={()=> onExport("csv")}>
                    <div className="bg-green-200 rounded-lg p-3">
                        <FileIcon className="text-green-500 h-4 w-4" />
                    </div>
                    <div>
                        <div><span className="font-semibold text-xl">Export as CSV</span></div>
                    <div><p className="text-xs">Download printable questions</p></div>
                    </div>
                </button>
            </div>
        </DialogContent>
    </Dialog>
}

export default ExportDialog;