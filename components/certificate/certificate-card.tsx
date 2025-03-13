import React, { useState, useEffect, useCallback, useMemo } from "react";
import Toolbar from "../toolbar";
import GoogleCert from "./../../app/public/images/gdg-cert.png";
import DefaultCert from "./../../app/public/images/Default.png";

import { Button } from "../ui/button";
import { XIcon } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

import "@fontsource/poppins";
import "@fontsource/roboto";
import "@fontsource/pacifico";

import { createClient } from "@supabase/supabase-js";
import { Label } from "@radix-ui/react-label";
import { Input } from "../ui/input";
import { useUser } from "@/components/context/UserContext";
import { UserProfile } from "../../dto/UserProfilesDTO";
import {
  CertificateDialog,
  UploadSuccessDialog,
  FolderNameDialog,
  ViewCertificatesDialog,
} from "../ui/dialog-component";
import { useTextProperties } from "../../hooks/use-text-properties";
import { useSupabaseCertificates } from "../../hooks/use-supabase-certificates";
import { useImageUpload } from "../../hooks/use-image-upload";
import { useZipDownload } from "../../hooks/use-zip-download";
import { useCertificateProcessor } from "../../hooks/use-certificate-processor";

interface SupabaseData {
  id: number; // Assuming each entry has a unique 'id' field
  name: string;
  email: string;
}
interface CertificateCardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CertificateCard({ isOpen, onClose }: CertificateCardProps) {
  const { user } = useUser();
  const [generatedImage, setGeneratedImage] = useState<string | null>();
  const [imageList, setImageList] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const {
    textProps,
    handleNameChange,
    handleFontSizeChange,
    handleBoldToggle,
    handleItalicToggle,
    handleUnderlineToggle,
    handleFontFamilyChange,
    handleTextColorChange,
    handlePosX,
    handlePosY,
  } = useTextProperties("John Nommensen Duchac");
  const { selectedImage, handleImageUpload } = useImageUpload();
  const [isImageFinal, setIsImageFinal] = useState<boolean>(false);
  const [imageListModal, setImageListModal] = useState<boolean>(false);
  const [isCapitalized, setIsCapitalized] = useState<boolean>(false);
  const [isImageUploaded, setIsImageUploaded] = useState<boolean>(false);
  const [folderName, setFolderName] = useState<string>("");
  const [isFolderNameDialogOpen, setIsFolderNameDialogOpen] =
    useState<boolean>(false);
  const [isViewCertificatesDialogOpen, setIsViewCertificatesDialogOpen] =
    useState<boolean>(false);
  const [nameLists, setNameLists] = useState<string[]>([]);
  const [emailList, setEmailList] = useState<string[]>([]);
  const [supabaseList, setSupabaseList] = useState<SupabaseData[]>([]); // Updated type here

  // Initialize the Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { handleZipDownload } = useZipDownload(imageList, nameLists);
  const {
    isImageUploaded: supabaseCertIsImageUploaded,
    fetchedCertificates: supabaseCertFetchedCertificates,
    uploadCertificates,
    fetchCertificates,
  } = useSupabaseCertificates();

  useEffect(() => {
    if (supabaseList.length > 0) {
      handleNameChange({
        target: { value: supabaseList[0].name },
      } as React.ChangeEvent<HTMLInputElement>);
    }
  }, [user, supabaseList, handleNameChange]);

  // Memoize the font style to avoid recalculating on every render
  const fontStyle = useMemo(() => {
    return `${textProps.isBold ? "bold" : ""} ${textProps.isItalic ? "italic" : ""} ${textProps.fontSize}px '${textProps.selectedFont}', sans-serif`;
  }, [
    textProps.isBold,
    textProps.isItalic,
    textProps.fontSize,
    textProps.selectedFont,
  ]);

  const { processCertificates } = useCertificateProcessor(
    selectedImage,
    textProps,
    fontStyle,
    isImageFinal,
    isCapitalized,
    setGeneratedImage,
    setImageList,
    nameLists,
    handleNameChange,
    setImageListModal
  );


  if (!isOpen) return null;

  const handleDownload = (imageData: string) => {
    const a = document.createElement("a");
    a.href = imageData;
    a.download = `${textProps.name}.png`;
    a.click();
  };

  const handleFinalImage = (final: boolean) => {
    setIsImageFinal(final);
  };

  const handleCapitalization = (final: boolean) => {
    setIsCapitalized(!isCapitalized);
  };

