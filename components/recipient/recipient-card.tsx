import { X } from "lucide-react";
import React from "react";

interface RecipientCardProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function RecipientCard({
  isOpen,
  onClose,
  children,
}: RecipientCardProps) {
  if (!isOpen) return null;

  return (
    <div
      id="modal-overlay"
      className="fixed inset-0 z-50 bg-black/80 flex justify-center items-center"
    >
      <div
        id="modal-content"
        className="bg-white p-6 rounded-lg shadow-lg max-w-[800px] w-full relative text-black"
      >
        <button
          id="modal-close-button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="text-sm text-muted-foreground max-h-[450px] overflow-y-auto p-2 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg text-black">
          {children}
        </div>
      </div>
    </div>
  );
}
