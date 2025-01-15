import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CertificateCard } from "./certificate-card";

export default function UploadCertificate() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isCardOpen, setIsCardOpen] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      setIsCardOpen(true); // Ensure this is set to true
      console.log("Card should open now");
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
    fileInputRef.current?.click();
  };

  return (
    <div>
      <form onSubmit={handleUpload}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          style={{ display: "none" }}
        />
        <Button
          asChild
          size="lg"
          variant={"default"}
          disabled
          className="cursor-pointer"
          onClick={triggerFileInput}
        >
          <p>Upload Certificate Template</p>
        </Button>
      </form>
      {message && <p>{message}</p>}

      <CertificateCard
        isOpen={isCardOpen}
        onClose={() => setIsCardOpen(false)}
        imageUrl={previewUrl}
      />
    </div>
  );
}
