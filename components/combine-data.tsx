import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CombineDataProps {
  data: any[];
  onCombine: (combinedData: any[]) => void;
}

export default function CombineData({ data, onCombine }: CombineDataProps) {
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

  return (
    <div>
      <h3>Select Columns to Combine:</h3>
      <div className="flex flex-wrap gap-2">
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
      <Button onClick={handleCombine} size="lg" variant="outline">
        Combine Data
      </Button>
      {combinedData.length > 0 && (
        <div className="mt-4">
          <h3>Combined Data:</h3>
          <pre>{JSON.stringify(combinedData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
