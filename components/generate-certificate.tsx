import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CertificateCard } from "./certificate/certificate-card";


export default function GenerateCertificate() {
  const [isCardOpen, setIsCardOpen] = useState<boolean>(false);


  function handleClick() {
    setIsCardOpen(true);
  }

  return (
    <div>
      <Button
        asChild
        size="lg"
        variant={"default"}
        disabled
        className="cursor-pointer"
        onClick={handleClick}
      >
        <p>Generate Certificate </p>
      </Button>
      <CertificateCard
        isOpen={isCardOpen}
        onClose={() => setIsCardOpen(false)}
  
      />
    </div>
  );
}
