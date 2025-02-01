import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

import Papa from "papaparse";
import CombineData from "@/components/recipient/combine-data";
import { RecipientCard } from "./recipient-card";
import { json } from "stream/consumers";
import { ScrollArea } from "../ui/scroll-area";
import { Card, CardContent, CardDescription, CardTitle } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

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

      <Dialog open={isCardOpen} onOpenChange={() => setIsCardOpen(false)}>
        <DialogContent className="max-w-[800px] max-h-[550px] bg-white">
          <DialogHeader>
            <DialogTitle>Set Certificate Name:</DialogTitle>
          </DialogHeader>
          <div className=" grid grid-cols-3 grid-flow-col gap-2">
            <div className="col-span-2">
              <ScrollArea className="h-96 w-auto p-2 rounded-md border text-black overflow-x-auto">
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
          <DialogFooter>
            <Button
              type="submit"
              variant={"default"}
              size={"sm"}
              onClick={() => handleSet(jsonData)}
            >
              Set Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
