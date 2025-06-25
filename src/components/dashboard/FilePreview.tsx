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

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-xl">
      <Card className="max-w-4xl max-h-[90vh] w-full overflow-hidden border shadow-2xl backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold truncate">
            {previewFile.key.slice(`${userId}/${currentPrefix}`.length)}
          </h3>
          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="default"
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white shadow"
            >
              <a
                href={previewFile.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Open Original
              </a>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPreviewFile(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 overflow-auto max-h-[calc(90vh-8rem)]">
          {previewLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-muted-foreground animate-pulse">Loading preview...</div>
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
                      className="max-w-full h-auto rounded-xl shadow-lg border mx-auto"
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
                    <pre className="bg-muted p-6 rounded-xl text-base whitespace-pre-wrap overflow-auto shadow-inner border">
                      {previewContent || 'No preview available'}
                    </pre>
                  );
                }
                return (
                  <div className="text-center py-12">
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
