import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [status, setStatus] = useState("checking...");

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/health`)
      .then((res) => setStatus(res.data.status))
      .catch(() => setStatus("backend unreachable"));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <p className="text-xl">Backend status: {status}</p>
    </div>
  );
}

export default App;