"use client";

import { useState, useCallback } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

interface BlobItem {
  name: string;
  blob: Blob;
}

export function useGuestZipDownload() {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleZipDownload = useCallback(async (items: BlobItem[]) => {
    if (items.length === 0) return;
    setIsDownloading(true);

    try {
      const zip = new JSZip();

      for (const { name, blob } of items) {
        const ext = blob.type.includes("jpeg") ? "jpg" : "png";
        zip.file(`${name}.${ext}`, blob);
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "certificates.zip");
    } finally {
      setIsDownloading(false);
    }
  }, []);

  return { handleZipDownload, isDownloading };
}
