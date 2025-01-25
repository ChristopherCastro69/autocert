import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

import Papa from "papaparse";
import CombineData from "@/components/recipient/combine-data";
import { RecipientCard } from "./recipient-card";
import { json } from "stream/consumers";

export default function UploadRecipient({
  setDisplayData,
}: {
  setDisplayData: (data: any[]) => void;
}) {
  const [jsonData, setJsonData] = useState<any[]>([]);
  const [message, setMessage] = useState<string>("");
  const [isCardOpen, setIsCardOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      Papa.parse(selectedFile, {
        header: true,
        complete: (results) => {
          setJsonData(results.data);
          setMessage("CSV file parsed successfully!");
          setIsCardOpen(true);
        },
        error: () => {
          setMessage("Failed to parse CSV file.");
        },
      });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleCombine = (combinedData: any[]) => {
    setJsonData(combinedData);
  };

  const handleSet = (setData: any[]) => {
    setDisplayData(setData);
  };

  return (
    <div>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: "none" }}
      />
      <Button
        type="button"
        onClick={triggerFileInput}
        size="full"
        variant="ghost"
      >
        Upload Recipient List
      </Button>

      <RecipientCard isOpen={isCardOpen} onClose={() => setIsCardOpen(false)}>
        <h3 className="text-black">Parsed Data: </h3>
        <div className="h-80 overflow-y-auto p-2 bg-opacity-50 text-black mb-4">
          {jsonData.map((entry, index) => (
            <div key={index} id={`data-entry-${index}`} className="mb-4">
              <strong>ID: {index}</strong>
              <pre>{JSON.stringify(entry, null, 2)}</pre>
            </div>
          ))}
        </div>
        <div className="overflow-y-auto p-2 bg-opacity-50 text-black mb-4  ">
          <CombineData
            data={jsonData}
            onCombine={handleCombine}
            onSet={handleSet}
          />
        </div>
      </RecipientCard>
    </div>
  );
}
