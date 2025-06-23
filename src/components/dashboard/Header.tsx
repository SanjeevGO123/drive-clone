import React from 'react';

type HeaderProps = {
  canGoBack: boolean;
  goBack: () => void;
  fetchFiles: (prefix: string) => void;
  breadcrumbs: Array<{
    name: string;
    prefix: string;
  }>;
  isCreatingFolder: boolean;
  setIsCreatingFolder: (isCreating: boolean) => void;
  newFolderName: string;
  setNewFolderName: (name: string) => void;
  createFolder: () => void;
  handleUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
};

const Header: React.FC<HeaderProps> = ({
  canGoBack,
  goBack,
  fetchFiles,
  breadcrumbs,
  isCreatingFolder,
  setIsCreatingFolder,
  newFolderName,
  setNewFolderName,
  createFolder,
  handleUpload,
  viewMode,
  setViewMode,
}) => {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white/80 dark:bg-gray-900/80 shadow-xl dark:shadow-gray-900/60 px-6 sm:px-12 py-6 sticky top-0 z-30 gap-4 sm:gap-0 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
        {/* Back button */}
        <button
          className={`mr-2 p-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/60 text-gray-500 dark:text-gray-300 hover:bg-blue-100/60 dark:hover:bg-blue-900/60 focus:ring-2 focus:ring-blue-400 shadow transition disabled:opacity-40 active:scale-95`}
          onClick={goBack}
          disabled={!canGoBack}
          aria-label="Go back"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight select-none text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-emerald-500 to-indigo-600 dark:from-blue-400 dark:via-emerald-400 dark:to-indigo-400 drop-shadow-lg">
          Drive
        </h1>
        {/* Breadcrumbs styled like Google Drive */}
        <nav className="hidden sm:flex ml-8 items-center text-lg text-gray-600 dark:text-gray-400 select-none">
          <button
            className="hover:underline font-semibold text-blue-600 dark:text-blue-300 rounded-full px-3 py-1 transition-colors hover:bg-blue-50/60 dark:hover:bg-blue-900/60"
            onClick={() => fetchFiles("")}
            aria-label="Go to root directory"
          >
            Home
          </button>
          {breadcrumbs.length > 0 && <span className="mx-2">/</span>}
          {breadcrumbs.map(({ name, prefix }, i) => (
            <React.Fragment key={prefix}>
              <button
                className="hover:underline text-blue-600 dark:text-blue-300 rounded-full px-3 py-1 transition-colors hover:bg-blue-50/60 dark:hover:bg-blue-900/60"
                onClick={() => fetchFiles(prefix)}
                aria-label={`Go to folder ${name}`}
              >
                {name}
              </button>
              {i < breadcrumbs.length - 1 && <span className="mx-2">/</span>}
            </React.Fragment>
          ))}
        </nav>
      </div>
      {/* Responsive action buttons */}
      <div className="flex flex-wrap gap-3 w-full sm:w-auto sm:flex-nowrap items-center justify-end">
        {/* View toggle */}
        <button
          className={`px-2 py-1 rounded-full shadow-sm border border-transparent ${viewMode === 'grid' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 ring-2 ring-blue-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'} transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 active:scale-95`}
          onClick={() => setViewMode('grid')}
          aria-label="Grid view"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" /></svg>
        </button>
        <button
          className={`px-2 py-1 rounded-full shadow-sm border border-transparent ${viewMode === 'list' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 ring-2 ring-blue-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'} transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 active:scale-95`}
          onClick={() => setViewMode('list')}
          aria-label="List view"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="6" width="16" height="2" rx="1"/><rect x="4" y="11" width="16" height="2" rx="1"/><rect x="4" y="16" width="16" height="2" rx="1"/></svg>
        </button>

        {!isCreatingFolder ? (
          <button
            onClick={() => setIsCreatingFolder(true)}
            className="flex items-center justify-center px-5 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold hover:from-emerald-600 hover:to-blue-600 focus:ring-2 focus:ring-emerald-400 shadow-lg transition duration-150 w-full sm:w-auto active:scale-95 gap-2"
            aria-label="Create new folder"
            type="button"
          >
            <svg className='w-5 h-5 mr-1' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' d='M12 4v16m8-8H4' /></svg>
            <span className="flex-1 text-center">New Folder</span>
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <input
              autoFocus
              type="text"
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 w-full sm:w-auto text-base sm:text-sm shadow-sm"
              style={{ minWidth: 0 }}
              onKeyDown={(e) => {
                if (e.key === "Enter") createFolder();
                if (e.key === "Escape") {
                  setIsCreatingFolder(false);
                  setNewFolderName("");
                }
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={createFolder}
                className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full hover:from-green-600 hover:to-emerald-600 focus:ring-2 focus:ring-green-400 shadow-lg transition duration-150 w-full sm:w-auto active:scale-95"
                type="button"
              >
                <span className="flex-1 text-center">Create</span>
              </button>
              <button
                onClick={() => {
                  setIsCreatingFolder(false);
                  setNewFolderName("");
                }}
                className="flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-3 py-2 rounded-full transition duration-150 focus:outline-none w-full sm:w-auto active:scale-95"
                aria-label="Cancel folder creation"
                type="button"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <label
          htmlFor="file-upload"
          className="flex items-center justify-center cursor-pointer px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full shadow-lg hover:from-blue-600 hover:to-indigo-600 focus:ring-2 focus:ring-blue-400 font-semibold select-none w-full sm:w-auto text-center transition active:scale-95 gap-2"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" /></svg>
          <span className="flex-1 text-center">Upload</span>
          <input
            id="file-upload"
            type="file"
            multiple
            className="hidden"
            onChange={handleUpload}
          />
        </label>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            window.location.reload();
          }}
          className="flex items-center justify-center px-4 py-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 focus:ring-2 focus:ring-red-400 shadow-lg transition duration-150 w-full sm:w-auto active:scale-95 font-semibold gap-2"
          aria-label="Logout"
          type="button"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" /></svg>
          <span className="flex-1 text-center">Logout</span>
        </button>
      </div>
      {/* Mobile breadcrumbs below header */}
      <nav className="flex sm:hidden flex-wrap gap-1 mt-2 text-sm text-gray-600 dark:text-gray-400 select-none">
        <button
          className="hover:underline font-medium text-blue-600 dark:text-blue-300 rounded-full px-2 py-1 transition-colors hover:bg-blue-50 dark:hover:bg-blue-900"
          onClick={() => fetchFiles("")}
          aria-label="Go to root directory"
        >
          Drive
        </button>
        {breadcrumbs.length > 0 && <span className="mx-1">/</span>}
        {breadcrumbs.map(({ name, prefix }, i) => (
          <React.Fragment key={prefix}>
            <button
              className="hover:underline text-blue-600 dark:text-blue-300 rounded-full px-2 py-1 transition-colors hover:bg-blue-50 dark:hover:bg-blue-900"
              onClick={() => fetchFiles(prefix)}
              aria-label={`Go to folder ${name}`}
            >
              {name}
            </button>
            {i < breadcrumbs.length - 1 && <span className="mx-1">/</span>}
          </React.Fragment>
        ))}
      </nav>
    </header>
  );
};

export default Header;
