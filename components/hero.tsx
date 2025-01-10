"use client";

import { useState } from "react";
import UploadCertificate from "@/components/upload-certificate";
import Certificate from "./../app/public/images/certificate.jpg";
import { Button } from "./ui/button";
import Link from "next/link";

export default function Header() {
  const [showUpload, setShowUpload] = useState(true);

  const handleUploadClick = () => {
    setShowUpload(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="flex flex-col gap-8 w-auto">
        <p className="text-3xl xl:text-5xl !leading-tight font-bold  text-left">
          Generate certificates and email them in bulk 🚀 in minutes.
        </p>
        <p className="xl:text-2xl text-lg font-medium">
          Create/Edit & Send Certificates in Bulk with Ease!
        </p>

        <div className="flex lg:flex-row flex-col gap-2 mt-6">
          <Button
            asChild
            size="lg"
            variant={"outline"}
            disabled
            className="cursor-pointer "
          >
            <Link href="/">Upload Recipient List</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant={"default"}
            disabled
            className="cursor-pointer "
            onClick={handleUploadClick}
          >
            Upload Certificate Template
          </Button>
        </div>
      </div>
      <div className="p-4">
        <img src={Certificate.src} alt="Certificate" className="w-full" />
      </div>

      {showUpload && <UploadCertificate />}
    </div>
  );
}
