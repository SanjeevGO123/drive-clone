import React from 'react';

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
  folderOptionsAnchor: string | null;
  setFolderOptionsAnchor: (anchor: string | null) => void;
  fileOptionsAnchor: string | null;
  setFileOptionsAnchor: (anchor: string | null) => void;
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
  folderOptionsAnchor,
  setFolderOptionsAnchor,
  fileOptionsAnchor,
  setFileOptionsAnchor,
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
            <button
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
              onClick={(e) => {
                e.stopPropagation();
                setFolderOptionsAnchor(folderOptionsAnchor === folder ? null : folder);
              }}
            >
              <span className="text-lg">⋮</span>
            </button>
            {/* Dropdown menu for folder */}
            {folderOptionsAnchor === folder && (
              <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-20 min-w-[120px]">
                <button
                  className="flex items-center gap-2 w-full px-4 py-2 rounded-lg text-red-600 dark:text-red-400 font-semibold hover:bg-red-50 dark:hover:bg-red-900 hover:text-red-700 dark:hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors text-left active:scale-95"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFolderOptionsAnchor(null);
                    openDeleteConfirm('folder', folder, folder, () => deleteFolder(folder));
                  }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4a2 2 0 012 2v2H7V5a2 2 0 012-2zm0 0V3m0 2v2" /></svg>
                  Delete
                </button>
              </div>
            )}
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
              <button
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                onClick={(e) => {
                  e.stopPropagation();
                  setFileOptionsAnchor(fileOptionsAnchor === key ? null : key);
                }}
              >
                <span className="text-lg">⋮</span>
              </button>
              {/* Dropdown menu for file */}
              {fileOptionsAnchor === key && (
                <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-20 min-w-[120px]">
                  <button
                    className="flex items-center gap-2 w-full px-4 py-2 rounded-lg text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-50 dark:hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors text-left active:scale-95"
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setFileOptionsAnchor(null); renameFile(key); }}
                  >
                    Rename
                  </button>
                  <button
                    className="flex items-center gap-2 w-full px-4 py-2 rounded-lg text-red-600 dark:text-red-400 font-semibold hover:bg-red-50 dark:hover:bg-red-900 hover:text-red-700 dark:hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors text-left active:scale-95"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFileOptionsAnchor(null);
                      openDeleteConfirm('file', key, fileName, () => deleteFile(key));
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4a2 2 0 012 2v2H7V5a2 2 0 012-2zm0 0V3m0 2v2" /></svg>
                    Delete
                  </button>
                </div>
              )}
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
