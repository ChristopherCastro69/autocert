// hooks/useSupabaseCertificates.ts
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function useSupabaseCertificates() {
  const [isImageUploaded, setIsImageUploaded] = useState<boolean>(false);
  const [fetchedCertificates, setFetchedCertificates] = useState<string[]>([]);

  const uploadCertificates = async (
    imageList: string[],
    folderName: string,
    nameLists: string[],
    setIsImageUploaded: (value: boolean) => void
  ) => {
    try {
      for (let index = 0; index < imageList.length; index++) {
        const imageData = imageList[index];
        const byteString = atob(imageData.split(",")[1]);
        const ab = new Uint8Array(byteString.length);

        for (let i = 0; i < byteString.length; i++) {
          ab[i] = byteString.charCodeAt(i);
        }

        const blob = new Blob([ab], { type: "image/png" });
        const filePath = `certificates/${folderName}/${nameLists[index]}.png`;

        const { error } = await supabase.storage
          .from("autocert")
          .upload(filePath, blob);

        if (error) {
          console.error("Error uploading image:", error.message);
        } else {
          console.log(`Image uploaded successfully: ${filePath}`);
        }
      }

      setIsImageUploaded(true);
    } catch (error) {
      console.error("Error in uploadCertificates:", error);
    }
  };

  const fetchCertificates = async (
    folderName: string,
    setIsViewCertificatesDialogOpen: (value: boolean) => void
  ) => {
    try {
      const folderPath = `certificates/${folderName}`;
      console.log("Fetching from:", folderPath);

      const { data, error } = await supabase.storage
        .from("autocert")
        .list(folderPath, {
          limit: 100,
          offset: 0,
          sortBy: { column: "name", order: "asc" },
        });

      if (error) {
        console.error("Error fetching certificates:", error.message);
        return;
      }

      if (!data || data.length === 0) {
        console.warn("No certificates found in:", folderPath);
        return;
      }

      const certificateUrls = data
        .filter(
          (file) =>
            file.name.endsWith(".png") ||
            file.name.endsWith(".jpg") ||
            file.name.endsWith(".jpeg")
        )
        .map((file) => {
          const { data } = supabase.storage
            .from("autocert")
            .getPublicUrl(`${folderPath}/${file.name}`);
          return data.publicUrl;
        });

      //   console.log("Fetched URLs:", certificateUrls);
      setFetchedCertificates(certificateUrls);
      setIsViewCertificatesDialogOpen(true); // Open the dialog after fetching
    } catch (error) {
      console.error("Error in fetchCertificates:", error);
    }
  };

  return {
    isImageUploaded,
    fetchedCertificates,
    uploadCertificates,
    fetchCertificates,
  };
}
