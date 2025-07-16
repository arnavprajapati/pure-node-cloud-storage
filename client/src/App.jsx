import { useEffect, useState } from "react";

function App() {
  const [directoryItems, setDirectoryItems] = useState([]);

  async function getDirectoryItems() {
    const response = await fetch("http://192.168.21.114/");
    const data = await response.json();
    setDirectoryItems(data);
  }
  useEffect(() => {
    getDirectoryItems();
  }, []);
  return (
    <>
      <h1 className="text-2xl font-bold mb-4">My Files</h1>
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