import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { ExternalLink, X } from 'lucide-react';

// FilePreview component displays a preview of the selected file.
// Props:
// - previewFile: The file being previewed.
// - setPreviewFile: Function to set the preview file.
// - previewLoading: Boolean indicating if the preview is loading.
// - previewContent: Content of the preview file.
// - userId: ID of the user.
// - currentPrefix: Current folder prefix.
// - getFileExtension: Function to get the file extension.
// - getFileIcon: Function to get the icon for a file.

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

  // Detect current theme
  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" 
         style={{
           background: isDark 
             ? 'rgba(0, 0, 0, 0.8)' 
             : 'rgba(0, 0, 0, 0.6)',
           backdropFilter: 'blur(20px) saturate(180%)',
           WebkitBackdropFilter: 'blur(20px) saturate(180%)',
         }}>
      <Card 
        className="max-w-4xl max-h-[90vh] w-full overflow-hidden shadow-2xl"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: isDark
            ? '1px solid rgba(99, 102, 241, 0.3)'
            : '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: isDark
            ? '0 25px 50px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            : '0 25px 50px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
        }}
      >
        <CardHeader 
          className="flex flex-row items-center justify-between p-6"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.6) 100%)',
            backdropFilter: 'blur(10px) saturate(150%)',
            WebkitBackdropFilter: 'blur(10px) saturate(150%)',
            borderBottom: isDark
              ? '1px solid rgba(71, 85, 105, 0.5)'
              : '1px solid rgba(226, 232, 240, 0.5)',
          }}
        >
          <h3 className="text-xl font-bold truncate">
            {previewFile.key.slice(`${userId}/${currentPrefix}`.length)}
          </h3>
          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="default"
              size="sm"
              className="btn-liquid-glass-blue shadow-lg transition-all duration-300 hover:scale-105"
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.9) 0%, rgba(139, 92, 246, 0.8) 100%)'
                  : 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(34, 197, 94, 0.8) 100%)',
                backdropFilter: 'blur(16px) saturate(180%)',
                WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                border: isDark
                  ? '1px solid rgba(99, 102, 241, 0.4)'
                  : '1px solid rgba(59, 130, 246, 0.4)',
                boxShadow: isDark
                  ? '0 8px 25px rgba(99, 102, 241, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  : '0 8px 25px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                color: isDark ? '#ffffff' : '#ffffff',
              }}
            >
              <a
                href={previewFile.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
                style={{
                  color: isDark ? '#ffffff' : '#ffffff',
                  textDecoration: 'none',
                }}
              >
                <ExternalLink className="w-4 h-4" />
                Open Original
              </a>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPreviewFile(null)}
              className="text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-105"
              style={{
                background: isDark
                  ? 'rgba(71, 85, 105, 0.2)'
                  : 'rgba(107, 114, 128, 0.1)',
                backdropFilter: 'blur(8px) saturate(150%)',
                WebkitBackdropFilter: 'blur(8px) saturate(150%)',
                border: isDark
                  ? '1px solid rgba(71, 85, 105, 0.3)'
                  : '1px solid rgba(107, 114, 128, 0.2)',
                boxShadow: isDark
                  ? '0 4px 15px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  : '0 4px 15px rgba(107, 114, 128, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
              }}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent 
          className="p-6 overflow-auto max-h-[calc(90vh-8rem)]"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)',
            backdropFilter: 'blur(10px) saturate(150%)',
            WebkitBackdropFilter: 'blur(10px) saturate(150%)',
          }}
        >
          {previewLoading ? (
            <div className="flex items-center justify-center h-64">
              <div 
                className="text-muted-foreground animate-pulse px-6 py-3 rounded-xl"
                style={{
                  background: isDark
                    ? 'rgba(71, 85, 105, 0.2)'
                    : 'rgba(148, 163, 184, 0.1)',
                  backdropFilter: 'blur(8px) saturate(150%)',
                  WebkitBackdropFilter: 'blur(8px) saturate(150%)',
                  border: isDark
                    ? '1px solid rgba(71, 85, 105, 0.3)'
                    : '1px solid rgba(148, 163, 184, 0.2)',
                  boxShadow: isDark
                    ? '0 4px 15px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                    : '0 4px 15px rgba(148, 163, 184, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                }}
              >
                Loading preview...
              </div>
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
                      className="max-w-full h-auto rounded-xl mx-auto"
                      style={{
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                      }}
                    />
                  );
                }
                if (ext === "pdf") {
                  return (
                    <iframe
                      src={previewFile.url}
                      className="w-full h-96 rounded-xl"
                      title={fileName}
                      style={{
                        background: isDark
                          ? 'rgba(30, 41, 59, 0.9)'
                          : 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px) saturate(150%)',
                        WebkitBackdropFilter: 'blur(10px) saturate(150%)',
                        border: isDark
                          ? '1px solid rgba(71, 85, 105, 0.5)'
                          : '1px solid rgba(226, 232, 240, 0.5)',
                        boxShadow: isDark
                          ? '0 15px 35px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                          : '0 15px 35px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
                      }}
                    />
                  );
                }
                if (["txt", "md", "json", "js", "css", "html"].includes(ext)) {
                  return (
                    <pre 
                      className="p-6 rounded-xl text-base whitespace-pre-wrap overflow-auto"
                      style={{
                        background: isDark
                          ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%)'
                          : 'linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.6) 100%)',
                        backdropFilter: 'blur(12px) saturate(160%)',
                        WebkitBackdropFilter: 'blur(12px) saturate(160%)',
                        border: isDark
                          ? '1px solid rgba(71, 85, 105, 0.4)'
                          : '1px solid rgba(203, 213, 225, 0.4)',
                        boxShadow: isDark
                          ? '0 8px 25px rgba(0, 0, 0, 0.2), inset 0 2px 4px rgba(0, 0, 0, 0.1)'
                          : '0 8px 25px rgba(71, 85, 105, 0.1), inset 0 2px 4px rgba(0, 0, 0, 0.05)',
                        color: isDark ? '#e2e8f0' : 'inherit',
                      }}
                    >
                      {previewContent || 'No preview available'}
                    </pre>
                  );
                }
                return (
                  <div 
                    className="text-center py-12 rounded-xl"
                    style={{
                      background: isDark
                        ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(51, 65, 85, 0.4) 100%)'
                        : 'linear-gradient(135deg, rgba(248, 250, 252, 0.6) 0%, rgba(241, 245, 249, 0.4) 100%)',
                      backdropFilter: 'blur(10px) saturate(150%)',
                      WebkitBackdropFilter: 'blur(10px) saturate(150%)',
                      border: isDark
                        ? '1px solid rgba(71, 85, 105, 0.3)'
                        : '1px solid rgba(203, 213, 225, 0.3)',
                      boxShadow: isDark
                        ? '0 8px 25px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                        : '0 8px 25px rgba(71, 85, 105, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
                    }}
                  >
                    <div className="text-7xl mb-6">{getFileIcon(fileName)}</div>
                    <div className="text-muted-foreground text-lg">
                      Preview not available for this file type
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FilePreview;
