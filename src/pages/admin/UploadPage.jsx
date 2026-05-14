import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiUploadFile } from "../../api/upload";
import "./UploadPage.css";


const ACCEPTED = [".json", ".csv"];

const DATA_TYPES = [
  { value: "bolts", label: "Bolt Products" },
  { value: "tests", label: "Test Data" },
  { value: "curves", label: "Curve Data" },
];

const MOCK_TESTS = [
  { id: 1, label: "Test #001 — Static Pull (2024-03-01)" },
  { id: 2, label: "Test #002 — Dynamic Impact (2024-03-15)" },
  { id: 3, label: "Test #003 — Static Pull (2024-04-02)" },
];

function formatSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function UploadPage() {
  const { token } = useAuth();
  const inputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [dataType, setDataType] = useState(null);
  const [testId, setTestId] = useState("");
  const [tests, setTests] = useState([]);
  const [testsLoading, setTestsLoading] = useState(false);

  useEffect(() => {
    if (dataType !== "curves") {
      setTestId("");
      setTests([]);
      return;
    }
    setTestsLoading(true);
    // Public endpoint — no auth header needed (avoids 401 on expired tokens)
    fetch("http://127.0.0.1:8000/api/bolts/tests/")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load tests (${res.status})`);
        return res.json();
      })
      .then((data) => setTests(Array.isArray(data) ? data : []))
      .catch((err) => setError(`Could not load tests: ${err.message}. Please refresh.`))
      .finally(() => setTestsLoading(false));
  }, [dataType, token]);


  function handleFile(f) {
    const ext = "." + f.name.split(".").pop().toLowerCase();
    if (!ACCEPTED.includes(ext)) {
      setError("Only .json and .csv files are accepted.");
      setFile(null);
      return;
    }
    setError("");
    setFile(f);
    setStatus(null);
    setResult(null);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  async function handleUpload() {
    if (!file) return;
    if (dataType === "curves" && !testId) {
      setError("Please select a test to associate with this curve data.");
      return;
    }
    setStatus("uploading");
    setError("");
    try {
      const res = await apiUploadFile(file, dataType, token, testId ? Number(testId) : null);
      setResult(res);
      setStatus("success");
    } catch (err) {
      setError(err.message || "Upload failed");
      setStatus("error");
    }
  }

  function handleReset() {
    setFile(null);
    setStatus(null);
    setResult(null);
    setError("");
  }

  return (
    <div className="up-root">
      <div className="up-header">
        <h1>Upload Data</h1>
        <p>Upload rock bolt testing data in JSON or CSV format for admin review.</p>
      </div>

      {/* Data Type Selection */}
      <div className="up-type-section">
        <p className="up-type-label">Select Data Type</p>
        <div className="up-type-buttons">
          {DATA_TYPES.map((t) => (
            <button
              key={t.value}
              className={`up-type-btn${dataType === t.value ? " active" : ""}`}
              onClick={() => setDataType(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Test Selector — only shown for curves */}
      {dataType === "curves" && (
        <div className="up-type-section">
          <p className="up-type-label">Associate with Test</p>
          {testsLoading ? (
            <span className="up-spinner" />
          ) : (
            <select
              className="up-test-select"
              value={testId}
              onChange={(e) => setTestId(e.target.value)}
            >
              <option value="">— Select a test —</option>
              {tests.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Drop Zone */}
      <div
        className={`up-dropzone${dragging ? " dragging" : ""}${file ? " has-file" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !file && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".json,.csv"
          style={{ display: "none" }}
          onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
        />

        {!file ? (
          <div className="up-dropzone-empty">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M20 27V13M20 13L14 19M20 13L26 19" stroke="#1B98E0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 30h24" stroke="#1B98E0" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <p className="up-drop-text">Drag & drop your file here</p>
            <p className="up-drop-sub">or click to browse</p>
            <div className="up-accepted">Accepted: .json, .csv</div>
          </div>
        ) : (
          <div className="up-file-info">
            <div className="up-file-icon">
              {file.name.endsWith(".csv") ? "CSV" : "JSON"}
            </div>
            <div className="up-file-details">
              <span className="up-file-name">{file.name}</span>
              <span className="up-file-size">{formatSize(file.size)}</span>
            </div>
            <button className="up-remove-btn" onClick={(e) => { e.stopPropagation(); handleReset(); }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="up-error">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <circle cx="7.5" cy="7.5" r="6.5" stroke="#fc8181" strokeWidth="1.4"/>
            <path d="M7.5 4.5v3.2M7.5 10h.01" stroke="#fc8181" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          {error}
        </div>
      )}

      {/* Upload Button */}
      {file && status !== "success" && (
        <button
          className="up-btn"
          onClick={handleUpload}
          disabled={status === "uploading"}
        >
          {status === "uploading" ? (
            <><span className="up-spinner" /> Uploading...</>
          ) : "Upload File"}
        </button>
      )}

      {/* Success */}
      {status === "success" && result && (
        <div className="up-success">
          <div className="up-success-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#68d391" strokeWidth="1.5"/>
              <path d="M8 12l3 3 5-5" stroke="#68d391" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="up-success-info">
            <p className="up-success-title">Upload Successful!</p>
            <p className="up-success-detail">{result.filename} — {result.records_parsed} records parsed</p>
            <p className="up-success-status">Status: Pending Review</p>
          </div>
          <button className="up-again-btn" onClick={handleReset}>Upload Another</button>
        </div>
      )}
    </div>
  );
}
