import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
  resetJsonData: () => void;
}

export default function CombineData({
  data,
  onCombine,
  resetJsonData,
}: CombineDataProps) {
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [combinedData, setCombinedData] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [originalData, setOriginalData] = useState<any[]>([]);

  useEffect(() => {
    if (data && data.length > 0) {
      // Check if data is available
      setOriginalData(data); // Set originalData only if data is available

    }
  }, [data]);

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
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedColumns([]);
    setCombinedData([]);
    resetJsonData();
  };

  return (
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

              <Button onClick={handleClear} size="full" variant="ghost">
                Reset
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
