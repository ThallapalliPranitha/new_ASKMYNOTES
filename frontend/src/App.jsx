import { useState } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("No file uploaded yet.");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const BACKEND_URL = "https://askmynotes-backend-pt6z.onrender.com";

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setUploadStatus("File selected. Click Submit to upload.");
  };

  const uploadFile = async () => {
    if (!file) return;
    setUploadStatus("Uploading...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`${BACKEND_URL}/upload`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();
      setUploadStatus(`Uploaded successfully (${data.text_length} characters extracted).`);
    } catch (err) {
      console.error(err);
      setUploadStatus("Upload failed. Please try again.");
    }
  };

  const askQuestion = async () => {
    const cleanedQuestion = question.trim();

    if (!cleanedQuestion) {
      setError("Please enter a question.");
      setAnswer("");
      return;
    }

    setLoading(true);
    setError("");
    setAnswer("");

    try {
      const response = await fetch(`${BACKEND_URL}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: cleanedQuestion,
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend returned status ${response.status}`);
      }

      const data = await response.json();
      setAnswer(data.answer);
    } catch (err) {
      console.error(err);
      setError(
        "Unable to connect to the backend. Check whether the FastAPI container is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (file) {
      await uploadFile();
    }
    await askQuestion();
  };

  return (
    <main className="page">
      <section className="card">
        <h1>AskMyNotes</h1>
        <p className="subtitle">Chat with your PDF notes using AI-powered retrieval.</p>

        <label className="section-label">Upload your notes (PDF)</label>
        <div className="upload-row">
          <label className="file-button">
            Choose File
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              hidden
            />
          </label>
          <span className="file-name">
            {file ? file.name : "No file chosen"}
          </span>
        </div>
        <p className="upload-status">{uploadStatus}</p>

        <label className="section-label" htmlFor="question">Your question</label>
        <textarea
          id="question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="What do my notes say about..."
          rows="5"
        />

        <div className="submit-row">
          <button onClick={handleSubmit} disabled={loading}>
            {loading ? "Sending..." : "Submit"}
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        <label className="section-label">Answer</label>
        <div className="answer-box">
          {answer || <span className="placeholder">Your answer will appear here...</span>}
        </div>
      </section>
    </main>
  );
}

export default App;