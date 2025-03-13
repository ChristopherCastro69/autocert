import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,

} from "../ui/dialog";
import { Label } from "./label";
import { Input } from "./input";
import { Button } from "./button";

interface CertificateDialogProps {
  imageListModal: boolean;
  setImageListModal: (open: boolean) => void;
  imageList: string[];
  handleZipDownload: () => void;
  setIsFolderNameDialogOpen: (open: boolean) => void;
}

export const CertificateDialog: React.FC<CertificateDialogProps> = ({
  imageListModal,
  setImageListModal,
  imageList,
  handleZipDownload,
  setIsFolderNameDialogOpen,
}) => (
  <Dialog open={imageListModal} onOpenChange={setImageListModal}>
    <DialogContent className="sm:max-w-[425px] max-h-[500px] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Edit profile</DialogTitle>
        <DialogDescription>
          {imageList.map((imageData, index) => (
            <li key={index}>
              <img
                src={imageData}
                alt={`Image ${index + 1}`}
                className="w-full"
              />
            </li>
          ))}
        </DialogDescription>
      </DialogHeader>

      <DialogFooter>
        <Button type="submit" onClick={handleZipDownload}>
          Download All
        </Button>
        <Button
          type="submit"
          onClick={() => setIsFolderNameDialogOpen(true)}
        >
          Save All
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

interface FolderNameDialogProps {
  isFolderNameDialogOpen: boolean;
  setIsFolderNameDialogOpen: (open: boolean) => void;
  folderName: string;
  setFolderName: (name: string) => void;
  handleCertificateUpload: () => void;
}

export const FolderNameDialog: React.FC<FolderNameDialogProps> = ({
  isFolderNameDialogOpen,
  setIsFolderNameDialogOpen,
  folderName,
  setFolderName,
  handleCertificateUpload,
}) => (
  <Dialog open={isFolderNameDialogOpen} onOpenChange={setIsFolderNameDialogOpen}>
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Name folder</DialogTitle>
        <DialogDescription>
          Add names to your folder here. Click save when you're done.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="folderName" className="text-right">
            Folder Name
          </Label>
          <Input
            id="folderName"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            className="col-span-3"
          />
        </div>
      </div>
      <DialogFooter>
        <Button
          type="submit"
          onClick={() => {
            setIsFolderNameDialogOpen(false);
            handleCertificateUpload();
          }}
        >
          Save changes
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

interface UploadSuccessDialogProps {
  isImageUploaded: boolean;
  setIsImageUploaded: (open: boolean) => void;
  handleCertificateFetch: () => void;
  handleCertificateDelete: () => void;
}

export const UploadSuccessDialog: React.FC<UploadSuccessDialogProps> = ({
  isImageUploaded,
  setIsImageUploaded,
  handleCertificateFetch,
  handleCertificateDelete,
}) => (
  <Dialog open={isImageUploaded} onOpenChange={setIsImageUploaded}>
    <DialogContent className="sm:max-w-[425px] max-h-[500px] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Image Uploaded Successfully!</DialogTitle>
        <DialogDescription>
          Congrats! You have successfully uploaded the certificates to
          supabase!
        </DialogDescription>
      </DialogHeader>

      <DialogFooter>
        <Button type="submit" onClick={handleCertificateFetch}>
          View Certificates
        </Button>
        <Button type="submit" onClick={handleCertificateDelete}>
          Delete
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

interface ViewCertificatesDialogProps {
  isViewCertificatesDialogOpen: boolean;
  setIsViewCertificatesDialogOpen: (open: boolean) => void;
  fetchedCertificates: string[];
}

export const ViewCertificatesDialog: React.FC<ViewCertificatesDialogProps> = ({
  isViewCertificatesDialogOpen,
  setIsViewCertificatesDialogOpen,
  fetchedCertificates,
}) => (
  <Dialog
    open={isViewCertificatesDialogOpen}
    onOpenChange={setIsViewCertificatesDialogOpen}
  >
    <DialogContent className="sm:max-w-[425px] max-h-[500px] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>View Certificates</DialogTitle>
        <DialogDescription>
          {fetchedCertificates.map((url, index) => (
            <li key={index}>
              <img
                src={url}
                alt={`Certificate ${index + 1}`}
                className="w-full"
              />
            </li>
          ))}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button
          type="submit"
          onClick={() => setIsViewCertificatesDialogOpen(false)}
        >
          Close
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
