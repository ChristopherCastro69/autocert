import { useState, useRef } from "react";

export default function UploadCertificate() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null); // Create a ref for the file input

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setMessage("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload-certificate", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setMessage("File uploaded successfully!");
        setPreviewUrl(null);
        setFile(null);
      } else {
        setMessage("File upload failed.");
      }
    } catch (error) {
      setMessage("An error occurred during the upload.");
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click(); // Trigger the file input click
  };

  return (
    <div>
      <form onSubmit={handleUpload}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          ref={fileInputRef} // Attach the ref to the input
          style={{ display: "none" }} // Hide the input
        />
        <button type="button" onClick={triggerFileInput}>
          Upload Certificate
        </button>
      </form>
      {previewUrl && (
        <div>
          <h3>Image Preview:</h3>
          <img
            src={previewUrl}
            alt="Image Preview"
            style={{ maxWidth: "300px", marginTop: "10px" }}
          />
        </div>
      )}
      {message && <p>{message}</p>}
    </div>
  );
}
