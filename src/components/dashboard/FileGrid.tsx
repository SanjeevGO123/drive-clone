import React from 'react';
import Folder from './Folder';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { MoreVertical, Trash2, Edit } from 'lucide-react';

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
  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 sm:gap-8 md:gap-10">
      {/* Folders */}
      {folders.map((folder) => (
        <div key={folder} className={`rainbow-border overflow-hidden relative group rounded-2xl shadow-xl bg-white/80 dark:bg-gray-800/80 hover:shadow-2xl transition-shadow duration-200 ${isSelected(folder) ? 'ring-4 ring-blue-400/60' : ''} min-h-[140px] sm:min-h-[180px] md:min-h-[220px] h-full flex flex-col justify-center items-center backdrop-blur-xl`}
          style={{ minHeight: 140, height: '100%' }}
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
            <span className="absolute top-3 left-3 bg-blue-600 text-white rounded-full p-1 shadow-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></span>
          )}
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
          <div className="flex flex-col items-center justify-center flex-1 w-full">
            <Folder size={2.2} color="#00d8ff" className="custom-folder mb-3 drop-shadow-xl" />
            <span
              className="break-words whitespace-normal w-full max-w-full overflow-hidden max-h-12 overflow-y-auto text-gray-800 dark:text-gray-200 font-semibold text-lg text-center px-2"
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
        return (
          <div key={key} className={`rainbow-border relative group rounded-2xl shadow-xl bg-white/80 dark:bg-gray-800/80 hover:shadow-2xl transition-shadow duration-200 border border-transparent hover:border-blue-400 dark:hover:border-blue-300 ${isSelected(key) ? 'ring-4 ring-blue-400/60' : ''} min-h-[140px] sm:min-h-[180px] md:min-h-[220px] h-full flex flex-col justify-center items-center backdrop-blur-xl`}
            style={{ minHeight: 140, height: '100%' }}                  onClick={(e) => {
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
              <span className="absolute top-3 left-3 bg-blue-600 text-white rounded-full p-1 shadow-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></span>
            )}
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
            <div className="flex flex-col items-center justify-center py-10">
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
        <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-60">
          <svg className="w-24 h-24 mb-4 text-blue-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 48 48"><rect x="8" y="16" width="32" height="20" rx="3" fill="#e0e7ff"/><rect x="8" y="16" width="32" height="20" rx="3" stroke="#60a5fa" strokeWidth="2"/><rect x="16" y="8" width="16" height="8" rx="2" fill="#bae6fd"/><rect x="16" y="8" width="16" height="8" rx="2" stroke="#38bdf8" strokeWidth="2"/></svg>
          <div className="text-lg text-gray-500">Your Drive is empty</div>
        </div>
      )}
    </div>
  );
};

export default FileGrid;
