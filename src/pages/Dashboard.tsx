import React, { useEffect, useState } from "react";
import { 
  Header, 
  FileGrid, 
  FileList, 
  FilePreview, 
  ConfirmModal, 
  RenameModal, 
  SelectionToolbar, 
  Toast, 
  UploadStatusBar 
} from '../components/dashboard';
import LoadingSkeleton from '../components/dashboard/LoadingSkeleton';
import { Toaster } from '../components/ui/toaster';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertTriangle } from 'lucide-react';

// This file defines the Dashboard component, which serves as the main interface for the Drive Clone application.
// It provides functionalities for file and folder management, including upload, preview, rename, delete, and navigation.
// The component integrates various subcomponents for modular functionality and styling.

// Key Features:
// - Dark mode support: Automatically applies dark mode based on user preference.
// - File and folder operations: Fetch, upload, delete, rename, and navigate.
// - Preview: Displays file content or image previews.
// - Toast notifications: Provides feedback for user actions.
// - Responsive design: Adapts to different screen sizes.

// State Variables:
// - darkMode: Tracks the user's dark mode preference.
// - folders, files: Stores the list of folders and files fetched from the server.
// - currentPrefix: Represents the current folder path.
// - uploadQueue: Manages the upload progress and status of files.
// - previewFile, previewContent, previewLoading: Handles file preview functionality.
// - isCreatingFolder, newFolderName: Manages folder creation state.
// - fileOptionsAnchor, folderOptionsAnchor: Tracks context menu anchors for files and folders.
// - toast: Displays notifications for user actions.
// - confirmModal: Handles confirmation dialogs for delete operations.
// - renameModal, renameValue: Manages rename modal state and input.
// - viewMode: Toggles between grid and list views.
// - selected: Tracks selected files and folders.

// Utility Functions:
// - fetchFiles: Fetches files and folders from the server.
// - enterFolder: Navigates into a folder.
// - handleUpload, uploadFile: Handles file uploads.
// - createFolder: Creates a new folder.
// - showToast: Displays toast notifications.
// - openDeleteConfirm, closeConfirmModal: Manages delete confirmation dialogs.
// - renameFile, handleRenameConfirm: Handles file renaming.
// - deleteFile, deleteFolder: Deletes files and folders.
// - goBack: Navigates to the parent folder.
// - wrapFileName: Formats long file names for better display.

// Subcomponents:
// - Header: Displays the top navigation bar with breadcrumbs and upload/folder creation options.
// - SelectionToolbar: Provides tools for managing selected files and folders.
// - FileGrid, FileList: Renders files and folders in grid or list view.
// - FilePreview: Displays file content or image previews.
// - ConfirmModal: Handles delete confirmation dialogs.
// - RenameModal: Manages file renaming.
// - Toast: Displays notifications.
// - UploadStatusBar: Shows upload progress and status.

// Footer: Displays copyright information and links.

type FileItem = {
  key: string;
  url: string;
};

type FileWithStatus = {
  file: File;
  status: "pending" | "uploading" | "success" | "error";
  errorMsg?: string;
  progress?: number; // 0-100
};

const userId = localStorage.getItem("username") || "";
const API_URL = process.env.REACT_APP_API_URL || "";

