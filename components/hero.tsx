"use client";
import Certificate from "./../app/public/images/certificate.jpg";
import GenerateCertificate from "./generate-certificate";
import SendEmail from "./send-email";

export default function Header() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="flex flex-col gap-8 w-auto">
        <p className="text-3xl xl:text-5xl !leading-tight font-bold  text-left">
          Generate certificates and email them in bulk 🚀 in minutes.
        </p>
        <p className="xl:text-2xl text-lg font-medium">
          Create/Edit & Send Certificates in Bulk with Ease!
        </p>

        <div className="flex lg:flex-row flex-col gap-4 mt-6">
          <GenerateCertificate />
          <SendEmail />
        </div>
      </div>
      <div className="p-4">
        <img src={Certificate.src} alt="Certificate" className="w-full" />
      </div>
    </div>
  );
}
