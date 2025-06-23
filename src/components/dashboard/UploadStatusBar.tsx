import React from 'react';

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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-3 animate-fade-in relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-lg font-bold focus:outline-none"
          onClick={onClose}
          aria-label="Close upload status"
          type="button"
        >
          ×
        </button>
        <div className="font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" /></svg>
          Uploads
        </div>
        {uploadQueue.map((f, i) => (
          <div key={i} className="mb-2 last:mb-0">
            <div className="flex items-center justify-between text-xs font-medium mb-1">
              <span className="truncate max-w-[120px] text-gray-700 dark:text-gray-200">{f.file.name}</span>
              <span className="ml-2 text-gray-500 dark:text-gray-400">
                {f.status === 'uploading' && (f.progress !== undefined ? `${f.progress}%` : 'Uploading...')}
                {f.status === 'success' && <span className="text-green-600">Done</span>}
                {f.status === 'error' && <span className="text-red-600">Error</span>}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${f.status === 'success' ? 'bg-green-500' : f.status === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}
                style={{ width: `${f.progress || (f.status === 'success' ? 100 : 0)}%` }}
              ></div>
            </div>
            {f.status === 'error' && f.errorMsg && (
              <div className="text-xs text-red-500 mt-1">{f.errorMsg}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UploadStatusBar;
