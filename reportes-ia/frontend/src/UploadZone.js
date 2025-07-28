import React, { useState, useRef } from "react";
import styled from "styled-components";
import axios from "axios";
import { FiUploadCloud } from "react-icons/fi";

const DropArea = styled.div`
  border: 2px dashed #4f8dfd;
  border-radius: 16px;
  padding: 2.5rem 1.5rem;
  background: rgba(10, 35, 66, 0.85);
  color: #fff;
  text-align: center;
  margin: 1.5rem auto 2rem auto;
  max-width: 520px;
  transition: border 0.2s;
  ${props => props.isDragging && "border-color: #1abc9c;"}
`;

const SelectButton = styled.label`
  display: inline-block;
  background: #4f8dfd;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 2.5rem;
  cursor: pointer;
  font-size: 1.15rem;
  margin-top: 1rem;
  margin-bottom: 0.3rem;
  transition: background 0.2s;
  &:hover {
    background: #1a70e0;
  }
`;

const FileCount = styled.div`
  color: #e6e6e6;
  margin-bottom: 0.6rem;
  font-size: 1.05rem;
`;

const ProgressBar = styled.progress`
  width: 75%;
  height: 18px;
  margin-bottom: 0.7rem;
`;

const Message = styled.div`
  margin-top: 0.7rem;
  color: ${props => (props.success ? "limegreen" : "crimson")};
  font-weight: 500;
  font-size: 1.07rem;
  text-shadow: 0 1px 6px #0008;
`;

export default function UploadZone({ onUpload }) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef();

  // Handlers
  const handleFiles = files => {
    setSelectedFiles([...files]);
    setUploadSuccess(false);
    setUploadError("");
    setUploadProgress(0);
  };

  const handleDrop = e => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = e => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = e => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileChange = e => {
    handleFiles(e.target.files);
  };

  const handleUpload = async () => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError("");
    setUploadSuccess(false);

    const form = new FormData();
    selectedFiles.forEach(file => form.append("file", file));

    try {
      const response = await axios.post("http://localhost:8000/upload/", form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: progressEvent => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          }
        }
      });
      setIsUploading(false);
      setUploadSuccess(true);
      setUploadProgress(100);
      onUpload && onUpload(response.data);
    } catch (err) {
      setIsUploading(false);
      setUploadError(err.response?.data?.error || "Error al subir archivos");
    }
  };

  // Permitir limpiar archivos si el usuario quiere volver a elegir
  const handleClear = () => {
    setSelectedFiles([]);
    setUploadSuccess(false);
    setUploadError("");
    setUploadProgress(0);
  };

  return (
    <DropArea
      isDragging={isDragging}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      style={{ cursor: "default" }}
      tabIndex={0}
    >
      <FiUploadCloud size={56} style={{ color: "#fff", marginBottom: "0.45rem" }} />
      <div style={{ fontSize: "1.15rem", marginBottom: "0.2rem" }}>
        Arrastra tus archivos de sensores aquí o
      </div>
      <SelectButton htmlFor="file-upload">
        Seleccionar archivos
        <input
          id="file-upload"
          ref={fileInputRef}
          type="file"
          multiple
          style={{ display: "none" }}
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </SelectButton>
      <div style={{ fontSize: "0.95rem", color: "#c9e3ff", marginBottom: "0.5rem" }}>
        (Puedes seleccionar varios archivos .csv a la vez)
      </div>
      {selectedFiles.length > 0 && (
        <FileCount>
          <b>{selectedFiles.length}</b> archivo{selectedFiles.length > 1 ? "s" : ""} seleccionado{selectedFiles.length > 1 ? "s" : ""}
        </FileCount>
      )}
      {isUploading && (
        <>
          <ProgressBar value={uploadProgress} max="100" />
          <div style={{ color: "#fff", fontSize: "1rem" }}>{uploadProgress}%</div>
        </>
      )}
      {!isUploading && selectedFiles.length > 0 && (
        <div>
          <SelectButton
            as="button"
            onClick={handleUpload}
            style={{
              background: "#4f8dfd",
              marginTop: "0.1rem",
              marginBottom: "0.3rem",
              cursor: selectedFiles.length === 0 ? "not-allowed" : "pointer"
            }}
            disabled={selectedFiles.length === 0}
          >
            Subir
          </SelectButton>
          <button
            type="button"
            onClick={handleClear}
            style={{
              marginLeft: "1.2rem",
              background: "none",
              border: "none",
              color: "#ccc",
              textDecoration: "underline",
              fontSize: "1rem",
              cursor: "pointer"
            }}
            disabled={isUploading}
          >
            Limpiar
          </button>
        </div>
      )}
      {uploadSuccess && <Message success>¡Carga exitosa!</Message>}
      {uploadError && <Message>{uploadError}</Message>}
    </DropArea>
  );
}