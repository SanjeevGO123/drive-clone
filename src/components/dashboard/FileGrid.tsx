import React from 'react';
import Folder from './Folder';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { MoreVertical, Trash2, Edit, FolderOpen, FileText, Info } from 'lucide-react';

// Utility function to get file type colors and styling
const getFileTypeStyle = (extension: string) => {
  const ext = extension.toLowerCase();
  
  switch (ext) {
    case 'pdf':
      return {
        className: "border-red-400 text-red-700 bg-red-50 dark:bg-red-900/30 dark:text-red-300 dark:border-red-600",
        extension: 'PDF'
      };
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'svg':
    case 'webp':
      return {
        className: "border-purple-400 text-purple-700 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-600",
        extension: 'IMAGE'
      };
    case 'doc':
    case 'docx':
      return {
        className: "border-blue-400 text-blue-700 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600",
        extension: 'DOC'
      };
    case 'xls':
    case 'xlsx':
    case 'csv':
      return {
        className: "border-green-400 text-green-700 bg-green-50 dark:bg-green-900/30 dark:text-green-300 dark:border-green-600",
        extension: ext === 'csv' ? 'CSV' : 'EXCEL'
      };
    case 'ppt':
    case 'pptx':
      return {
        className: "border-orange-400 text-orange-700 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-600",
        extension: 'PPT'
      };
    case 'txt':
    case 'md':
    case 'readme':
      return {
        className: "border-gray-400 text-gray-700 bg-gray-50 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-600",
        extension: 'TEXT'
      };
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
    case 'gz':
      return {
        className: "border-yellow-400 text-yellow-700 bg-yellow-50 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-600",
        extension: 'ARCHIVE'
      };
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'mkv':
    case 'webm':
      return {
        className: "border-pink-400 text-pink-700 bg-pink-50 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-600",
        extension: 'VIDEO'
      };
    case 'mp3':
    case 'wav':
    case 'flac':
    case 'aac':
      return {
        className: "border-indigo-400 text-indigo-700 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-600",
        extension: 'AUDIO'
      };
    case 'js':
    case 'ts':
    case 'jsx':
    case 'tsx':
    case 'html':
    case 'css':
    case 'py':
    case 'java':
    case 'cpp':
    case 'c':
      return {
        className: "border-emerald-400 text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-600",
        extension: 'CODE'
      };
    default:
      return {
        className: "border-slate-400 text-slate-700 bg-slate-50 dark:bg-slate-900/30 dark:text-slate-300 dark:border-slate-600",
        extension: ext.toUpperCase() || 'FILE'
      };
  }
};

// FileGrid component displays files and folders in a grid layout.
// Props:
// - folders: Array of folder names.
// - files: Array of file objects with keys and URLs.
// - currentPrefix: Current folder prefix.
// - userId: ID of the user.
// - isSelected: Function to check if an item is selected.
// - toggleSelect: Function to toggle selection of an item.
// - setSelected: Function to set selected items.
// - enterFolder: Function to navigate into a folder.
// - openFilePreview: Function to preview a file.
// - wrapFileName: Function to wrap file names for display.
// - openDeleteConfirm: Function to open delete confirmation modal.
// - deleteFolder: Function to delete a folder.
// - deleteFile: Function to delete a file.
// - renameFile: Function to rename a file.
// - getFileIcon: Function to get the icon for a file.
// - selected: Set of selected items.
// - folderOptionsAnchor: Anchor for folder options menu.
// - setFolderOptionsAnchor: Function to set folder options anchor.
// - fileOptionsAnchor: Anchor for file options menu.
// - setFileOptionsAnchor: Function to set file options anchor.

type FileItem = {
  key: string;
  url: string;
};

type FileGridProps = {
  folders: string[];
  files: FileItem[];
  currentPrefix: string;
  userId: string;
  isSelected: (key: string) => boolean;
  toggleSelect: (key: string) => void;
  setSelected: (selected: Set<string>) => void;
  enterFolder: (folderName: string) => void;
  openFilePreview: (file: FileItem) => void;
  wrapFileName: (name: string, maxLen?: number) => string;
  openDeleteConfirm: (type: 'file' | 'folder', target: string, name: string, onConfirm: () => void) => void;
  deleteFolder: (folderName: string) => void;
  deleteFile: (fileKey: string) => void;
  renameFile: (oldKey: string) => void;
  getFileIcon: (fileName: string) => React.ReactNode;
  selected: Set<string>;
};

