"use client";
import Certificate from "./../app/public/images/certificate.jpg";


export default function Header() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="flex flex-col gap-8 w-auto">
        <p className="text-3xl xl:text-5xl !leading-tight font-bold  text-left">
          Sign in ka muna
        </p>
      </div>
      <div className="p-4">
        <img src={Certificate.src} alt="Certificate" className="w-full" />
      </div>
    </div>
  );
}
