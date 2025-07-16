import { useEffect, useState } from "react";
import './App.css'

function App() {
  const [directoryItems, setDirectoryItems] = useState([]);
  const [progress, setProgress] = useState(0);
  const [newFileName, setNewFileName] = useState("");

  async function getDirectoryItems() {
    const response = await fetch("http://192.168.21.114/");
    const data = await response.json();
    setDirectoryItems(data);
  }

  async function onHandleChange(e) {
    const file = await e.target.files[0];
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://192.168.21.114", true);
    xhr.setRequestHeader("filename", file.name);
    xhr.addEventListener("load", () => {
      getDirectoryItems();
    });
    xhr.upload.addEventListener("progress", (e) => {
      const totalProgress = (e.loaded / e.total) * 100;
      setProgress(`${totalProgress.toFixed(2)} % Uploaded`);
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
    getDirectoryItems();
    setNewFileName("");
  }

  useEffect(() => {
    getDirectoryItems();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">My Files</h1>
      <div className="flex flex-col md:flex-row gap-6 max-w-7xl mx-auto">

        <div className="w-full mt-24 mr-10 md:w-1/3 p-4 border rounded-lg bg-white shadow h-fit">
          <h2 className="text-xl font-semibold mb-4">Upload & Rename</h2>

          <label className="block mb-4">
            <input
              type="file"
              onChange={onHandleChange}
              className="file:px-4 file:py-2 file:rounded-md file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 w-full"
            />
          </label>

          <input
            type="text"
            placeholder="Enter new file name"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
          />

          <p className="text-sm font-semibold text-green-600">
            Progress: {progress}
          </p>
        </div>

        <div className="w-full md:w-2/3 h-[500px] overflow-y-auto pr-2 space-y-4">
          <h2 className="text-xl font-semibold mb-2">Your Files</h2>

          {directoryItems.map((item, i) => (
            <div
              key={i}
              className="p-4 border rounded-lg shadow-sm bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-2"
            >
              <span className="font-medium text-gray-800">{item}</span>
              <div className="flex flex-wrap gap-3 text-sm">
                <a
                  href={`http://192.168.21.114/${item}?action=open`}
                  className="text-gray-700 underline"
                >
                  Open
                </a>
                <a
                  href={`http://192.168.21.114/${item}?action=download`}
                  className="text-blue-600 underline"
                >
                  Download
                </a>
                <button
                  onClick={() => renameFile(item)}
                  className="text-yellow-600 hover:underline"
                >
                  Rename
                </button>
                <button
                  onClick={() => saveFile(item)}
                  className="text-green-600 hover:underline"
                >
                  Save
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
