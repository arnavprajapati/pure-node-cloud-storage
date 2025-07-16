import { useEffect, useState } from "react";

function App() {
  const [directoryItems, setDirectoryItems] = useState([]);
  const [progress, setProgress] = useState(0)
  const [newFileName, setNewFileName] = useState("")



  async function getDirectoryItems() {
    const response = await fetch("http://192.168.21.114/");
    const data = await response.json();
    setDirectoryItems(data);
  }

  async function onHandleChange(e) {
    const file = await e.target.files[0]
    console.log(file);
    const xhr = new XMLHttpRequest()
    xhr.open("POST", "http://192.168.21.114", true)
    xhr.setRequestHeader("filename", file.name)
    xhr.addEventListener("load", () => {
      console.log(xhr.response);
      getDirectoryItems()
    })
    xhr.upload.addEventListener("progress", (e) => {
      const totalProgress = (e.loaded / e.total) * 100
      console.log((`${totalProgress.toFixed(2)} % Uploaded`));
      setProgress(`${totalProgress.toFixed(2)} % Uploaded`)
    })
    xhr.send(file)
  }

  async function handleDelete(fileName) {
    const response = await fetch('http://192.168.21.114/', {
      method: "DELETE",
      body: fileName
    })
    const data = await response.text()
    console.log(data);
    getDirectoryItems()
  }

  async function renameFile(oldFileName) {
    console.log({ oldFileName, newFileName });
    setNewFileName(oldFileName)
  }

  async function saveFile(oldFileName) {

    setNewFileName(oldFileName)
    console.log({ oldFileName, newFileName });

    const response = await fetch('http://192.168.21.114/', {
      method: "PATCH",
      body: JSON.stringify({ oldFileName, newFileName })
    })
    const data = await response.text()
    console.log(data);
    getDirectoryItems()
    setNewFileName("")

  }

  useEffect(() => {
    getDirectoryItems();
  }, []);


  return (
    <>
      <h1 className="text-2xl font-bold mb-4">My Files</h1>
      <input type="file" onChange={(e) => {
        onHandleChange(e);
      }} />
      <input type="text" onChange={(e) =>
        setNewFileName(e.target.value)
      } value={newFileName} />
      <p>Progress: {progress}</p>
      <div className="space-y-2">
        {directoryItems.map((items, i) => (
          <div key={i}>
            {items}{" "}
            <a href={`http://192.168.21.114/${items}?action=open`} className="text-black">
              Open
            </a>{" "}
            <a href={`http://192.168.21.114/${items}?action=download`} className="text-blue-600">
              Download
            </a>
            <button onClick={() => {
              renameFile(items)
            }}>Rename</button>
            <button onClick={() => {
              saveFile(items)
            }}>Save</button>
            <button onClick={() => {
              handleDelete(items)
            }}>Delete</button>
            <br />
          </div>
        ))}
      </div>
    </>
  );
}
export default App;