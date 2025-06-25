import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';

// UploadStatusBar component displays the status of file uploads.
// Props:
// - uploadQueue: Array of files with their upload status.
// - onClose: Function to close the status bar.

type FileWithStatus = {
  file: File;
  status: "pending" | "uploading" | "success" | "error";
  errorMsg?: string;
  progress?: number; // 0-100
};

type UploadStatusBarProps = {
  uploadQueue: FileWithStatus[];
  onClose: () => void;
};

const UploadStatusBar: React.FC<UploadStatusBarProps> = ({
  uploadQueue,
  onClose,
}) => {
  if (uploadQueue.length === 0) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-xs sm:max-w-sm md:max-w-md">
      <Card className="shadow-2xl animate-fade-in">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Uploads
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
              aria-label="Close upload status"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {uploadQueue.map((f, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="truncate max-w-[140px] font-medium">{f.file.name}</span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {f.status === 'uploading' && (
                    <>
                      <span>{f.progress !== undefined ? `${f.progress}%` : 'Uploading...'}</span>
                    </>
                  )}
                  {f.status === 'success' && (
                    <>
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      <span className="text-green-600">Done</span>
                    </>
                  )}
                  {f.status === 'error' && (
                    <>
                      <AlertCircle className="w-3 h-3 text-destructive" />
                      <span className="text-destructive">Error</span>
                    </>
                  )}
                </div>
              </div>
              <Progress 
                value={f.progress || (f.status === 'success' ? 100 : 0)}
                className={`h-2 ${
                  f.status === 'success' ? '[&>div]:bg-green-500' : 
                  f.status === 'error' ? '[&>div]:bg-destructive' : ''
                }`}
              />
              {f.status === 'error' && f.errorMsg && (
                <div className="text-xs text-destructive">{f.errorMsg}</div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadStatusBar;
