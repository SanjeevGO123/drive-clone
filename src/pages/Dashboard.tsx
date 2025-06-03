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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between bg-white shadow-md px-8 py-4 sticky top-0 z-20">
        <h1 className="text-3xl font-extrabold text-blue-700 tracking-tight select-none">
          My Drive
        </h1>

        <div className="flex items-center gap-4">
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
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                className="text-gray-500 hover:text-gray-700 transition duration-150 focus:outline-none"
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
        </div>
      </header>

      {/* Breadcrumbs */}
      <nav className="bg-white px-8 py-3 flex items-center text-sm text-gray-600 select-none">
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
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Folders</h2>
          {folders.length === 0 ? (
            <p className="italic text-gray-400">No folders available</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {folders.map((folder) => (
                <button
                  key={folder}
                  onClick={() => enterFolder(folder)}
                  className="group flex flex-col items-center justify-center p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  aria-label={`Open folder ${folder}`}
                >
                  <div className="text-6xl text-yellow-400 group-hover:text-yellow-500 transition-colors">
                    📁
                  </div>
                  <span
                    className="mt-3 text-sm font-medium text-gray-700 truncate max-w-full"
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
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Files</h2>
          {filteredFiles.length === 0 ? (
            <p className="italic text-gray-400">No files available</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {filteredFiles.map(({ key, url }) => (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center justify-center p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-green-400"
                  aria-label={`Open file ${key.split("/").pop()}`}
                >
                  <div className="text-6xl text-blue-400 group-hover:text-blue-600 transition-colors">
                    📄
                  </div>
                  <span
                    className="mt-3 text-sm font-medium text-gray-700 truncate max-w-full"
                    title={key.split("/").pop()}
                  >
                    {key.split("/").pop()}
                  </span>
                </a>
              ))}
            </div>
          )}
        </section>

        {/* Upload Status */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Upload Status</h2>
          {uploadQueue.length === 0 ? (
            <p className="italic text-gray-400">No uploads in progress</p>
          ) : (
            <ul className="space-y-3 max-w-xl">
              {uploadQueue.map(({ file, status, errorMsg }) => (
                <li
                  key={file.name}
                  className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-gray-200"
                >
                  <span className="text-gray-800 truncate max-w-[70%]" title={file.name}>
                    {file.name}
                  </span>
                  {status === "uploading" && (
                    <span className="text-blue-600 font-semibold animate-pulse">
                      Uploading...
                    </span>
                  )}
                  {status === "success" && (
                    <span className="text-green-600 font-semibold">Uploaded ✓</span>
                  )}
                  {status === "error" && (
                    <span className="text-red-600 font-semibold" title={errorMsg}>
                      Failed ✗
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
