'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Disable static generation for this route
export const dynamic = 'force-dynamic';

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
} from '../../src/components/dashboard';
import LoadingSkeleton from '../../src/components/dashboard/LoadingSkeleton';
import { Alert, AlertDescription } from '../../src/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

type FileItem = {
  key: string;
  url: string;
};

type FileWithStatus = {
  file: File;
  status: "pending" | "uploading" | "success" | "error";
  errorMsg?: string;
  progress?: number;
};

const API_URL = process.env.REACT_APP_API_URL || "";

export default function DashboardPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string>("");
  const [folders, setFolders] = useState<string[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPrefix, setCurrentPrefix] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadQueue, setUploadQueue] = useState<FileWithStatus[]>([]);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    type: 'file' | 'folder' | null;
    target: string | null;
    onConfirm: (() => void) | null;
    name: string;
  }>({ open: false, type: null, target: null, onConfirm: null, name: '' });
  const [renameModal, setRenameModal] = useState<{ open: boolean; key: string | null }>({ open: false, key: null });
  const [renameValue, setRenameValue] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    
    if (!token || !username) {
      router.push("/login");
      return;
    }
    
    setUserId(username);
  }, [router]);

  const fetchFiles = async (prefix: string, pushState: boolean = true) => {
    try {
      setIsLoading(true);
      setError(null);
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
        window.history.pushState({}, '', `#/` + encodeURIComponent(prefix));
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    
    let prefix = '';
    if (window.location.hash.startsWith('#/')) {
      prefix = decodeURIComponent(window.location.hash.slice(2));
    }
    fetchFiles(prefix, false);
    
    const onPopState = () => {
      let prefix = '';
      if (window.location.hash.startsWith('#/')) {
        prefix = decodeURIComponent(window.location.hash.slice(2));
      }
      fetchFiles(prefix, false);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [userId]);

  const enterFolder = (folderName: string) => {
    fetchFiles(currentPrefix + folderName + "/");
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles: FileWithStatus[] = Array.from(e.target.files).map(
      (file) => ({
        file,
        status: "pending" as const,
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
          ? { ...f, status: "uploading" as const, errorMsg: undefined, progress: 0 }
          : f
      )
    );
    try {
      const token = localStorage.getItem("token");
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
                f.file === fileObj.file ? { ...f, status: "success" as const, progress: 100 } : f
              )
            );
            resolve(null);
          } else {
            setUploadQueue((prev) =>
              prev.map((f) =>
                f.file === fileObj.file ? { ...f, status: "error" as const, errorMsg: "Upload failed" } : f
              )
            );
            reject(new Error("Upload failed"));
          }
        };
        xhr.onerror = () => {
          setUploadQueue((prev) =>
            prev.map((f) =>
              f.file === fileObj.file ? { ...f, status: "error" as const, errorMsg: "Upload error" } : f
            )
          );
          reject(new Error("Upload error"));
        };
        xhr.send(fileObj.file);
      });
    } catch (err: unknown) {
      const error = err as { message?: string };
      setUploadQueue((prev) =>
        prev.map((f) =>
          f.file === fileObj.file
            ? { ...f, status: "error" as const, errorMsg: error.message }
            : f
        )
      );
    }
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return alert("Folder name cannot be empty");

    try {
      const token = localStorage.getItem("token");
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
    } catch (err: unknown) {
      const error = err as { message?: string };
      alert(error.message);
    }
  };

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openDeleteConfirm = (type: 'file' | 'folder', target: string, name: string, onConfirm: () => void) => {
    setConfirmModal({ open: true, type, target, onConfirm, name });
  };
  
  const closeConfirmModal = () => setConfirmModal({ open: false, type: null, target: null, onConfirm: null, name: '' });

  const renameFile = (oldKey: string) => {
    const oldName = oldKey.split('/').pop()!;
    setRenameValue(oldName);
    setRenameModal({ open: true, key: oldKey });
  };
  
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
    } catch (err: unknown) {
      const error = err as { message?: string };
      showToast(error.message || 'Rename failed', 'error');
    } finally {
      setRenameModal({ open: false, key: null });
    }
  };

  const deleteFile = async (fileKey: string) => {
    try {
      const token = localStorage.getItem("token");
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
    } catch (err: unknown) {
      const error = err as { message?: string };
      showToast(error.message || "Failed to delete file", "error");
    }
  };

  const deleteFolder = async (folderName: string) => {
    try {
      const token = localStorage.getItem("token");
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
    } catch (err: unknown) {
      const error = err as { message?: string };
      showToast(error.message || "Failed to delete folder", "error");
    }
  };

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
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return "🖼";
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
      return file.url;
    }

    if (["txt", "md", "json", "js", "css", "html"].includes(ext)) {
      try {
        const response = await fetch(file.url);
        const text = await response.text();
        return text.slice(0, 500) + (text.length > 500 ? "..." : "");
      } catch {
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

  const wrapFileName = (name: string, maxLen = 10) => {
    if (name.length <= maxLen) return name;
    return name.replace(new RegExp(`(.{${maxLen}})`, 'g'), '$1\u200b');
  };

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 flex flex-col font-sans">
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
        username={userId}
      />

      <SelectionToolbar 
        selectedCount={selected.size}
        handleDelete={() => {
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
        
        {isLoading ? (
          <LoadingSkeleton view={viewMode} count={12} />
        ) : (
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

      <ConfirmModal
        isOpen={confirmModal.open}
        type={confirmModal.type}
        name={confirmModal.name}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirmModal}
      />

      <RenameModal
        isOpen={renameModal.open}
        value={renameValue}
        onChange={setRenameValue}
        onConfirm={handleRenameConfirm}
        onCancel={() => setRenameModal({ open: false, key: null })}
      />
      
      <Toast
        message={toast?.message}
        type={toast?.type}
      />

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
          &mdash; Built with Next.js and AWS
        </span>
      </footer>
      
      <UploadStatusBar
        uploadQueue={uploadQueue}
        onClose={() => setUploadQueue([])}
      />
    </div>
  );
}
