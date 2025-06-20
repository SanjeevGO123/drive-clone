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
  progress?: number; // 0-100
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
  // Rename modal state and input value
  const [renameModal, setRenameModal] = useState<{ open: boolean; key: string | null }>({ open: false, key: null });
  const [renameValue, setRenameValue] = useState("");

  const fetchFiles = async (prefix: string, pushState: boolean = true) => {
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
      if (pushState) {
        // Use hash for simplicity
        window.history.pushState({}, '', `#/` + encodeURIComponent(prefix));
      }
    } catch (err: any) {
      alert(err.message);
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
      // Use XMLHttpRequest for progress
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", fileObj.file.type);
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setUploadQueue((prev) =>
              prev.map((f) =>
                f.file === fileObj.file ? { ...f, progress: percent } : f
              )
            );
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setUploadQueue((prev) =>
              prev.map((f) =>
                f.file === fileObj.file ? { ...f, status: "success", progress: 100 } : f
              )
            );
            resolve(null);
          } else {
            setUploadQueue((prev) =>
              prev.map((f) =>
                f.file === fileObj.file ? { ...f, status: "error", errorMsg: "Upload failed" } : f
              )
            );
            reject(new Error("Upload failed"));
          }
        };
        xhr.onerror = () => {
          setUploadQueue((prev) =>
            prev.map((f) =>
              f.file === fileObj.file ? { ...f, status: "error", errorMsg: "Upload error" } : f
            )
          );
          reject(new Error("Upload error"));
        };
        xhr.send(fileObj.file);
      });
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
      if (!token) throw new Error('Not authenticated');
      const res = await fetch(`${API_URL}/renameFile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId, oldKey, newFilename: newName }),
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

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-8 md:px-16 py-8 md:py-12 w-full">
        {/* Folders and Files in grid or list view */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 sm:gap-8 md:gap-10">
            {/* Folders */}
            {folders.map((folder) => (
              <div key={folder} className={`rainbow-border overflow-hidden relative group rounded-2xl shadow-xl bg-white/80 dark:bg-gray-800/80 hover:shadow-2xl transition-shadow duration-200 ${isSelected(folder) ? 'ring-4 ring-blue-400/60' : ''} min-h-[140px] sm:min-h-[180px] md:min-h-[220px] h-full flex flex-col justify-center items-center backdrop-blur-xl`}
                style={{ minHeight: 140, height: '100%' }}
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
                  style={{ minHeight: 140, height: '100%' }}
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
        )}
      </main>
      {/* File Preview Modal */}
{previewFile && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-xl">
    <div className="bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-2xl max-w-4xl max-h-[90vh] w-full overflow-hidden border border-gray-200 dark:border-gray-700 animate-fade-in backdrop-blur-xl">
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 truncate">
          {previewFile.key.slice(`${userId}/${currentPrefix}`.length)}
        </h3>
        <div className="flex items-center gap-3">
          <a
            href={previewFile.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-full hover:from-blue-600 hover:to-emerald-600 transition-colors text-sm font-semibold shadow"
          >
            Open Original
          </a>
          <button
            onClick={() => setPreviewFile(null)}
            className="text-gray-400 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl rounded-full p-2 transition shadow hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            ✕
          </button>
        </div>
      </div>
      <div className="p-6 overflow-auto max-h-[calc(90vh-8rem)]">
        {previewLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-600 dark:text-gray-400 animate-pulse">Loading preview...</div>
          </div>
        ) : (
          <div>
            {(() => {
              const fileName = previewFile.key.slice(`${userId}/${currentPrefix}`.length);
              const ext = getFileExtension(fileName);
              if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) {
                return (
                  <img
                    src={previewContent || previewFile.url}
                    alt={fileName}
                    className="max-w-full h-auto rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mx-auto"
                  />
                );
              }
              if (ext === "pdf") {
                return (
                  <iframe
                    src={previewFile.url}
                    className="w-full h-96 border rounded-xl shadow-lg"
                    title={fileName}
                  />
                );
              }
              if (["txt", "md", "json", "js", "css", "html"].includes(ext)) {
                return (
                  <pre className="bg-gray-100/80 dark:bg-gray-800/80 p-6 rounded-xl text-base text-gray-800 dark:text-gray-200 whitespace-pre-wrap overflow-auto shadow-inner border border-gray-200 dark:border-gray-700">
                    {previewContent || 'No preview available'}
                  </pre>
                );
              }
              return (
                <div className="text-center py-12">
                  <div className="text-7xl mb-6">{getFileIcon(fileName)}</div>
                  <div className="text-gray-600 dark:text-gray-400 text-lg">
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
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xl">
    <div className="bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-2xl p-10 w-full max-w-md border border-gray-200 dark:border-gray-700 animate-fade-in backdrop-blur-xl">
      <h3 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-3">
        <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4a2 2 0 012 2v2H7V5a2 2 0 012-2zm0 0V3m0 2v2" /></svg>
        Confirm Delete
      </h3>
      <p className="mb-8 text-gray-600 dark:text-gray-300 text-lg">
        Are you sure you want to delete this <span className="capitalize font-semibold">{confirmModal.type}</span>? <span className="font-bold text-gray-900 dark:text-gray-100">{confirmModal.name}</span>?
        {confirmModal.type === 'folder' && (
          <span className="block text-xs text-red-500 mt-2">All files inside will be deleted.</span>
        )}
      </p>
      <div className="flex justify-end gap-3 mt-6">
        <button
          className="px-6 py-2 rounded-full bg-gray-100/80 dark:bg-gray-700/80 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-200/80 dark:hover:bg-gray-600/80 focus:ring-2 focus:ring-blue-400 shadow transition active:scale-95"
          onClick={closeConfirmModal}
          type="button"
        >
          Cancel
        </button>
        <button
          className="px-6 py-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold hover:from-red-600 hover:to-pink-600 focus:ring-2 focus:ring-red-400 shadow transition active:scale-95 flex items-center gap-2"
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

{/* Rename Modal */}
{renameModal.open && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xl">
    <div className="bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-2xl max-w-md w-full p-10 border border-gray-200 dark:border-gray-700 animate-fade-in backdrop-blur-xl">
      <h3 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 mb-6">
        Rename File
      </h3>
      <input
        type="text"
        value={renameValue}
        onChange={(e) => setRenameValue(e.target.value)}
        className="w-full px-5 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 mb-6 text-lg shadow-sm"
        placeholder="Enter new file name"
        autoFocus
      />
      <div className="flex justify-end gap-3">
        <button
          onClick={() => setRenameModal({ open: false, key: null })}
          className="px-6 py-2 rounded-full bg-gray-100/80 dark:bg-gray-700/80 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-200/80 dark:hover:bg-gray-600/80 focus:ring-2 focus:ring-blue-400 shadow transition active:scale-95"
          type="button"
        >
          Cancel
        </button>
        <button
          onClick={handleRenameConfirm}
          className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 text-white font-semibold hover:from-blue-600 hover:to-emerald-600 focus:ring-2 focus:ring-blue-400 shadow transition active:scale-95 flex items-center gap-2"
          type="button"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          Rename
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

      {/* Upload status bar (Google Drive style) */}
{uploadQueue.length > 0 && (
  <div className="fixed bottom-4 right-4 z-50 w-full max-w-xs sm:max-w-sm md:max-w-md">
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-3 animate-fade-in relative">
      <button
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-lg font-bold focus:outline-none"
        onClick={() => setUploadQueue([])}
        aria-label="Close upload status"
        type="button"
      >
        ×
      </button>
      <div className="font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" /></svg>
        Uploads
      </div>
      {uploadQueue.map((f, i) => (
        <div key={i} className="mb-2 last:mb-0">
          <div className="flex items-center justify-between text-xs font-medium mb-1">
            <span className="truncate max-w-[120px] text-gray-700 dark:text-gray-200">{f.file.name}</span>
            <span className="ml-2 text-gray-500 dark:text-gray-400">
              {f.status === 'uploading' && (f.progress !== undefined ? `${f.progress}%` : 'Uploading...')}
              {f.status === 'success' && <span className="text-green-600">Done</span>}
              {f.status === 'error' && <span className="text-red-600">Error</span>}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${f.status === 'success' ? 'bg-green-500' : f.status === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}
              style={{ width: `${f.progress || (f.status === 'success' ? 100 : 0)}%` }}
            ></div>
          </div>
          {f.status === 'error' && f.errorMsg && (
            <div className="text-xs text-red-500 mt-1">{f.errorMsg}</div>
          )}
        </div>
      ))}
    </div>
  </div>
)}
    </div>
  );
}