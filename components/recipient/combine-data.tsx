import { useState } from "react";
import { Button } from "@/components/ui/button";

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
    <div className="text-black space-y-2 gap-4">
      <h3>Select Column Names to Display:</h3>
      <div className="grid grid-cols-3 gap-2">
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
      <div className="flex gap-4">
        <Button onClick={handleCombine} size="full" variant="outline">
          Combine Data
        </Button>

        <Button onClick={handleSet} size="full" variant="outline">
          Set Data
        </Button>
      </div>
    </div>
  );
}