  const handleCertificateUpload = () => {
    uploadCertificates(imageList, folderName, nameLists, setIsImageUploaded);
  };

  const handleCertificateFetch = () => {
    fetchCertificates(folderName, setIsViewCertificatesDialogOpen);
  };

  const handleCertificateDelete = async () => {};

  return (
    <div
      id="modal-overlay"
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
    >
      <div
        id="modal-content"
        className="bg-white p-4 rounded shadow-lg lg:max-w-[1000px] w-full relative"
      >
        <button
          id="modal-close-button"
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        >
          <XIcon className="w-4 h-4" />
        </button>
        <div className="lg:h-[585px] overflow-y-auto w-full p-2 ">
          <div className="grid grid-cols-3 grid-flow-col gap-4">
            <div className="p-2 col-span-2 ">
              {generatedImage ? (
                <img
                  src={generatedImage}
                  alt="Generated Certificate"
                  className="w-full"
                />
              ) : (
                <img
                  src={DefaultCert.src}
                  alt="Certificate"
                  className="w-full"
                />
              )}
              {user && (
                <div className="flex flex-col">
                  <p>Id: {user.id}</p>
                  <p>Name: {user.profile?.full_name}</p>
                  <p>Email: {user.email}</p>
                </div>
              )}
            </div>

            <div className="col-span-1 border border-gray-300 bg-white rounded-lg shadow-sm p-4">
              <div className="items-center justify-center">
                <Toolbar
                  supabaseList={setSupabaseList}
                  setNameLists={setNameLists}
                  setEmailList={setEmailList}
                  nameLists={nameLists}
                  emailList={emailList}
                  handleImageUpload={handleImageUpload}
                  handleNameChange={handleNameChange}
                  handleFontSizeChange={handleFontSizeChange}
                  handleBoldToggle={handleBoldToggle}
                  handleItalicToggle={handleItalicToggle}
                  handleUnderlineToggle={handleUnderlineToggle}
                  handleFontFamilyChange={handleFontFamilyChange}
                  handlePosX={handlePosX}
                  handlePosY={handlePosY}
                  handleTextColorChange={handleTextColorChange}
                  handleFinalImage={handleFinalImage}
                  handleCapitalization={handleCapitalization}
                  isCapitalized={isCapitalized}
                  name={textProps.name}
                  fontSize={textProps.fontSize}
                  selectedFont={textProps.selectedFont}
                  isBold={textProps.isBold}
                  isItalic={textProps.isItalic}
                  isUnderline={textProps.isUnderline}
                  posX={textProps.posX}
                  posY={textProps.posY}
                  textColor={textProps.textColor}
                  isImageFinal={isImageFinal}
                />
              </div>
            </div>
          </div>

          {/* New Row Layout for Buttons and Dialog */}
          {isImageFinal && (
            <div className="flex justify-end gap-2  p-2 mt-2">
              <Button
                asChild
                size="default"
                variant={"secondary"}
                className="cursor-pointer"
                onClick={processCertificates}
              >
                <p>Generate</p>
              </Button>
              <Button
                asChild
                size="default"
                variant={"secondary"}
                disabled={!generatedImage}
                className="cursor-pointer"
                onClick={() => generatedImage && handleDownload(generatedImage)}
              >
                <p>Download</p>
              </Button>
            </div>
          )}

          <CertificateDialog
            imageListModal={imageListModal}
            setImageListModal={setImageListModal}
            imageList={imageList}
            handleZipDownload={handleZipDownload}
            setIsFolderNameDialogOpen={setIsFolderNameDialogOpen}
          />

          <FolderNameDialog
            isFolderNameDialogOpen={isFolderNameDialogOpen}
            setIsFolderNameDialogOpen={setIsFolderNameDialogOpen}
            folderName={folderName}
            setFolderName={setFolderName}
            handleCertificateUpload={handleCertificateUpload}
          />

          <UploadSuccessDialog
            isImageUploaded={isImageUploaded}
            setIsImageUploaded={setIsImageUploaded}
            handleCertificateFetch={handleCertificateFetch}
            handleCertificateDelete={handleCertificateDelete}
          />

          <ViewCertificatesDialog
            isViewCertificatesDialogOpen={isViewCertificatesDialogOpen}
            setIsViewCertificatesDialogOpen={setIsViewCertificatesDialogOpen}
            fetchedCertificates={supabaseCertFetchedCertificates}
          />
        </div>
      </div>
    </div>
  );
}
