import React, { useEffect, useState } from "react";

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-700 px-8 py-4 sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-extrabold tracking-tight select-none text-blue-700 dark:text-blue-400">
            My Drive
          </h1>
          {/* Breadcrumbs styled like Google Drive */}
          <nav className="ml-6 flex items-center text-base text-gray-600 dark:text-gray-400 select-none">
            <button
              className="hover:underline font-medium text-blue-600 dark:text-blue-300"
              onClick={() => fetchFiles("")}
              aria-label="Go to root directory"
            >
              Drive
            </button>
            {breadcrumbs.length > 0 && <span className="mx-2">/</span>}
            {breadcrumbs.map(({ name, prefix }, i) => (
              <React.Fragment key={prefix}>
                <button
                  className="hover:underline text-blue-600 dark:text-blue-300"
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
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <button
            className={`px-2 py-1 rounded ${viewMode === 'grid' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300'}`}
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/></svg>
          </button>
          <button
            className={`px-2 py-1 rounded ${viewMode === 'list' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300'}`}
            onClick={() => setViewMode('list')}
            aria-label="List view"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="6" width="16" height="2" rx="1"/><rect x="4" y="11" width="16" height="2" rx="1"/><rect x="4" y="16" width="16" height="2" rx="1"/></svg>
          </button>

          {!isCreatingFolder ? (
            <button
              onClick={() => setIsCreatingFolder(true)}
              className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition duration-150 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Create new folder"
            >
              + New Folder
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <input
                autoFocus
                type="text"
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                onKeyDown={(e) => {
                  if (e.key === "Enter") createFolder();
                  if (e.key === "Escape") {
                    setIsCreatingFolder(false);
                    setNewFolderName("");
                  }
                }}
              />
              <button
                onClick={createFolder}
                className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-150 shadow-md focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setIsCreatingFolder(false);
                  setNewFolderName("");
                }}
                className="text-gray-500 hover:text-gray-700 transition duration-150 focus:outline-none dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="Cancel folder creation"
              >
                ✕
              </button>
            </div>
          )}

          <label
            htmlFor="file-upload"
            className="cursor-pointer px-5 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition duration-150 font-semibold select-none"
          >
            Upload
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
              // Optionally redirect or reload
              window.location.reload();
            }}
            className="px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition duration-150 shadow-md focus:outline-none focus:ring-2 focus:ring-red-400"
            aria-label="Logout"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Toolbar for actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-2 px-8 py-2 bg-blue-50 dark:bg-blue-900 border-b border-blue-200 dark:border-blue-700 sticky top-[72px] z-10">
          <span className="text-blue-700 dark:text-blue-300 font-medium">{selected.size} selected</span>
          <button
            className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
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
            Delete
          </button>
          <button
            className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
            onClick={clearSelection}
          >
            Cancel
          </button>
        </div>
      )}

      <main className="flex-grow max-w-7xl mx-auto px-8 py-6">
        {/* Folders and Files in grid or list view */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {/* Folders */}
            {folders.map((folder) => (
              <div key={folder} className={`relative group rounded-lg shadow-md bg-white dark:bg-gray-700 hover:shadow-lg transition-shadow duration-200 border border-transparent hover:border-blue-400 dark:hover:border-blue-300 ${isSelected(folder) ? 'ring-2 ring-blue-500' : ''}`}
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
                  <div className="absolute right-2 top-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-20 min-w-[120px]">
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFolderOptionsAnchor(null);
                        openDeleteConfirm('folder', folder, folder, () => deleteFolder(folder));
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
                {/* Folder icon and name */}
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="text-6xl text-yellow-400 dark:text-yellow-300 mb-2">📁</div>
                  <span className="truncate max-w-full text-gray-800 dark:text-gray-200 font-medium text-base" title={folder}>{folder}</span>
                </div>
              </div>
            ))}
            {/* Files */}
            {files.map(({ key, url }) => {
              const fileName = key.slice(`${userId}/${currentPrefix}`.length);
              return (
                <div key={key} className={`relative group rounded-lg shadow-md bg-white dark:bg-gray-700 hover:shadow-lg transition-shadow duration-200 border border-transparent hover:border-blue-400 dark:hover:border-blue-300 ${isSelected(key) ? 'ring-2 ring-blue-500' : ''}`}
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
                    <div className="absolute right-2 top-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-20 min-w-[120px]">
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFileOptionsAnchor(null);
                          openDeleteConfirm('file', key, fileName, () => deleteFile(key));
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                  {/* File icon and name */}
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="text-6xl mb-2">{getFileIcon(fileName)}</div>
                    <span className="truncate max-w-full text-gray-800 dark:text-gray-200 font-medium text-base" title={fileName}>{fileName}</span>
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
          <div className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            {/* Header row */}
            <div className="grid grid-cols-12 px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-300">
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
                  <span className="truncate font-medium text-gray-800 dark:text-gray-200" title={folder}>{folder}</span>
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
                        className="w-full text-left px-4 py-2 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFolderOptionsAnchor(null);
                          openDeleteConfirm('folder', folder, folder, () => deleteFolder(folder));
                        }}
                      >
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
                    <span className="truncate font-medium text-gray-800 dark:text-gray-200" title={fileName}>{fileName}</span>
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
                          className="w-full text-left px-4 py-2 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFileOptionsAnchor(null);
                            openDeleteConfirm('file', key, fileName, () => deleteFile(key));
                          }}
                        >
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-sm">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
        Confirm Delete
      </h3>
      <p className="mb-6 text-gray-600 dark:text-gray-300">
        Are you sure you want to delete this {confirmModal.type}? <span className="font-bold">{confirmModal.name}</span>?
        {confirmModal.type === 'folder' && (
          <span className="block text-xs text-red-500 mt-2">All files inside will be deleted.</span>
        )}
      </p>
      <div className="flex justify-end gap-2">
        <button
          className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
          onClick={closeConfirmModal}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
          onClick={() => {
            closeConfirmModal();
            confirmModal.onConfirm && confirmModal.onConfirm();
          }}
        >
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
    </div>
    
  );
}