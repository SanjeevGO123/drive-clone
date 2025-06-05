import React, { useEffect, useState } from "react";
import Folder from '../components/Folder';

type FileItem = {
  key: string;
  url: string;
};

type FileWithStatus = {
  file: File;
  status: "pending" | "uploading" | "success" | "error";
  errorMsg?: string;
};

const userId = localStorage.getItem("username") || "";
const API_URL = process.env.REACT_APP_API_URL || "";

export default function Dashboard() {
  // Dark mode state
  const [darkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("darkMode");
      if (saved !== null) return saved === "true";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  // Apply or remove dark class on <html>
  useEffect(() => {
    const html = document.documentElement;
    if (darkMode) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  const [folders, setFolders] = useState<string[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPrefix, setCurrentPrefix] = useState("");
  // eslint-disable-next-line
  const [uploadQueue, setUploadQueue] = useState<FileWithStatus[]>([]);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // Add state for options menu
  const [fileOptionsAnchor, setFileOptionsAnchor] = useState<string | null>(null);
  const [folderOptionsAnchor, setFolderOptionsAnchor] = useState<string | null>(null);

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

  const fetchFiles = async (prefix: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!userId || !token) throw new Error("User not logged in");

      const res = await fetch(
        `${API_URL}/getFiles?userId=${encodeURIComponent(
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
    } catch (err: any) {
      alert(err.message);
    }
  };

  useEffect(() => {
    fetchFiles("");
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
          ? { ...f, status: "uploading", errorMsg: undefined }
          : f
      )
    );
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("username");
      if (!token || !userId) throw new Error("Not authenticated");

      const res = await fetch(`${API_URL}/generatepresignedURL`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: currentPrefix + fileObj.file.name,
          filetype: fileObj.file.type,
          userId,
        }),
      });

      if (!res.ok) throw new Error("Failed to get upload URL");

      const { uploadUrl } = await res.json();
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": fileObj.file.type },
        body: fileObj.file,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");

      setUploadQueue((prev) =>
        prev.map((f) =>
          f.file === fileObj.file ? { ...f, status: "success" } : f
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

      const res = await fetch(`${API_URL}/createFolder`, {
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

  // Delete file API call
  const deleteFile = async (fileKey: string) => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("username");
      if (!token || !userId) throw new Error("Not authenticated");
      const res = await fetch(`${API_URL}/deleteFile`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, fileKey }),
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
      const res = await fetch(`${API_URL}/deleteFolder`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, prefix: currentPrefix, folderName }),
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

  useEffect(() => {
    // Only inject once
    if (typeof window !== 'undefined' && !document.getElementById('rainbow-border-style')) {
      const style = document.createElement('style');
      style.id = 'rainbow-border-style';
      style.textContent = `
.rainbow-border { position: relative; z-index: 0; }
.rainbow-border::after {
  content: '';
  position: absolute;
  inset: -3px;
  z-index: 2;
  border-radius: 0.5rem;
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Top bar */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-700 px-4 sm:px-8 py-4 sticky top-0 z-20 gap-3 sm:gap-0">
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {/* Back button */}
          <button
            className={`mr-2 p-2 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900 focus:ring-2 focus:ring-blue-400 shadow transition disabled:opacity-40 active:scale-95`}
            onClick={goBack}
            disabled={!canGoBack}
            aria-label="Go back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight select-none text-blue-700 dark:text-blue-400">
            My Drive
          </h1>
          {/* Breadcrumbs styled like Google Drive */}
          <nav className="hidden sm:flex ml-6 items-center text-base text-gray-600 dark:text-gray-400 select-none">
            <button
              className="hover:underline font-medium text-blue-600 dark:text-blue-300 rounded-full px-2 py-1 transition-colors hover:bg-blue-50 dark:hover:bg-blue-900"
              onClick={() => fetchFiles("")}
              aria-label="Go to root directory"
            >
              Drive
            </button>
            {breadcrumbs.length > 0 && <span className="mx-2">/</span>}
            {breadcrumbs.map(({ name, prefix }, i) => (
              <React.Fragment key={prefix}>
                <button
                  className="hover:underline text-blue-600 dark:text-blue-300 rounded-full px-2 py-1 transition-colors hover:bg-blue-50 dark:hover:bg-blue-900"
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
        <div className="flex flex-wrap gap-2 w-full sm:w-auto sm:flex-nowrap items-center justify-end">
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
              className="flex items-center justify-center px-5 py-2 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 shadow-md transition duration-150 w-full sm:w-auto active:scale-95"
              aria-label="Create new folder"
              type="button"
            >
              <span className="text-lg font-bold mr-1">＋</span>
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
                  className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 focus:ring-2 focus:ring-green-400 shadow-md transition duration-150 w-full sm:w-auto active:scale-95"
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
            className="flex items-center justify-center cursor-pointer px-5 py-2 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 font-semibold select-none w-full sm:w-auto text-center transition active:scale-95"
          >
            <span className="text-lg font-bold mr-1">⭳</span>
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
            className="flex items-center justify-center px-4 py-2 rounded-full bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-400 shadow-md transition duration-150 w-full sm:w-auto active:scale-95 font-semibold"
            aria-label="Logout"
            type="button"
          >
            <span className="text-lg font-bold mr-1">⎋</span>
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

      {/* Toolbar for actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-2 px-8 py-2 bg-blue-50 dark:bg-blue-900 border-b border-blue-200 dark:border-blue-700 sticky top-[72px] z-10 rounded-b-xl shadow-md animate-fade-in">
          <span className="text-blue-700 dark:text-blue-300 font-medium">{selected.size} selected</span>
          <button
            className="px-4 py-2 rounded-full bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-400 shadow-md transition active:scale-95 font-semibold"
            onClick={() => {
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
          >
            <span className="text-lg font-bold mr-1">🗑️</span> Delete
          </button>
          <button
            className="px-4 py-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-2 focus:ring-blue-400 shadow-md transition active:scale-95 font-semibold"
            onClick={clearSelection}
          >
            Cancel
          </button>
        </div>
      )}

      <main className="flex-grow max-w-7xl mx-auto px-2 sm:px-4 md:px-8 py-4 md:py-6 w-full">
        {/* Folders and Files in grid or list view */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
            {/* Folders */}
            {folders.map((folder) => (
              <div key={folder} className={`rainbow-border relative group rounded-lg shadow-md bg-white dark:bg-gray-700 hover:shadow-lg transition-shadow duration-200 border border-transparent hover:border-blue-400 dark:hover:border-blue-300 ${isSelected(folder) ? 'ring-2 ring-blue-500' : ''} min-h-[120px] sm:min-h-[160px] md:min-h-[200px] h-full flex flex-col justify-center items-center`}
                style={{ minHeight: 120, height: '100%' }}
                onClick={(e) => {
                  if (e.ctrlKey || e.metaKey) toggleSelect(folder);
                  else if (selected.size > 0) {
                    if (isSelected(folder)) toggleSelect(folder);
                    else setSelected(new Set([folder]));
                  } else enterFolder(folder);
                }}
              >
                {/* Selection checkmark */}
                {isSelected(folder) && (
                  <span className="absolute top-2 left-2 bg-blue-600 text-white rounded-full p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></span>
                )}
                {/* 3-dots button for folder */}
                <button
                  className="absolute top-2 right-2 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFolderOptionsAnchor(folderOptionsAnchor === folder ? null : folder);
                  }}
                >
                  <span className="text-lg">⋮</span>
                </button>
                {/* Dropdown menu for folder */}
                {folderOptionsAnchor === folder && (
                  <div className="absolute right-2 top-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-20 min-w-[140px] py-2 animate-fade-in">
                    <button
                      className="flex items-center gap-2 w-full px-4 py-2 rounded-lg text-red-600 dark:text-red-400 font-semibold hover:bg-red-50 dark:hover:bg-red-900 hover:text-red-700 dark:hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors text-left active:scale-95"
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
                  <Folder size={2} color="#00d8ff" className="custom-folder mb-2" />
                  <span
                    className="break-words whitespace-normal w-full max-w-full overflow-hidden max-h-12 overflow-y-auto text-gray-800 dark:text-gray-200 font-medium text-base text-center px-2"
                    title={folder}
                  >
                    {folder}
                  </span>
                </div>
              </div>
            ))}
            {/* Files */}
            {files.map(({ key, url }) => {
              const fileName = key.slice(`${userId}/${currentPrefix}`.length);
              return (
                <div key={key} className={`rainbow-border relative group rounded-lg shadow-md bg-white dark:bg-gray-700 hover:shadow-lg transition-shadow duration-200 border border-transparent hover:border-blue-400 dark:hover:border-blue-300 ${isSelected(key) ? 'ring-2 ring-blue-500' : ''} min-h-[120px] sm:min-h-[160px] md:min-h-[200px] h-full flex flex-col justify-center items-center`}
                  style={{ minHeight: 120, height: '100%' }}
                  onClick={(e) => {
                    if (e.ctrlKey || e.metaKey) toggleSelect(key);
                    else if (selected.size > 0) {
                      if (isSelected(key)) toggleSelect(key);
                      else setSelected(new Set([key]));
                    } else openFilePreview({ key, url });
                  }}
                >
                  {/* Selection checkmark */}
                  {isSelected(key) && (
                    <span className="absolute top-2 left-2 bg-blue-600 text-white rounded-full p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></span>
                  )}
                  {/* 3-dots button for file */}
                  <button
                    className="absolute top-2 right-2 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFileOptionsAnchor(fileOptionsAnchor === key ? null : key);
                    }}
                  >
                    <span className="text-lg">⋮</span>
                  </button>
                  {/* Dropdown menu for file */}
                  {fileOptionsAnchor === key && (
                    <div className="absolute right-2 top-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-20 min-w-[140px] py-2 animate-fade-in">
                      <button
                        className="flex items-center gap-2 w-full px-4 py-2 rounded-lg text-red-600 dark:text-red-400 font-semibold hover:bg-red-50 dark:hover:bg-red-900 hover:text-red-700 dark:hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors text-left active:scale-95"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFileOptionsAnchor(null);
                          openDeleteConfirm('file', key, fileName, () => deleteFile(key));
                        }}
                        type="button"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4a2 2 0 012 2v2H7V5a2 2 0 012-2zm0 0V3m0 2v2" /></svg>
                        Delete
                      </button>
                    </div>
                  )}
                  {/* File icon and name */}
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="text-6xl mb-2">{getFileIcon(fileName)}</div>
                    <span
                      className="break-words whitespace-normal w-full max-w-full overflow-hidden max-h-12 overflow-y-auto text-gray-800 dark:text-gray-200 font-medium text-base text-center px-2"
                      title={fileName}
                    >
                      {fileName}
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
        ) : (
          // List view
          <div className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto text-xs sm:text-sm md:text-base">
            {/* Header row */}
            <div className="grid grid-cols-12 px-2 sm:px-6 py-2 sm:py-3 font-semibold text-gray-500 dark:text-gray-300">
              <div className="col-span-6">Name</div>
              <div className="col-span-3">Type</div>
              <div className="col-span-3">Actions</div>
            </div>
            {/* Folders */}
            {folders.map((folder) => (
              <div key={folder} className={`grid grid-cols-12 items-center px-6 py-3 hover:bg-blue-50 dark:hover:bg-blue-900 cursor-pointer ${isSelected(folder) ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
                onClick={(e) => {
                  if (e.ctrlKey || e.metaKey) toggleSelect(folder);
                  else if (selected.size > 0) {
                    if (isSelected(folder)) toggleSelect(folder);
                    else setSelected(new Set([folder]));
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
                <div key={key} className={`grid grid-cols-12 items-center px-6 py-3 hover:bg-blue-50 dark:hover:bg-blue-900 cursor-pointer ${isSelected(key) ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
                  onClick={(e) => {
                    if (e.ctrlKey || e.metaKey) toggleSelect(key);
                    else if (selected.size > 0) {
                      if (isSelected(key)) toggleSelect(key);
                      else setSelected(new Set([key]));
                    } else openFilePreview({ key, url });
                  }}
                >
                  <div className="col-span-6 flex items-center gap-3">
                    {isSelected(key) && <span className="bg-blue-600 text-white rounded-full p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></span>}
                    <span className="text-2xl">{getFileIcon(fileName)}</span>
                    <span className="break-words whitespace-normal w-full max-w-full overflow-hidden max-h-12 overflow-y-auto truncate font-medium text-gray-800 dark:text-gray-200" title={fileName}>{fileName}</span>
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
                          className="flex items-center gap-2 w-full px-4 py-2 rounded-lg text-red-600 dark:text-red-400 font-semibold hover:bg-red-50 dark:hover:bg-red-900 hover:text-red-700 dark:hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors text-left active:scale-95"
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
        )}
      </main>
      {/* File Preview Modal */}
{previewFile && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl max-h-[90vh] w-full overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 truncate">
          {previewFile.key.slice(`${userId}/${currentPrefix}`.length)}
        </h3>
        <div className="flex items-center gap-2">
          <a
            href={previewFile.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
          >
            Open Original
          </a>
          <button
            onClick={() => setPreviewFile(null)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl"
          >
            ✕
          </button>
        </div>
      </div>
      
      <div className="p-4 overflow-auto max-h-[calc(90vh-8rem)]">
        {previewLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-600 dark:text-gray-400">Loading preview...</div>
          </div>
        ) : (
          <div>
            {(() => {
              const fileName = previewFile.key.slice(`${userId}/${currentPrefix}`.length);
              const ext = getFileExtension(fileName);
              
              if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
                return (
                  <img
                    src={previewContent || previewFile.url}
                    alt={fileName}
                    className="max-w-full h-auto rounded"
                  />
                );
              }
              
              if (ext === 'pdf') {
                return (
                  <iframe
                    src={previewFile.url}
                    className="w-full h-96 border rounded"
                    title={fileName}
                  />
                );
              }
              
              if (['txt', 'md', 'json', 'js', 'css', 'html'].includes(ext)) {
                return (
                  <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap overflow-auto">
                    {previewContent || 'No preview available'}
                  </pre>
                );
              }
              
              return (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">{getFileIcon(fileName)}</div>
                  <div className="text-gray-600 dark:text-gray-400">
                    Preview not available for this file type
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  </div>
)}

{/* Confirm Modal */}
{confirmModal.open && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-sm border border-gray-200 dark:border-gray-700 animate-fade-in">
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4a2 2 0 012 2v2H7V5a2 2 0 012-2zm0 0V3m0 2v2" /></svg>
        Confirm Delete
      </h3>
      <p className="mb-6 text-gray-600 dark:text-gray-300 text-base">
        Are you sure you want to delete this <span className="capitalize font-semibold">{confirmModal.type}</span>? <span className="font-bold text-gray-900 dark:text-gray-100">{confirmModal.name}</span>?
        {confirmModal.type === 'folder' && (
          <span className="block text-xs text-red-500 mt-2">All files inside will be deleted.</span>
        )}
      </p>
      <div className="flex justify-end gap-2 mt-4">
        <button
          className="px-5 py-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-2 focus:ring-blue-400 shadow transition active:scale-95"
          onClick={closeConfirmModal}
          type="button"
        >
          Cancel
        </button>
        <button
          className="px-5 py-2 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 focus:ring-2 focus:ring-red-400 shadow transition active:scale-95 flex items-center gap-2"
          onClick={() => { closeConfirmModal(); confirmModal.onConfirm && confirmModal.onConfirm(); }}
          type="button"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4a2 2 0 012 2v2H7V5a2 2 0 012-2zm0 0V3m0 2v2" /></svg>
          Delete
        </button>
      </div>
    </div>
  </div>
)}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white transition-all ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
          {toast.message}
        </div>
      )}
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
      </footer>
    </div>
  );
}