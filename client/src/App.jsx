import { useEffect, useState } from "react";
import './App.css';
import {
  FileTextIcon,
  UploadIcon,
  Pencil2Icon,
  CheckIcon,
  TrashIcon,
  DownloadIcon,
  EyeOpenIcon,
} from "@radix-ui/react-icons";

function App() {
  const [directoryItems, setDirectoryItems] = useState([]);
  const [progress, setProgress] = useState(0);
  const [newFileName, setNewFileName] = useState("");
  const [showProgress, setShowProgress] = useState(false);

  function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 ** 3) return `${(bytes / (1024 ** 2)).toFixed(1)} MB`;
    return `${(bytes / (1024 ** 3)).toFixed(2)} GB`;
  }


  async function getDirectoryItems() {
    const response = await fetch("http://192.168.21.114/");
    const data = await response.json();
    setDirectoryItems(data);
  }

  function calculateTotalStorage(items) {
    let total = 0;
    for (const item of items) {
      total += item.size;
    }
    return total;
  }

  async function onHandleChange(e) {
    const file = e.target.files[0];
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://192.168.21.114", true);
    xhr.setRequestHeader("filename", file.name);
    setShowProgress(true);
    xhr.upload.addEventListener("progress", (e) => {
      const totalProgress = (e.loaded / e.total) * 100;
      setProgress(totalProgress.toFixed(1));
    });
    xhr.addEventListener("load", () => {
      getDirectoryItems();
      setTimeout(() => {
        setProgress(0);
        setShowProgress(false);
      }, 2000);
    });
    xhr.send(file);
  }

  async function handleDelete(fileName) {
    await fetch("http://192.168.21.114/", {
      method: "DELETE",
      body: fileName,
    });
    getDirectoryItems();
  }

  async function renameFile(oldFileName) {
    setNewFileName(oldFileName);
  }

  async function saveFile(oldFileName) {
    await fetch("http://192.168.21.114/", {
      method: "PATCH",
      body: JSON.stringify({ oldFileName, newFileName }),
    });
    setNewFileName("");
    getDirectoryItems();
  }

  useEffect(() => {
    getDirectoryItems();
  }, []);

  return (
    <div className="min-h-screen bg-[#C8F8F6] p-6 text-gray-900">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold">My Storage	</h1>
          <div className="flex items-center gap-2">
            <span>Storage: {formatFileSize(calculateTotalStorage(directoryItems))}</span>
            <div className="w-8 h-8 bg-[#00AEFF] text-white rounded-full flex items-center justify-center font-bold">
              S
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#00AEFF] hover:bg-[#0095dd] transition text-white rounded shadow cursor-pointer font-semibold">
            <UploadIcon /> Upload File
            <input
              type="file"
              onChange={onHandleChange}
              className="hidden"
            />
          </label>
          <input
            type="text"
            placeholder="Enter new file name"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            className="px-4 py-2 rounded border border-gray-300 shadow-sm flex-1 bg-white placeholder:text-gray-800"
          />
        </div>

        {showProgress && (
          <div className="h-4 w-full bg-[#D2FDFD] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#00AEFF] text-xs text-white flex items-center justify-center font-semibold transition-all duration-300"
              style={{ width: `${progress}%` }}
            >
              {progress}%
            </div>
          </div>
        )}

        <div className="grid grid-cols-12 bg-[#B2F0EC] text-gray-900 px-4 py-2 rounded-t-xl font-semibold text-sm">
          <div className="col-span-4">File name</div>
          <div className="col-span-1">Type</div>
          <div className="col-span-1 text-center">Size</div>
          <div className="col-span-3 text-center">Actions</div>
          <div className="col-span-3 text-center">Options</div>
        </div>

        <div className="bg-white rounded-b-xl shadow divide-y divide-gray-200">
          {directoryItems.map((item, i) => (
            <div
              key={i}
              className="grid grid-cols-12 items-center px-4 py-3 hover:bg-[#E8FEFE] text-sm"
            >
              <div className="col-span-4 flex items-center gap-2 truncate">
                <FileTextIcon className="text-gray-500 shrink-0" />
                <span className="font-medium truncate">{item.name || item}</span>
              </div>
              <div className="col-span-1 text-gray-500">
                {typeof item.type === "object" ? item.type.mime || JSON.stringify(item.type) : item.type}
              </div>
              <div className="col-span-1 text-center text-gray-500">
                {item.size ? formatFileSize(item.size) : "--"}
              </div>
              <div className="col-span-3 ml-3 flex justify-center gap-2">
                <a
                  href={`http://192.168.21.114/${item.name || item}?action=open`}
                  className="flex items-center gap-1 px-3 py-1 bg-white border border-[#00AEFF] text-[#00AEFF] rounded hover:bg-[#f0faff] font-medium transition"
                >
                  <EyeOpenIcon /> Open
                </a>
                <a
                  href={`http://192.168.21.114/${item.name || item}?action=download`}
                  className="flex items-center gap-1 px-3 py-1 bg-white border border-[#00AEFF] text-[#00AEFF] rounded hover:bg-[#f0faff] font-medium transition"
                >
                  <DownloadIcon /> Download
                </a>
              </div>
              <div className="col-span-3 flex justify-center gap-2">
                <button
                  onClick={() => renameFile(item.name || item)}
                  className="bg-[#42EAFF] text-gray-900 px-4 py-2  rounded hover:bg-[#2ac9dc] flex items-center gap-1 cursor-pointer"
                  title="Rename"
                >
                  <Pencil2Icon />
                </button>
                <button
                  onClick={() => saveFile(item.name || item)}
                  className="bg-[#00AEFF] text-white px-4 py-2 rounded hover:bg-[#0095dd] flex items-center gap-1 cursor-pointer"
                  title="Save"
                >
                  <CheckIcon />
                </button>
                <button
                  onClick={() => handleDelete(item.name || item)}
                  className="bg-[#00AEFF] text-white px-4 py-2 rounded hover:bg-[#0095dd] flex items-center gap-1 cursor-pointer"
                  title="Delete"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}

          {directoryItems.length === 0 && (
            <div className="text-center py-20 text-gray-500 text-lg">
              📂 This folder is empty.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
