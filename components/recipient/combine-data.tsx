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
    <Card className="h-full bg-transparent">
      <CardHeader className="p-2">
        <CardTitle className="font-bold text-sm ">Display Columns:</CardTitle>
        <CardDescription className="text-xs">
          Select Column Names to Display
        </CardDescription>
      </CardHeader>
      <CardContent className="p-2">
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="name" className="text-xs">
              Name
            </Label>
            <ScrollArea className="h-48 p-2 w-full rounded-md border">
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
          </div>
          <div className="flex flex-col space-y-1.5">
            <CardFooter className="flex flex-col gap-4">
              <Button onClick={handleCombine} size="full" variant="outline">
                Combine Data
              </Button>

              <Button onClick={handleSet} size="full" variant="outline">
                Set Data
              </Button>
            </CardFooter>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
