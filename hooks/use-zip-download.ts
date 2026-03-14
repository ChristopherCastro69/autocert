import { useState, useCallback } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

interface ZipItem {
  name: string;
  url: string;
}

export function useZipDownload() {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleZipDownload = useCallback(async (items: ZipItem[]) => {
    if (items.length === 0) return;
    setIsDownloading(true);

    try {
      const zip = new JSZip();

      const blobs = await Promise.all(
        items.map(async (item) => {
          const res = await fetch(item.url);
          return { name: item.name, blob: await res.blob() };
        })
      );

      for (const { name, blob } of blobs) {
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
