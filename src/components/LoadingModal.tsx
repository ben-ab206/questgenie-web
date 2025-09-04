import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Brain } from "lucide-react";

interface LoadingModalProps {
  isOpen: boolean;
  progress?: number;
  message?: string;
}

export default function LoadingModal({ 
  isOpen, 
  progress = 0, 
  message = "AI is analyzing your content and creating questions..." 
}: LoadingModalProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-sm" data-testid="loading-modal">
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Brain className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-poppins font-semibold text-lg mb-2">Generating Questions</h3>
          <p className="text-gray-600 mb-4" data-testid="loading-message">
            {message}
          </p>
          <Progress value={progress} className="w-full mb-2" data-testid="loading-progress" />
          <p className="text-sm text-gray-500" data-testid="progress-text">
            Processing... {Math.round(progress)}% complete
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
