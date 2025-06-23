import React from 'react';

type FileItem = {
  key: string;
  url: string;
};

type FilePreviewProps = {
  previewFile: FileItem | null;
  setPreviewFile: (file: FileItem | null) => void;
  previewLoading: boolean;
  previewContent: string | null;
  userId: string;
  currentPrefix: string;
  getFileExtension: (fileName: string) => string;
  getFileIcon: (fileName: string) => React.ReactNode;
};

const FilePreview: React.FC<FilePreviewProps> = ({
  previewFile,
  setPreviewFile,
  previewLoading,
  previewContent,
  userId,
  currentPrefix,
  getFileExtension,
  getFileIcon,
}) => {
  if (!previewFile) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-xl">
      <div className="bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-2xl max-w-4xl max-h-[90vh] w-full overflow-hidden border border-gray-200 dark:border-gray-700 animate-fade-in backdrop-blur-xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 truncate">
            {previewFile.key.slice(`${userId}/${currentPrefix}`.length)}
          </h3>
          <div className="flex items-center gap-3">
            <a
              href={previewFile.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-full hover:from-blue-600 hover:to-emerald-600 transition-colors text-sm font-semibold shadow"
            >
              Open Original
            </a>
            <button
              onClick={() => setPreviewFile(null)}
              className="text-gray-400 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl rounded-full p-2 transition shadow hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="p-6 overflow-auto max-h-[calc(90vh-8rem)]">
          {previewLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-600 dark:text-gray-400 animate-pulse">Loading preview...</div>
            </div>
          ) : (
            <div>
              {(() => {
                const fileName = previewFile.key.slice(`${userId}/${currentPrefix}`.length);
                const ext = getFileExtension(fileName);
                if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) {
                  return (
                    <img
                      src={previewContent || previewFile.url}
                      alt={fileName}
                      className="max-w-full h-auto rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mx-auto"
                    />
                  );
                }
                if (ext === "pdf") {
                  return (
                    <iframe
                      src={previewFile.url}
                      className="w-full h-96 border rounded-xl shadow-lg"
                      title={fileName}
                    />
                  );
                }
                if (["txt", "md", "json", "js", "css", "html"].includes(ext)) {
                  return (
                    <pre className="bg-gray-100/80 dark:bg-gray-800/80 p-6 rounded-xl text-base text-gray-800 dark:text-gray-200 whitespace-pre-wrap overflow-auto shadow-inner border border-gray-200 dark:border-gray-700">
                      {previewContent || 'No preview available'}
                    </pre>
                  );
                }
                return (
                  <div className="text-center py-12">
                    <div className="text-7xl mb-6">{getFileIcon(fileName)}</div>
                    <div className="text-gray-600 dark:text-gray-400 text-lg">
                      Preview not available for this file type
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreview;
