import JSZip from "jszip";
import { saveAs } from "file-saver";

export function useZipDownload(imageList: string[], nameLists: string[]) {
  const handleZipDownload = () => {
    const zip = new JSZip();

    imageList.forEach((imageData, index) => {
      const byteString = atob(imageData.split(",")[1]);
      const ab = new Uint8Array(byteString.length);

      for (let i = 0; i < byteString.length; i++) {
        ab[i] = byteString.charCodeAt(i);
      }

      zip.file(`${nameLists[index]}.png`, ab, {
        binary: true,
      });
    });

    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "certificates.zip");
    });
  };

  return { handleZipDownload };
}