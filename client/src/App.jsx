import { useEffect, useState } from "react";

function App() {
  const [directoryItems, setDirectoryItems] = useState([]);
  const [progress, setProgress] = useState(0)


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

  useEffect(() => {
    getDirectoryItems();
  }, []);


  return (
    <>
      <h1 className="text-2xl font-bold mb-4">My Files</h1>
      <input type="file" onChange={(e) => {
        onHandleChange(e);
      }} />
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
          </div>
        ))}
      </div>
    </>
  );
}
export default App;