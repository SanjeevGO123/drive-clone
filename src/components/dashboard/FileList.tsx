import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { MoreVertical, Trash2, Edit, Folder, File } from 'lucide-react';

// FileList component displays files and folders in a list layout.
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
// - wrapFileName: Function to wrap file names for display.

type FileItem = {
  key: string;
  url: string;
};

type FileListProps = {
  folders: string[];
  files: FileItem[];
  currentPrefix: string;
  userId: string;
  isSelected: (key: string) => boolean;
  toggleSelect: (key: string) => void;
  setSelected: (selected: Set<string>) => void;
  enterFolder: (folderName: string) => void;
  openFilePreview: (file: FileItem) => void;
  openDeleteConfirm: (type: 'file' | 'folder', target: string, name: string, onConfirm: () => void) => void;
  deleteFolder: (folderName: string) => void;
  deleteFile: (fileKey: string) => void;
  renameFile: (oldKey: string) => void;
  getFileIcon: (fileName: string) => React.ReactNode;
  selected: Set<string>;
  wrapFileName: (name: string, maxLen?: number) => string;
};

const FileList: React.FC<FileListProps> = ({
  folders,
  files,
  currentPrefix,
  userId,
  isSelected,
  toggleSelect,
  setSelected,
  enterFolder,
  openFilePreview,
  openDeleteConfirm,
  deleteFolder,
  deleteFile,
  renameFile,
  getFileIcon,
  selected,
  wrapFileName
}) => {
  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto text-xs sm:text-sm md:text-base">
      {/* Header row */}
      <div className="grid grid-cols-12 px-2 sm:px-6 py-2 sm:py-3 font-semibold text-gray-500 dark:text-gray-300">
        <div className="col-span-6">Name</div>
        <div className="col-span-3">Type</div>
        <div className="col-span-3">Actions</div>
      </div>
      {/* Folders */}
      {folders.map((folder) => (
        <div key={folder} className={`grid grid-cols-12 items-center px-6 py-3 hover:bg-blue-50 dark:hover:bg-blue-900 cursor-pointer ${isSelected(folder) ? 'bg-blue-100 dark:bg-blue-900' : ''}`}                onClick={(e) => {
                  if (e.ctrlKey || e.metaKey) toggleSelect(folder);
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
          <div className="col-span-6 flex items-center gap-3">
            {isSelected(folder) && <span className="bg-blue-600 text-white rounded-full p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></span>}
            <span className="text-2xl">📁</span>
            <span className="break-words whitespace-normal w-full max-w-full overflow-hidden max-h-12 overflow-y-auto truncate font-medium text-gray-800 dark:text-gray-200" title={folder}>{folder}</span>
          </div>
          <div className="col-span-3 text-yellow-500">Folder</div>
          <div className="col-span-3 flex gap-2 relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
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
          </div>
        </div>
      ))}
      {/* Files */}
      {files.map(({ key, url }) => {
        const fileName = key.slice(`${userId}/${currentPrefix}`.length);
        return (
          <div key={key} className={`grid grid-cols-12 items-center px-6 py-3 hover:bg-blue-50 dark:hover:bg-blue-900 cursor-pointer ${isSelected(key) ? 'bg-blue-100 dark:bg-blue-900' : ''}`}                onClick={(e) => {
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
            <div className="col-span-6 flex items-center gap-3">
              {isSelected(key) && <span className="bg-blue-600 text-white rounded-full p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></span>}
              <span className="text-2xl">{getFileIcon(fileName)}</span>
              <span className="break-words whitespace-normal w-full max-w-full overflow-hidden max-h-12 overflow-y-auto truncate font-medium text-gray-800 dark:text-gray-200" title={fileName}>{wrapFileName(fileName)}</span>
            </div>
            <div className="col-span-3 text-gray-500 dark:text-gray-400">File</div>
            <div className="col-span-3 flex gap-2 relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
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

export default FileList;
