import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onError?: (error: string) => void;
}

export default function FileUpload({ onFileSelect }: FileUploadProps) {

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    onFileSelect(file);
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-xl p-12 cursor-pointer transition-colors text-center",
        isDragActive
          ? "border-primary bg-primary/5"
          : "border-gray-300 hover:border-primary hover:bg-primary/5",
      )}
      data-testid="file-upload-zone"
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center">
        <Upload className="w-12 h-12 text-gray-400 mb-4" />
        { (
          <>
            <p className="text-lg font-medium text-gray-700 mb-2">
              {isDragActive ? "Drop files here" : "Drag and drop files here"}
            </p>
            <p className="text-gray-500 mb-4">or click to browse</p>
            <p className="text-sm text-gray-400">Supports PDF, DOCX, TXT files up to 10MB</p>
          </>
        )}
      </div>
    </div>
  );
}
