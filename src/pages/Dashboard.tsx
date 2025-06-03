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
  const [darkMode, setDarkMode] = useState(() => {
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

  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

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
    const newFiles: FileWithStatus[] = Array.from(e.target.files).map((file) => ({
      file,
      status: "pending",
    }));
    setUploadQueue((prev) => [...prev, ...newFiles]);
    for (const fileObj of newFiles) {
      await uploadFile(fileObj);
    }
    fetchFiles(currentPrefix);
  };

  const uploadFile = async (fileObj: FileWithStatus) => {
    setUploadQueue((prev) =>
      prev.map((f) =>
        f.file === fileObj.file ? { ...f, status: "uploading", errorMsg: undefined } : f
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
        prev.map((f) => (f.file === fileObj.file ? { ...f, status: "success" } : f))
      );
    } catch (err: any) {
      setUploadQueue((prev) =>
        prev.map((f) =>
          f.file === fileObj.file ? { ...f, status: "error", errorMsg: err.message } : f
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

  const filteredFiles = files.filter(({ key }) =>
    key.startsWith(`${userId}/${currentPrefix}`) &&
    !key.slice(`${userId}/${currentPrefix}`.length).includes("/")
  );

  const breadcrumbs = currentPrefix
    .split("/")
    .filter(Boolean)
    .map((part, idx, arr) => ({
      name: part,
      prefix: arr.slice(0, idx + 1).join("/") + "/",
    }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-700 px-8 py-4 sticky top-0 z-20">
        <h1 className="text-3xl font-extrabold tracking-tight select-none text-blue-700 dark:text-blue-400">
          My Drive
        </h1>

        <div className="flex items-center gap-4">
          {/* Dark mode toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-3 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-150 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
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

      {/* Breadcrumbs */}
      <nav className="bg-white dark:bg-gray-800 px-8 py-3 flex items-center text-sm text-gray-600 dark:text-gray-400 select-none">
        <button
          className="hover:underline font-medium"
          onClick={() => fetchFiles("")}
          aria-label="Go to root directory"
        >
          Drive
        </button>
        {breadcrumbs.length > 0 && <span className="mx-2">/</span>}
        {breadcrumbs.map(({ name, prefix }, i) => (
          <React.Fragment key={prefix}>
            <button
              className="hover:underline"
              onClick={() => fetchFiles(prefix)}
              aria-label={`Go to folder ${name}`}
            >
              {name}
            </button>
            {i < breadcrumbs.length - 1 && <span className="mx-2">/</span>}
          </React.Fragment>
        ))}
      </nav>

      {/* Main content */}
      <main className="flex-grow max-w-7xl mx-auto px-8 py-6 grid grid-cols-1 gap-10">
        {/* Folders */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Folders</h2>
          {folders.length === 0 ? (
            <p className="italic text-gray-400 dark:text-gray-500">No folders available</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {folders.map((folder) => (
                <button
                  key={folder}
                  onClick={() => enterFolder(folder)}
                  className="group flex flex-col items-center justify-center p-4 rounded-lg bg-white dark:bg-gray-700 shadow-sm dark:shadow-gray-600 hover:shadow-md dark:hover:shadow-gray-500 transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  aria-label={`Open folder ${folder}`}
                >
                  <div className="text-6xl text-yellow-400 dark:text-yellow-300 group-hover:text-yellow-500 dark:group-hover:text-yellow-400 transition-colors">
                    📁
                  </div>
                  <span
                    className="mt-2 truncate max-w-full text-gray-800 dark:text-gray-200 font-medium"
                    title={folder}
                  >
                    {folder}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Files */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Files</h2>
          {files.length === 0 ? (
            <p className="italic text-gray-400 dark:text-gray-500">No files available</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {files.map(({ key, url }) => {
                // Extract file name relative to userId and prefix
                const fileName = key.slice(`${userId}/${currentPrefix}`.length);
                return (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    key={key}
                    className="group flex flex-col items-center justify-center p-4 rounded-lg bg-white dark:bg-gray-700 shadow-sm dark:shadow-gray-600 hover:shadow-md dark:hover:shadow-gray-500 transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    aria-label={`Open file ${fileName}`}
                  >
                    <div className="text-6xl text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors select-none">
                      📄
                    </div>
                    <span
                      className="mt-2 truncate max-w-full text-gray-800 dark:text-gray-200 font-medium"
                      title={fileName}
                    >
                      {fileName}
                    </span>
                  </a>
                );
              })}
            </div>
          )}
        </section>

        {/* Upload Status */}
        {uploadQueue.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Upload Status</h2>
            <ul className="space-y-2">
              {uploadQueue.map(({ file, status, errorMsg }) => (
                <li
                  key={file.name + file.size}
                  className="flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-700 rounded-md shadow-sm dark:shadow-gray-600"
                >
                  <span className="truncate max-w-xs text-gray-800 dark:text-gray-200">
                    {file.name}
                  </span>
                  <span
                    className={`font-semibold ${
                      status === "success"
                        ? "text-green-600 dark:text-green-400"
                        : status === "error"
                        ? "text-red-600 dark:text-red-400"
                        : status === "uploading"
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                    title={errorMsg || undefined}
                  >
                    {status === "pending"
                      ? "Pending"
                      : status === "uploading"
                      ? "Uploading..."
                      : status === "success"
                      ? "Uploaded"
                      : status === "error"
                      ? `Error: ${errorMsg}`
                      : ""}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
