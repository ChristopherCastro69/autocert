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
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
    >
      <div
        id="modal-content"
        className="bg-white p-4 rounded shadow-lg max-w-lg w-full relative"
      >
        <button
          id="modal-close-button"
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        >
          &times;
        </button>
        <div className="h-96 overflow-y-auto p-2">
          {/* Set a fixed height and make content scrollable */}
          {children}
        </div>
      </div>
    </div>
  );
}
