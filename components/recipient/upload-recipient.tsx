import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

import Papa from "papaparse";
import CombineData from "@/components/recipient/combine-data";
import { RecipientCard } from "./recipient-card";
import { json } from "stream/consumers";
import { ScrollArea } from "../ui/scroll-area";
import { Card, CardContent, CardDescription, CardTitle } from "../ui/card";

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
        <div>
          <div className=" grid grid-cols-3 grid-flow-col gap-2">
            <div className="col-span-2">
              <ScrollArea className="h-80 w-auto p-2 rounded-md border text-black overflow-x-auto">
                <h4 className="mb-4 text-sm font-bold leading-none">
                  Parsed Data:
                </h4>
                {jsonData.map((entry, index) => (
                  <div key={index} id={`data-entry-${index}`} className="mb-4">
                    <strong>ID: {index}</strong>
                    <pre>{JSON.stringify(entry, null, 2)}</pre>
                  </div>
                ))}
              </ScrollArea>
            </div>
            <div className=" col-span-1 ">
              <CombineData
                data={jsonData}
                onCombine={handleCombine}
                onSet={handleSet}
              />
            </div>
          </div>
        </div>
      </RecipientCard>
    </div>
  );
}
