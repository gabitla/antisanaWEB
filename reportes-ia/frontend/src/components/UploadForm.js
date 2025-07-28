import React, { useState } from "react";
import axios from "axios";

export default function UploadForm({ onUploadComplete }) {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleChange = (e) => {
    setFiles([...e.target.files]);
    setUploadError("");
    setUploadSuccess(false);
    setUploadProgress(0);
  };

  const handleUpload = async () => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError("");
    setUploadSuccess(false);

    const form = new FormData();
    files.forEach((file) => form.append("file", file));

    try {
      const response = await axios.post("http://localhost:8000/upload/", form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          }
        }
      });
      setIsUploading(false);
      setUploadSuccess(true);
      onUploadComplete && onUploadComplete(response.data); // callback para recargar dashboard
    } catch (err) {
      setIsUploading(false);
      setUploadError(err.response?.data?.error || "Error al subir archivos");
    }
  };

  return (
    <div style={{ marginBottom: "2rem" }}>
      <input
        type="file"
        multiple
        onChange={handleChange}
        disabled={isUploading}
        style={{ marginRight: "1rem" }}
      />
      <button
        onClick={handleUpload}
        disabled={isUploading || files.length === 0}
        style={{
          background: "#4F8DFD",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          padding: "0.5rem 1.1rem",
          cursor: isUploading || files.length === 0 ? "not-allowed" : "pointer"
        }}
      >
        {isUploading ? "Cargando..." : "Subir"}
      </button>
      {isUploading && (
        <div style={{ marginTop: "0.7rem" }}>
          <progress value={uploadProgress} max="100" style={{ width: "200px" }}>{uploadProgress}%</progress>
          <span style={{ marginLeft: "0.5rem" }}>{uploadProgress}%</span>
        </div>
      )}
      {uploadSuccess && <div style={{ color: "green", marginTop: "0.7rem" }}>¡Carga exitosa!</div>}
      {uploadError && <div style={{ color: "red", marginTop: "0.7rem" }}>{uploadError}</div>}
    </div>
  );
}