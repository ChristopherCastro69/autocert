import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardContent,
  CardTitle,
  CardHeader,
  CardFooter,
} from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { ChevronsUpDown } from "lucide-react";

interface CombineDataProps {
  data: any[];
  onCombine: (combinedData: any[]) => void;
  onSet: (setData: any[]) => void;
}

export default function CombineData({
  data,
  onCombine,
  onSet,
}: CombineDataProps) {
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [combinedData, setCombinedData] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedName, setSelectedName] = useState<string>("");
  const [selectedEmail, setSelectedEmail] = useState<string>("");

  const handleColumnSelect = (column: string) => {
    setSelectedColumns((prev) =>
      prev.includes(column)
        ? prev.filter((col) => col !== column)
        : [...prev, column]
    );
  };

  const handleCombine = () => {
    const newData = data.map((entry) => {
      const combinedValue = selectedColumns.map((col) => entry[col]).join(" ");
      return { ...entry, combined: combinedValue };
    });
    setCombinedData(newData);
    onCombine(newData);
  };

  const handleSet = () => {
    const setData = data.map((entry) => {
      const filteredEntry = selectedColumns.reduce(
        (acc, col) => {
          acc[col] = entry[col as keyof typeof entry];
          return acc;
        },
        {} as Record<string, unknown>
      );
      return filteredEntry;
    });
    onSet(setData);
  };

  return (
    <Card className="h-96 bg-transparent">
      <CardHeader className="p-2">
        <CardTitle className="font-bold text-sm ">
          {" "}
          Select Column Names to Display
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <div className="grid w-full items-center gap-2">
          <div className="flex flex-col space-y-1">
            <Collapsible
              open={isOpen}
              onOpenChange={setIsOpen}
              className="w-full space-y-2"
            >
              <div className="flex items-center justify-between space-x-4 px-4 border p-1 rounded-sm">
                <h4 className="text-sm font-semibold">Combine Columns</h4>
                <CollapsibleTrigger asChild>
                  <Button variant="typography" size="xs">
                    <ChevronsUpDown className="h-4 w-4" />
                    <span className="sr-only">Toggle</span>
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="space-y-2">
                <ScrollArea className="h-24 p-2 w-full rounded-md border">
                  <div className="flex flex-col overflow-y-auto">
                    {Object.keys(data[0] || {}).map((column) => (
                      <label key={column} className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={selectedColumns.includes(column)}
                          onChange={() => handleColumnSelect(column)}
                        />
                        {column}
                      </label>
                    ))}
                  </div>
                </ScrollArea>
                <div className="flex flex-row gap-2 justify-between">
                  <Button onClick={handleCombine} size="full" variant="ghost">
                    Combine
                  </Button>

                  <Button onClick={handleSet} size="full" variant="ghost">
                    Clear
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

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
                {Object.keys(data[0] || {}).map((column) => (
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
                {Object.keys(data[0] || {}).map((column) => (
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
  );
}
