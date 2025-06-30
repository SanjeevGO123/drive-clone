import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../ui/breadcrumb';
import { ArrowLeft, Grid3x3, List, Plus, Upload, LogOut, X, Moon, Sun } from 'lucide-react';

// Header component displays the top navigation bar.
// Props:
// - canGoBack: Boolean indicating if the user can navigate back.
// - goBack: Function to navigate back.
// - fetchFiles: Function to fetch files.
// - breadcrumbs: Array of breadcrumb objects.
// - isCreatingFolder: Boolean indicating if a folder is being created.
// - setIsCreatingFolder: Function to set folder creation state.
// - newFolderName: Name of the new folder.
// - setNewFolderName: Function to set the new folder name.
// - createFolder: Function to create a new folder.
// - handleUpload: Function to handle file uploads.
// - viewMode: Current view mode ('grid' or 'list').
// - setViewMode: Function to set the view mode.

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
  const [darkMode, setDarkMode] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || document.documentElement.classList.contains('dark');
    }
    return false;
  });

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white/80 dark:bg-gray-900/80 shadow-xl dark:shadow-gray-900/60 px-6 sm:px-12 py-6 sticky top-0 z-30 gap-4 sm:gap-0 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
        {/* Back button */}
        <Button
          variant="outline"
          size="icon"
          onClick={goBack}
          disabled={!canGoBack}
          aria-label="Go back"
          className={`mr-2 ${!canGoBack ? 'btn-liquid-glass-gray opacity-50' : 'btn-liquid-glass-blue'}`}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight select-none text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-emerald-500 to-indigo-600 dark:from-blue-400 dark:via-emerald-400 dark:to-indigo-400 drop-shadow-lg">
          Drive
        </h1>
        {/* Breadcrumbs styled like Google Drive */}
        <Breadcrumb className="hidden sm:flex ml-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Button
                  variant="ghost"
                  onClick={() => fetchFiles("")}
                  aria-label="Go to root directory"
                  className="font-semibold text-blue-600 dark:text-blue-300 btn-liquid-glass-blue h-auto p-2"
                >
                  Home
                </Button>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumbs.map(({ name, prefix }, i) => (
              <React.Fragment key={prefix}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {i === breadcrumbs.length - 1 ? (
                    <BreadcrumbPage className="font-semibold text-blue-600 dark:text-blue-300">
                      {name}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Button
                        variant="ghost"
                        onClick={() => fetchFiles(prefix)}
                        aria-label={`Go to folder ${name}`}
                        className="text-blue-600 dark:text-blue-300 btn-liquid-glass-blue h-auto p-2"
                      >
                        {name}
                      </Button>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      {/* Responsive action buttons */}
      <div className="flex flex-wrap gap-3 w-full sm:w-auto sm:flex-nowrap items-center justify-end">
        {/* View toggle */}
        <Button
          variant={viewMode === 'grid' ? 'default' : 'ghost'}
          size="icon"
          onClick={() => setViewMode('grid')}
          aria-label="Grid view"
          className={viewMode === 'grid' ? 'btn-liquid-glass-purple' : 'btn-liquid-glass-gray'}
        >
          <Grid3x3 className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === 'list' ? 'default' : 'ghost'}
          size="icon"
          onClick={() => setViewMode('list')}
          aria-label="List view"
          className={viewMode === 'list' ? 'btn-liquid-glass-purple' : 'btn-liquid-glass-gray'}
        >
          <List className="h-4 w-4" />
        </Button>

        {!isCreatingFolder ? (
          <Button
            onClick={() => setIsCreatingFolder(true)}
            className="flex items-center gap-2 w-full sm:w-auto btn-liquid-glass-blue"
            aria-label="Create new folder"
          >
            <Plus className="h-4 w-4" />
            New Folder
          </Button>
        ) : (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <Input
              autoFocus
              type="text"
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full sm:w-auto"
              onKeyDown={(e) => {
                if (e.key === "Enter") createFolder();
                if (e.key === "Escape") {
                  setIsCreatingFolder(false);
                  setNewFolderName("");
                }
              }}
            />
            <div className="flex gap-2">
              <Button
                onClick={createFolder}
                className="w-full sm:w-auto btn-liquid-glass-green"
              >
                Create
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsCreatingFolder(false);
                  setNewFolderName("");
                }}
                aria-label="Cancel folder creation"
                className="btn-liquid-glass-gray"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <Button asChild className="w-full sm:w-auto btn-liquid-glass-amber">
          <label htmlFor="file-upload" className="flex items-center gap-2 cursor-pointer">
            <Upload className="h-4 w-4" />
            Upload
            <input
              id="file-upload"
              type="file"
              multiple
              className="hidden"
              onChange={handleUpload}
            />
          </label>
        </Button>
        <Button
          variant="destructive"
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            window.location.reload();
          }}
          className="flex items-center gap-2 w-full sm:w-auto btn-liquid-glass-red"
          aria-label="Logout"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
        {/* Dark mode toggle */}
        <div className="ml-4">
          <button
            aria-label="Toggle dark mode"
            className={`relative w-14 h-8 rounded-full border-2 border-blue-400 bg-white/30 dark:bg-gray-900/40 shadow-lg flex items-center transition-colors duration-300 btn-liquid-glass-blue overflow-hidden`}
            style={{
              boxShadow: '0 4px 20px 0 rgba(59,130,246,0.10), 0 1.5px 4px 0 rgba(59,130,246,0.10)'
            }}
            onClick={() => setDarkMode((d) => !d)}
          >
            <span
              className={`absolute left-0 top-0 h-full w-full pointer-events-none transition-all duration-500 ${darkMode ? 'bg-gradient-to-r from-blue-900/40 via-indigo-700/30 to-blue-400/20' : 'bg-gradient-to-r from-blue-200/30 via-white/40 to-blue-100/20'}`}
              style={{ zIndex: 1 }}
            ></span>
            <span
              className={`liquid-glass-toggle-knob absolute top-1/2 w-6 h-6 rounded-full shadow-md flex items-center justify-center transition-all duration-500 ${darkMode ? 'right-1 left-auto bg-blue-700/80' : 'left-1 right-auto bg-white/80'} -translate-y-1/2`}
              style={{
                boxShadow: darkMode
                  ? '0 2px 8px 0 rgba(59,130,246,0.25), 0 1.5px 4px 0 rgba(59,130,246,0.10)'
                  : '0 2px 8px 0 rgba(59,130,246,0.10), 0 1.5px 4px 0 rgba(59,130,246,0.10)',
                zIndex: 2,
                transitionTimingFunction: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}
            >
              {darkMode ? <Moon className="w-4 h-4 text-white" /> : <Sun className="w-4 h-4 text-blue-600" />}
            </span>
            {/* Liquid animation effect (background blob) */}
            <span className={`absolute left-1 top-1 w-6 h-6 rounded-full pointer-events-none transition-all duration-700 ${darkMode ? 'scale-110 bg-blue-400/30 blur-md animate-liquid-toggle' : 'scale-100 bg-blue-200/30 blur-md animate-liquid-toggle-rev'}`} style={{zIndex:0}}></span>
          </button>
        </div>
      </div>
      {/* Mobile breadcrumbs below header */}
      <Breadcrumb className="flex sm:hidden mt-2">
        <BreadcrumbList className="text-sm">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fetchFiles("")}
                aria-label="Go to root directory"
                className="font-medium text-blue-600 dark:text-blue-300 btn-liquid-glass-blue h-auto p-1"
              >
                Drive
              </Button>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {breadcrumbs.map(({ name, prefix }, i) => (
            <React.Fragment key={prefix}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {i === breadcrumbs.length - 1 ? (
                  <BreadcrumbPage className="font-medium text-blue-600 dark:text-blue-300">
                    {name}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => fetchFiles(prefix)}
                      aria-label={`Go to folder ${name}`}
                      className="text-blue-600 dark:text-blue-300 btn-liquid-glass-blue h-auto p-1"
                    >
                      {name}
                    </Button>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
};

export default Header;
