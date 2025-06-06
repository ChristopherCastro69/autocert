import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

import Papa from "papaparse";
import CombineData from "@/components/recipient/combine-data";
import { ScrollArea } from "../ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { DataSetDialog } from "../ui/dialog-component";
interface SupabaseData {
  id: number; // Assuming each entry has a unique 'id' field
  name: string;
  email: string;
}

interface UploadRecipientProps {
  // setDisplayData: (data: any[]) => void;
  setNameList: (names: string[]) => void;
  setEmailList: (emails: string[]) => void;
  supabaseList: (supabase: SupabaseData[]) => void; // Updated type here
}

export default function UploadRecipient({
  setNameList,
  setEmailList,
  supabaseList,
}: UploadRecipientProps) {
  const [jsonData, setJsonData] = useState<any[]>([]);
  const [originalData, setOriginalData] = useState<any[]>([]);
  const [message, setMessage] = useState<string>("");
  const [isCardOpen, setIsCardOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedName, setSelectedName] = useState<string>("");
  const [selectedEmail, setSelectedEmail] = useState<string>("");
  const [isDataSetDialogOpen, setIsDataSetDialogOpen] =
    useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      Papa.parse(selectedFile, {
        header: true,
        complete: (results) => {
          setJsonData(results.data);
          setOriginalData(results.data);
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
    // Reset state for a clean slate
    setJsonData([]);
    setOriginalData([]);
    setSelectedName("");
    setSelectedEmail("");
    setMessage("");
    setIsCardOpen(false);
    fileInputRef.current?.click();
  };

  const handleCombine = (combinedData: any[]) => {
    setJsonData(combinedData);
  };

  const handleSet = (setData: { [key: string]: string }[]) => {
    if (!selectedName) {
      setMessage("Please select a name column.");
      return;
    }

    // Set nameList based on the selectedName from jsonData, ensuring only strings are included
    const selectedNames: string[] = setData
      .map((entry) => entry[selectedName])
      .filter((name): name is string => typeof name === "string");

    setNameList(selectedNames);

    // Set emailList based on the selectedEmail from jsonData, ensuring only strings are included
    const selectedEmails: string[] = selectedEmail
      ? setData
          .map((entry) => entry[selectedEmail])
          .filter((email): email is string => typeof email === "string")
      : [];

    setEmailList(selectedEmails);

    // Save to supabaseList with corresponding unique IDs
    const supabaseData: SupabaseData[] = setData.map((entry, index) => ({
      id: index, // Assuming each entry has a unique 'id' field
      name: entry[selectedName],
      email: entry[selectedEmail],
    }));

    supabaseList(supabaseData);

    // Open the DataSetDialog
    setIsDataSetDialogOpen(true);
  };

  const resetJsonData = () => {
    setJsonData(originalData);
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
              <Card className="h-96 bg-transparent">
                <CardHeader className="p-2">
                  <CardTitle className="font-bold text-sm ">
                    {" "}
                    Select Column Names to Display
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <div className="grid w-full items-center gap-2">
                    <CombineData
                      data={jsonData}
                      onCombine={handleCombine}
                      resetJsonData={resetJsonData}
                    />

                    <div className="w-full flex flex-col">
                      <span>Set Name:</span>
                      <Select
                        onValueChange={(value) => {
                          setSelectedName(value);
                        }}
                        value={selectedName}
                      >
                        <SelectTrigger className="border rounded p-1">
                          <SelectValue placeholder="Select a column" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(jsonData[0] || {}).map((column) => (
                            <SelectItem key={column} value={column}>
                              {column}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-full flex flex-col">
                      <span>Set Email:</span>
                      <Select
                        onValueChange={(value) => {
                          setSelectedEmail(value);
                        }}
                        value={selectedEmail}
                      >
                        <SelectTrigger className="border rounded p-1">
                          <SelectValue placeholder="Select a column" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem key="none" value="johndoe@gmail.com">
                            None
                          </SelectItem>
                          {Object.keys(jsonData[0] || {}).map((column) => (
                            <SelectItem key={column} value={column}>
                              {column}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
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

      <DataSetDialog
        isDataSetDialogOpen={isDataSetDialogOpen}
        setIsDataSetDialogOpen={(open) => {
          setIsDataSetDialogOpen(open);
          if (!open) {
            setIsCardOpen(false); 
          }
        }}
      />
    </div>
  );
}
