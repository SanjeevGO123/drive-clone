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
const API_URL = process.env.REACT_APP_API_URL;

export default function Dashboard() {
  const [folders, setFolders] = useState<string[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPrefix, setCurrentPrefix] = useState("");
  const [uploadQueue, setUploadQueue] = useState<FileWithStatus[]>([]);

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
    const newFiles: FileWithStatus[] = Array.from(e.target.files).map((file) => ({ file, status: "pending" }));
    setUploadQueue((prev) => [...prev, ...newFiles]);
    for (const fileObj of newFiles) {
      await uploadFile(fileObj);
    }
    fetchFiles(currentPrefix);
  };

  const uploadFile = async (fileObj: FileWithStatus) => {
    setUploadQueue((prev) =>
      prev.map((f) => (f.file === fileObj.file ? { ...f, status: "uploading", errorMsg: undefined } : f))
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
    <div className="min-h-screen bg-white flex flex-col">
      <header className="shadow-md px-6 py-4 flex justify-between items-center sticky top-0 bg-white z-10">
        <h1 className="text-2xl font-bold text-blue-600">My Drive</h1>
        <label className="cursor-pointer bg-blue-600 text-white px-5 py-2 rounded-md shadow hover:bg-blue-700">
          Upload
          <input type="file" multiple className="hidden" onChange={handleUpload} />
        </label>
      </header>

      <main className="p-6 flex flex-col gap-6 flex-grow max-w-7xl mx-auto w-full">
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <button onClick={() => fetchFiles("")} className="hover:underline font-medium">Drive</button>
          {breadcrumbs.length > 0 && <span>/</span>}
          {breadcrumbs.map(({ name, prefix }, i) => (
            <React.Fragment key={prefix}>
              <button onClick={() => fetchFiles(prefix)} className="hover:underline">
                {name}
              </button>
              {i < breadcrumbs.length - 1 && <span>/</span>}
            </React.Fragment>
          ))}
        </nav>

        <section>
          <h2 className="text-lg font-semibold mb-3">Folders</h2>
          {folders.length === 0 ? (
            <p className="italic text-gray-400">No folders</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {folders.map((folder) => (
                <button
                  key={folder}
                  onClick={() => enterFolder(folder)}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50 hover:bg-blue-50"
                >
                  <span className="text-4xl">📁</span>
                  <span className="mt-2 text-sm truncate w-full text-center">{folder}</span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">Files</h2>
          {filteredFiles.length === 0 ? (
            <p className="italic text-gray-400">No files</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredFiles.map(({ key, url }) => (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50 hover:bg-green-50"
                >
                  <span className="text-4xl">📄</span>
                  <span className="mt-2 text-sm truncate w-full text-center">{key.split("/").pop()}</span>
                </a>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">Upload Status</h2>
          {uploadQueue.length === 0 ? (
            <p className="italic text-gray-400">No uploads yet</p>
          ) : (
            <ul className="space-y-2">
              {uploadQueue.map(({ file, status, errorMsg }) => (
                <li key={file.name} className="flex justify-between items-center border border-gray-200 p-2 rounded shadow-sm">
                  <span className="truncate max-w-xs text-sm">{file.name}</span>
                  <span className="text-sm">
                    {status === "pending" && <span className="text-gray-500">Pending</span>}
                    {status === "uploading" && <span className="text-yellow-600">Uploading...</span>}
                    {status === "success" && <span className="text-green-600">Uploaded ✓</span>}
                    {status === "error" && (
                      <span className="text-red-600" title={errorMsg}>Error ❌</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
