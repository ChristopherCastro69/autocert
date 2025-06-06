import React, { useState, useEffect, useCallback, useMemo } from "react";
import Toolbar from "../toolbar";
import DefaultCert from "./../../app/public/images/Default.png";

import { Button } from "../ui/button";
import { XIcon } from "lucide-react";

import "@fontsource/poppins";
import "@fontsource/roboto";
import "@fontsource/pacifico";

import { useUser } from "@/components/context/UserContext";
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
import { LoadingSpinner } from "../ui/loading-spinner";

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
  const [supabaseList, setSupabaseList] = useState<SupabaseData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [folderExists, setFolderExists] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

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

  useEffect(() => {
    console.log("Email List:", emailList);
  }, [emailList]);

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
    setImageListModal,
    setIsLoading
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
    if (selectedImage && user && user.id) {
      setIsUploading(true);
      uploadCertificates(
        { id: user.id },
        imageList,
        folderName,
        nameLists,
        emailList,
        () => {
          setIsImageUploaded(true);
          setIsUploading(false);
        },
        selectedImage
      );
      console.log(" user is defined: ", user.id);
    } else {
      console.error("No image selected for upload.");
    }
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
        {isLoading && (
          <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-75 z-10">
            <LoadingSpinner size={48} color="#3498db" speed="0.8s" />
          </div>
        )}
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
              {/* {user ? (
                <div className="flex flex-col">
                  <p>Id: {user.id}</p>
                  <p>Name: {user.profile?.full_name}</p>
                  <p>Email: {user.email}</p>
                </div>
              ) : null} */}
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
            <div className="flex justify-end gap-2 p-2 mt-2">
              {isLoading ? (
                <div className="loader">Loading...</div>
              ) : (
                <>
                  <Button
                    asChild
                    size="default"
                    variant={"secondary"}
                    className="cursor-pointer"
                    onClick={() => {
                      setIsLoading(true);
                      processCertificates();
                    }}
                  >
                    <p>Generate</p>
                  </Button>
                  <Button
                    asChild
                    size="default"
                    variant={"secondary"}
                    disabled={!generatedImage}
                    className="cursor-pointer"
                    onClick={() =>
                      generatedImage && handleDownload(generatedImage)
                    }
                  >
                    <p>Download</p>
                  </Button>
                </>
              )}
            </div>
          )}

          <CertificateDialog
            imageListModal={imageListModal}
            setImageListModal={setImageListModal}
            imageList={imageList}
            handleZipDownload={handleZipDownload}
            setIsFolderNameDialogOpen={setIsFolderNameDialogOpen}
            isUploading={isUploading}
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
            handleZipDownload={handleZipDownload}
          />
        </div>
      </div>
    </div>
  );
}