export default function Dashboard() {
  const [folders, setFolders] = useState<string[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPrefix, setCurrentPrefix] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line
  const [uploadQueue, setUploadQueue] = useState<FileWithStatus[]>([]);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // Toast and Modal state
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    type: 'file' | 'folder' | null;
    target: string | null;
    onConfirm: (() => void) | null;
    name: string;
  }>(
    { open: false, type: null, target: null, onConfirm: null, name: '' }
  );
  // Rename modal state and input value
  const [renameModal, setRenameModal] = useState<{ open: boolean; key: string | null }>({ open: false, key: null });
  const [renameValue, setRenameValue] = useState("");

  const fetchFiles = async (prefix: string, pushState: boolean = true) => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!userId || !token) throw new Error("User not logged in");

      const res = await fetch(
        `${API_URL}/api/files?userId=${encodeURIComponent(
          userId
        )}&prefix=${encodeURIComponent(prefix)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch files");

      const data = await res.json();
      setFolders(Array.isArray(data.folders) ? data.folders : []);
      setFiles(Array.isArray(data.files) ? data.files : []);
      setCurrentPrefix(prefix);
      if (pushState) {
        // Use hash for simplicity
        window.history.pushState({}, '', `#/` + encodeURIComponent(prefix));
      }
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to fetch files:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // On mount, set currentPrefix from URL (hash or query param)
    let prefix = '';
    if (window.location.hash.startsWith('#/')) {
      prefix = decodeURIComponent(window.location.hash.slice(2));
    } else if (window.location.search.includes('prefix=')) {
      const params = new URLSearchParams(window.location.search);
      prefix = params.get('prefix') || '';
    }
    fetchFiles(prefix, false);
    // Listen for browser navigation
    const onPopState = () => {
      let prefix = '';
      if (window.location.hash.startsWith('#/')) {
        prefix = decodeURIComponent(window.location.hash.slice(2));
      } else if (window.location.search.includes('prefix=')) {
        const params = new URLSearchParams(window.location.search);
        prefix = params.get('prefix') || '';
      }
      fetchFiles(prefix, false);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const enterFolder = (folderName: string) => {
    fetchFiles(currentPrefix + folderName + "/");
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles: FileWithStatus[] = Array.from(e.target.files).map(
      (file) => ({
        file,
        status: "pending",
      })
    );
    setUploadQueue((prev) => [...prev, ...newFiles]);
    for (const fileObj of newFiles) {
      await uploadFile(fileObj);
    }
    fetchFiles(currentPrefix);
  };

  const uploadFile = async (fileObj: FileWithStatus) => {
    setUploadQueue((prev) =>
      prev.map((f) =>
        f.file === fileObj.file
          ? { ...f, status: "uploading", errorMsg: undefined, progress: 0 }
          : f
      )
    );
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("username");
      if (!token || !userId) throw new Error("Not authenticated");

      const formData = new FormData();
      formData.append("file", fileObj.file);
      formData.append("userId", userId);
      formData.append("prefix", currentPrefix);

      const res = await fetch(`${API_URL}/api/files/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to upload file");

      setUploadQueue((prev) =>
        prev.map((f) =>
          f.file === fileObj.file ? { ...f, status: "success", progress: 100 } : f
        )
      );
    } catch (err: any) {
      setUploadQueue((prev) =>
        prev.map((f) =>
          f.file === fileObj.file
            ? { ...f, status: "error", errorMsg: err.message }
            : f
        )
      );
    }
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return alert("Folder name cannot be empty");

    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("username");
      if (!token || !userId) throw new Error("Not authenticated");

      const res = await fetch(`${API_URL}/api/files/create-folder`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          prefix: currentPrefix,
          folderName: newFolderName.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed to create folder");

      setNewFolderName("");
      setIsCreatingFolder(false);
      fetchFiles(currentPrefix);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Toast helpers
  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Open confirm modal
  const openDeleteConfirm = (type: 'file' | 'folder', target: string, name: string, onConfirm: () => void) => {
    setConfirmModal({ open: true, type, target, onConfirm, name });
  };
  const closeConfirmModal = () => setConfirmModal({ open: false, type: null, target: null, onConfirm: null, name: '' });

  // Rename file API call (opens modal)
  const renameFile = (oldKey: string) => {
    const oldName = oldKey.split('/').pop()!;
    setRenameValue(oldName);
    setRenameModal({ open: true, key: oldKey });
  };
  // Confirm rename handler
  const handleRenameConfirm = async () => {
    const newName = renameValue.trim();
    const oldKey = renameModal.key!;
    if (!newName || oldKey.split('/').pop() === newName) return setRenameModal({ open: false, key: null });
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('username');
      if (!token || !userId) throw new Error('Not authenticated');
      const newS3Key = oldKey.replace(/[^/]+$/, newName);
      const res = await fetch(`${API_URL}/api/files/rename`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          userId,
          newName, 
          oldS3Key: oldKey, 
          newS3Key
        }),
      });
      if (!res.ok) throw new Error('Rename failed');
      await fetchFiles(currentPrefix);
      showToast('File renamed', 'success');
    } catch (err: any) {
      showToast(err.message || 'Rename failed', 'error');
    } finally {
      setRenameModal({ open: false, key: null });
    }
  };

  // Delete file API call
  const deleteFile = async (fileKey: string) => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("username");
      if (!token || !userId) throw new Error("Not authenticated");
      const res = await fetch(`${API_URL}/api/files/delete-file`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ s3Key: fileKey, userId }),
      });
      if (!res.ok) throw new Error("Failed to delete file");
      fetchFiles(currentPrefix);
      showToast("File deleted", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to delete file", "error");
    }
  };

  // Delete folder API call
  const deleteFolder = async (folderName: string) => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("username");
      if (!token || !userId) throw new Error("Not authenticated");
      // Lambda-style: use s3Key and userId, folderId is not required in URL
      const res = await fetch(`${API_URL}/api/files/delete-folder`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ s3Key: `${userId}/${currentPrefix}${folderName}/`, userId }),
      });
      if (!res.ok) throw new Error("Failed to delete folder");
      fetchFiles(currentPrefix);
      showToast("Folder deleted", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to delete folder", "error");
    }
  };

  // Add back navigation
  const canGoBack = currentPrefix.split('/').filter(Boolean).length > 0;
  const goBack = () => {
    if (!canGoBack) return;
    const parts = currentPrefix.split('/').filter(Boolean);
    const newPrefix = parts.slice(0, -1).join('/') + (parts.length > 1 ? '/' : '');
    fetchFiles(newPrefix);
  };

  const breadcrumbs = currentPrefix
    .split("/")
    .filter(Boolean)
    .map((part, idx, arr) => ({
      name: part,
      prefix: arr.slice(0, idx + 1).join("/") + "/",
    }));
  const getFileExtension = (fileName: string) => {
    return fileName.split(".").pop()?.toLowerCase() || "";
  };

  const getFileIcon = (fileName: string) => {
    const ext = getFileExtension(fileName);
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return "🖼️";
    if (["pdf"].includes(ext)) return "📄";
    if (["doc", "docx"].includes(ext)) return "📝";
    if (["txt", "md"].includes(ext)) return "📄";
    if (["mp4", "avi", "mov"].includes(ext)) return "🎥";
    if (["mp3", "wav", "flac"].includes(ext)) return "🎵";
    if (["zip", "rar", "7z"].includes(ext)) return "📦";
    return "📄";
  };

  const loadPreviewContent = async (file: FileItem) => {
    const fileName = file.key.slice(`${userId}/${currentPrefix}`.length);
    const ext = getFileExtension(fileName);

    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) {
      return file.url; // Return URL for images
    }

    if (["txt", "md", "json", "js", "css", "html"].includes(ext)) {
      try {
        const response = await fetch(file.url);
        const text = await response.text();
        return text.slice(0, 500) + (text.length > 500 ? "..." : ""); // Truncate long text
      } catch (error) {
        return "Error loading file content";
      }
    }

    return null;
  };

  const openFilePreview = async (file: FileItem) => {
    setPreviewFile(file);
    setPreviewLoading(true);
    setPreviewContent(null);

    const content = await loadPreviewContent(file);
    setPreviewContent(content);
    setPreviewLoading(false);
  };

  // Google Drive style: grid/list toggle, selection, toolbar, styled cards, prominent breadcrumbs, empty state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const toggleSelect = (key: string) => {
    setSelected((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) newSet.delete(key);
      else newSet.add(key);
      return newSet;
    });
  };
  const clearSelection = () => setSelected(new Set());
  const isSelected = (key: string) => selected.has(key);

  // Utility to wrap filename after 10 chars
  const wrapFileName = (name: string, maxLen = 10) => {
    if (name.length <= maxLen) return name;
    // Insert a zero-width space after every maxLen chars for wrapping
    return name.replace(new RegExp(`(.{${maxLen}})`, 'g'), '$1\u200b');
  };

  useEffect(() => {
    // Only inject once
    if (typeof window !== 'undefined' && !document.getElementById('rainbow-border-style')) {
      const style = document.createElement('style');
      style.id = 'rainbow-border-style';
      style.textContent = `
.rainbow-border { position: relative; z-index: 0; border-radius: 1rem !important; overflow: hidden; }
.rainbow-border::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 2;
  border-radius: 1rem !important;
  background: linear-gradient(270deg, 
    #ff0080, /* pink */
    #ff8c00, /* bright orange */
    #ffef00, /* yellow */
    #39ff14, /* bright green */
    #00dfd8, /* cyan */
    #007cf0, /* blue */
    #7928ca, /* purple */
    #ff0080 /* pink again for smooth loop */
  );
  background-size: 400% 400%;
  animation: rainbowMove 12s linear infinite alternate;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s;
  border: 3px solid transparent;
  box-shadow: 0 0 16px 4px #39ff14, 0 0 32px 8px #ff8c00, 0 0 24px 6px #ff0080, 0 0 12px 2px #00dfd8;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}
.rainbow-border:hover::after { opacity: 1; }
@keyframes rainbowMove {
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
}
`;
      document.head.appendChild(style);
    }
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 flex flex-col font-sans">
      {/* Top bar */}
      <Header 
        canGoBack={canGoBack}
        goBack={goBack}
        fetchFiles={fetchFiles}
        breadcrumbs={breadcrumbs}
        isCreatingFolder={isCreatingFolder}
        setIsCreatingFolder={setIsCreatingFolder}
        newFolderName={newFolderName}
        setNewFolderName={setNewFolderName}
        createFolder={createFolder}
        handleUpload={handleUpload}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Selection toolbar */}
      <SelectionToolbar 
        selectedCount={selected.size}
        handleDelete={() => {
          // Delete all selected (files and folders) with confirmation
          const toDelete = Array.from(selected);
          if (toDelete.length === 1) {
            const key = toDelete[0];
            const isFolder = folders.includes(key);
            openDeleteConfirm(
              isFolder ? 'folder' : 'file',
              key,
              isFolder ? key : key.slice(`${userId}/${currentPrefix}`.length),
              () => {
                if (isFolder) deleteFolder(key);
                else deleteFile(key);
                clearSelection();
              }
            );
          } else {
            openDeleteConfirm(
              'file',
              '',
              `${toDelete.length} items`,
              () => {
                toDelete.forEach((key) => {
                  const isFolder = folders.includes(key);
                  if (isFolder) deleteFolder(key);
                  else deleteFile(key);
                });
                clearSelection();
              }
            );
          }
        }}
        clearSelection={clearSelection}
      />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-8 md:px-16 py-8 md:py-12 w-full">
        {/* Error state */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <button 
                onClick={() => fetchFiles(currentPrefix)} 
                className="ml-2 underline hover:no-underline"
              >
                Try again
              </button>
            </AlertDescription>
          </Alert>
        )}
        
        {/* Loading state */}
        {isLoading ? (
          <LoadingSkeleton view={viewMode} count={12} />
        ) : (
          /* Folders and Files in grid or list view */
          viewMode === 'grid' ? (
            <FileGrid 
              folders={folders}
              files={files}
              currentPrefix={currentPrefix}
              userId={userId}
              isSelected={isSelected}
              toggleSelect={toggleSelect}
              setSelected={setSelected}
              enterFolder={enterFolder}
              openFilePreview={openFilePreview}
              wrapFileName={wrapFileName}
              openDeleteConfirm={openDeleteConfirm}
              deleteFolder={deleteFolder}
              deleteFile={deleteFile}
              renameFile={renameFile}
              getFileIcon={getFileIcon}
              selected={selected}
            />
          ) : (
            <FileList 
              folders={folders}
              files={files}
              currentPrefix={currentPrefix}
              userId={userId}
              isSelected={isSelected}
              toggleSelect={toggleSelect}
              setSelected={setSelected}
              enterFolder={enterFolder}
              openFilePreview={openFilePreview}
              openDeleteConfirm={openDeleteConfirm}
              deleteFolder={deleteFolder}
              deleteFile={deleteFile}
              renameFile={renameFile}
              getFileIcon={getFileIcon}
              selected={selected}
              wrapFileName={wrapFileName}
            />
          )
        )}
      </main>

      {/* File Preview Modal */}
      <FilePreview
        previewFile={previewFile}
        setPreviewFile={setPreviewFile}
        previewLoading={previewLoading}
        previewContent={previewContent}
        userId={userId}
        currentPrefix={currentPrefix}
        getFileExtension={getFileExtension}
        getFileIcon={getFileIcon}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.open}
        type={confirmModal.type}
        name={confirmModal.name}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirmModal}
      />

      {/* Rename Modal */}
      <RenameModal
        isOpen={renameModal.open}
        value={renameValue}
        onChange={setRenameValue}
        onConfirm={handleRenameConfirm}
        onCancel={() => setRenameModal({ open: false, key: null })}
      />      {/* Toast Notification */}
      <Toast
        message={toast?.message}
        type={toast?.type}
      />

      {/* Footer */}
      <footer className="w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <span>
          © {new Date().getFullYear()} Drive Clone by{' '}
          <a
            href="https://github.com/SanjeevGO123"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Sanjeev
          </a>{' '}
          &mdash; Built with React and AWS
        </span>
      </footer>      {/* Upload status bar */}
      <UploadStatusBar
        uploadQueue={uploadQueue}
        onClose={() => setUploadQueue([])}
      />
      <Toaster />
    </div>
  );
}