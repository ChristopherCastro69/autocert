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
    user: { id: string },
    imageList: string[],
    folderName: string,
    nameLists: string[],
    emailList: string[],
    setIsImageUploaded: (value: boolean) => void,
    certificateTemplate: File
  ) => {
    try {
      console.log("Certificate Template:", certificateTemplate);

      const templateDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(certificateTemplate);
      });

      // Convert the data URL to a Blob
      const byteString = atob(templateDataUrl.split(",")[1]);
      const ab = new Uint8Array(byteString.length);
      for (let i = 0; i < byteString.length; i++) {
        ab[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: "image/png" });

      // Upload the Blob to Supabase
      const templateFilePath = `certificates/templates/${folderName}.png`;
      const { error: templateUploadError } = await supabase.storage
        .from("autocert")
        .upload(templateFilePath, blob, {
          cacheControl: "3600",
          upsert: false,
        });

      if (templateUploadError) {
        console.error(
          "Error uploading certificate template:",
          templateUploadError.message
        );
        return;
      }

      // Use templateDataUrl as the template_url
      const templateUrl = templateDataUrl;

      // Insert into Certificates table
      const { data: certificateData, error: certificateInsertError } =
        await supabase
          .from("certificates")
          .insert({
            template_url: templateUrl,
            profile_id: user.id,
          })
          .select();

      if (certificateInsertError) {
        console.error(
          "Error inserting into Certificates table:",
          certificateInsertError.message
        );
        return;
      }

      const certificateId = certificateData[0].id;

      for (let index = 0; index < imageList.length; index++) {
        const imageData = imageList[index];
        const name = nameLists[index];
        const email = emailList[index];

        // Insert into Recipients table
        const { data: recipientData, error: recipientInsertError } =
          await supabase
            .from("recipients")
            .insert({
              certificate_id: certificateId,
              name,
              email,
            })
            .select();

        if (recipientInsertError) {
          console.error(
            "Error inserting into Recipients table:",
            recipientInsertError.message
          );
          continue;
        }

        const recipientId = recipientData[0].id;

        // Convert imageData to Blob
        const byteString = atob(imageData.split(",")[1]);
        const ab = new Uint8Array(byteString.length);
        for (let i = 0; i < byteString.length; i++) {
          ab[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: "image/png" });

        // Upload the generated certificate image
        const filePath = `certificates/${folderName}/${name}.png`;
        const { error: imageUploadError } = await supabase.storage
          .from("autocert")
          .upload(filePath, blob);

        if (imageUploadError) {
          console.error("Error uploading image:", imageUploadError.message);
          continue;
        }

        // Get the public URL of the uploaded image
        const { data: imageUrlData } = supabase.storage
          .from("autocert")
          .getPublicUrl(filePath);
        const imageUrl = imageUrlData.publicUrl;

        // Insert into GeneratedCertificates table
        const { error: generatedCertInsertError } = await supabase
          .from("generatedcertificates")
          .insert({
            recipient_id: recipientId,
            certificate_id: certificateId,
            image_url: imageUrl,
          });

        if (generatedCertInsertError) {
          console.error(
            "Error inserting into GeneratedCertificates table:",
            generatedCertInsertError.message
          );
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
