import { useState } from "react";
import { uploadReport } from "../api/upload";

export default function UploadForm({ setResult }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Upload file first");

    setLoading(true);

    try {
      const data = await uploadReport(file);
      setResult(data.analysis);
    } catch (err) {
      alert("Upload failed");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button type="submit">
        {loading ? "Analyzing..." : "Upload & Analyze"}
      </button>
    </form>
  );
}
