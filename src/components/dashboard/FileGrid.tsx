import React from 'react';
import Folder from './Folder';

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
  folderOptionsAnchor: string | null;
  setFolderOptionsAnchor: (anchor: string | null) => void;
  fileOptionsAnchor: string | null;
  setFileOptionsAnchor: (anchor: string | null) => void;
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
  folderOptionsAnchor,
  setFolderOptionsAnchor,
  fileOptionsAnchor,
  setFileOptionsAnchor,
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
          <button
            className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-200/70 dark:hover:bg-gray-700/70 shadow"
            onClick={(e) => {
              e.stopPropagation();
              setFolderOptionsAnchor(folderOptionsAnchor === folder ? null : folder);
            }}
          >
            <span className="text-xl">⋮</span>
          </button>
          {/* Dropdown menu for folder */}
          {folderOptionsAnchor === folder && (
            <div className="absolute right-3 top-14 bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-30 min-w-[150px] py-2 animate-fade-in backdrop-blur-xl">
              <button
                className="flex items-center gap-2 w-full px-5 py-3 rounded-xl text-red-600 dark:text-red-400 font-semibold hover:bg-red-50/80 dark:hover:bg-red-900/80 hover:text-red-700 dark:hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors text-left active:scale-95"
                onClick={(e) => {
                  e.stopPropagation();
                  setFolderOptionsAnchor(null);
                  openDeleteConfirm('folder', folder, folder, () => deleteFolder(folder));
                }}
                type="button"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4a2 2 0 012 2v2H7V5a2 2 0 012-2zm0 0V3m0 2v2" /></svg>
                Delete
              </button>
            </div>
          )}
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
            <button
              className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-200/70 dark:hover:bg-gray-700/70 shadow"
              onClick={(e) => {
                e.stopPropagation();
                setFileOptionsAnchor(fileOptionsAnchor === key ? null : key);
              }}
            >
              <span className="text-xl">⋮</span>
            </button>
            {/* Dropdown menu for file */}
            {fileOptionsAnchor === key && (
              <div className="absolute right-3 top-14 bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-30 min-w-[150px] py-2 animate-fade-in backdrop-blur-xl">
                <button
                  className="flex items-center gap-2 w-full px-5 py-3 rounded-xl text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-50/80 dark:hover:bg-blue-900/80 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors text-left active:scale-95"
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFileOptionsAnchor(null); renameFile(key); }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm-4 6h16" /></svg>
                  Rename
                </button>
                <button
                  className="flex items-center gap-2 w-full px-5 py-3 rounded-xl text-red-600 dark:text-red-400 font-semibold hover:bg-red-50/80 dark:hover:bg-red-900/80 hover:text-red-700 dark:hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors text-left active:scale-95"
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFileOptionsAnchor(null); openDeleteConfirm('file', key, fileName, () => deleteFile(key)); }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4a2 2 0 012 2v2H7V5a2 2 0 012-2zm0 0V3m0 2v2" />
                  </svg>
                  Delete
                </button>
              </div>
            )}
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
