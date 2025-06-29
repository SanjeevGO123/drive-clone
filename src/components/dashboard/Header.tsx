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
// ...existing imports...
import { ArrowLeft, Grid3x3, List, Plus, Upload, LogOut, X } from 'lucide-react';

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
          className="mr-2"
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
                  className="font-semibold text-blue-600 dark:text-blue-300 hover:bg-blue-50/60 dark:hover:bg-blue-900/60 h-auto p-2"
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
                        className="text-blue-600 dark:text-blue-300 hover:bg-blue-50/60 dark:hover:bg-blue-900/60 h-auto p-2"
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
        >
          <Grid3x3 className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === 'list' ? 'default' : 'ghost'}
          size="icon"
          onClick={() => setViewMode('list')}
          aria-label="List view"
        >
          <List className="h-4 w-4" />
        </Button>

        {!isCreatingFolder ? (
          <Button
            onClick={() => setIsCreatingFolder(true)}
            className="flex items-center gap-2 w-full sm:w-auto"
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
                className="w-full sm:w-auto"
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
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <Button asChild className="w-full sm:w-auto">
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
          className="flex items-center gap-2 w-full sm:w-auto"
          aria-label="Logout"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
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
                className="font-medium text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900 h-auto p-1"
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
                      className="text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900 h-auto p-1"
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