const FileGrid: React.FC<FileGridProps> = ({
  folders,
  files,
  currentPrefix,
  userId,
  isSelected,
  toggleSelect,
  setSelected,
  enterFolder,
  openFilePreview,
  wrapFileName,
  openDeleteConfirm,
  deleteFolder,
  deleteFile,
  renameFile,
  getFileIcon,
  selected,
}) => {
  // Show summary info
  const totalItems = folders.length + files.length;
  const selectedCount = selected.size;
  
  return (
    <div className="space-y-6">
      {/* Summary section */}
      {totalItems > 0 && (
        <div className="flex flex-wrap items-center gap-4 pb-4">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="flex items-center gap-1">
              <FolderOpen className="w-3 h-3" />
              {folders.length} folders
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {files.length} files
            </Badge>
            {selectedCount > 0 && (
              <Badge variant="default" className="flex items-center gap-1">
                {selectedCount} selected
              </Badge>
            )}
          </div>
          <Separator orientation="vertical" className="h-6" />
          <div className="text-sm text-muted-foreground">
            Total: {totalItems} items
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 sm:gap-8 md:gap-10">
        {/* Folders */}
        {folders.map((folder) => (
          <div key={folder} className={`rainbow-border overflow-hidden relative group rounded-2xl shadow-xl bg-white/80 dark:bg-gray-800/80 hover:shadow-2xl transition-all duration-200 ${isSelected(folder) ? 'ring-4 ring-blue-400/60 bg-blue-50/80 dark:bg-blue-900/40' : ''} min-h-[200px] sm:min-h-[240px] md:min-h-[280px] lg:min-h-[320px] h-full flex flex-col justify-center items-center backdrop-blur-xl hover:scale-105`}
            style={{ minHeight: 200, height: '100%' }}
            onClick={(e) => {            if (e.ctrlKey || e.metaKey) toggleSelect(folder);
              else if (selected.size > 0) {
                if (isSelected(folder)) toggleSelect(folder);
                else {
                  const newSelection = new Set<string>();
                  newSelection.add(folder);
                  setSelected(newSelection);
                }
              } else enterFolder(folder);
            }}
          >
            {/* Selection checkmark */}
            {isSelected(folder) && (
              <Badge className="absolute top-3 left-3 bg-blue-600 hover:bg-blue-700 border-blue-500 shadow-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </Badge>
            )}
            {/* Folder type badge */}
            <Badge variant="outline" className="absolute top-3 left-1/2 transform -translate-x-1/2 text-xs border-yellow-300 text-yellow-700 bg-yellow-50 dark:bg-yellow-900 dark:text-yellow-300">
              FOLDER
            </Badge>
          {/* 3-dots button for folder */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 h-8 w-8"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  openDeleteConfirm('folder', folder, folder, () => deleteFolder(folder));
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Folder icon and name */}
          <div className="flex flex-col items-center justify-center flex-1 w-full px-4 py-6">
            <Folder size={2.2} color="#00d8ff" className="custom-folder mb-4 drop-shadow-xl" />
            <span
              className="break-words whitespace-normal w-full max-w-full overflow-hidden max-h-16 overflow-y-auto text-gray-800 dark:text-gray-200 font-semibold text-lg text-center px-2"
              title={folder}
            >
              {wrapFileName(folder)}
            </span>
          </div>
        </div>
      ))}
        {/* Files */}
        {files.map(({ key, url }) => {
          const fileName = key.slice(`${userId}/${currentPrefix}`.length);
          const fileExtension = fileName.split('.').pop() || '';
          const fileTypeStyle = getFileTypeStyle(fileExtension);
          return (
            <div key={key} className={`rainbow-border relative group rounded-2xl shadow-xl bg-white/80 dark:bg-gray-800/80 hover:shadow-2xl transition-all duration-200 border border-transparent hover:border-blue-400 dark:hover:border-blue-300 ${isSelected(key) ? 'ring-4 ring-blue-400/60 bg-blue-50/80 dark:bg-blue-900/40' : ''} min-h-[200px] sm:min-h-[240px] md:min-h-[280px] lg:min-h-[320px] h-full flex flex-col justify-center items-center backdrop-blur-xl hover:scale-105`}
              style={{ minHeight: 200, height: '100%' }}                    onClick={(e) => {
                      if (e.ctrlKey || e.metaKey) toggleSelect(key);
                      else if (selected.size > 0) {
                        if (isSelected(key)) toggleSelect(key);
                        else {
                          const newSelection = new Set<string>();
                          newSelection.add(key);
                          setSelected(newSelection);
                        }
                      } else openFilePreview({ key, url });
                    }}
            >
              {/* Selection checkmark */}
              {isSelected(key) && (
                <Badge className="absolute top-3 left-3 bg-blue-600 hover:bg-blue-700 border-blue-500 shadow-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </Badge>
              )}
              {/* File type badge */}
              <Badge variant="outline" className={`absolute top-3 left-1/2 transform -translate-x-1/2 text-xs font-medium ${fileTypeStyle.className}`}>
                {fileTypeStyle.extension}
              </Badge>
            {/* 3-dots button for file */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-3 h-8 w-8"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    renameFile(key);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    openDeleteConfirm('file', key, fileName, () => deleteFile(key));
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* File icon and name */}
            <div className="flex flex-col items-center justify-center px-4 py-8">
              <div className="text-6xl mb-3 drop-shadow-xl">{getFileIcon(fileName)}</div>
              <span
                className="break-words whitespace-normal w-full max-w-full overflow-hidden max-h-12 overflow-y-auto text-gray-800 dark:text-gray-200 font-semibold text-lg text-center px-2"
                title={fileName}
              >
                {wrapFileName(fileName)}
              </span>
            </div>
          </div>
        );
      })}
      {/* Empty state */}
      {folders.length === 0 && files.length === 0 && (
        <Alert className="col-span-full">
          <Info className="h-4 w-4" />
          <AlertDescription className="flex flex-col items-center justify-center py-12">
            <svg className="w-24 h-24 mb-4 text-blue-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 48 48"><rect x="8" y="16" width="32" height="20" rx="3" fill="#e0e7ff"/><rect x="8" y="16" width="32" height="20" rx="3" stroke="#60a5fa" strokeWidth="2"/><rect x="16" y="8" width="16" height="8" rx="2" fill="#bae6fd"/><rect x="16" y="8" width="16" height="8" rx="2" stroke="#38bdf8" strokeWidth="2"/></svg>
            <div className="text-lg text-muted-foreground">Your Drive is empty</div>
            <div className="text-sm text-muted-foreground mt-2">Start by uploading files or creating folders</div>
          </AlertDescription>
        </Alert>
      )}
      </div>
    </div>
  );
};

export default FileGrid;
