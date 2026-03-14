"use client";

import { TemplateTextConfig } from "@/types";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface PositionControlsProps {
  config: TemplateTextConfig;
  setPosXPercent: (v: number) => void;
  setPosYPercent: (v: number) => void;
  setBoundingBoxWidthPercent: (v: number) => void;
  setBoundingBoxHeightPercent: (v: number) => void;
}

export function PositionControls({
  config,
  setPosXPercent,
  setPosYPercent,
  setBoundingBoxWidthPercent,
  setBoundingBoxHeightPercent,
}: PositionControlsProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs">
          X Position ({config.posXPercent.toFixed(1)}%)
        </Label>
        <Slider
          className="mt-2"
          min={0}
          max={100}
          step={0.5}
          value={[config.posXPercent]}
          onValueChange={([v]) => setPosXPercent(v)}
        />
      </div>

      <div>
        <Label className="text-xs">
          Y Position ({config.posYPercent.toFixed(1)}%)
        </Label>
        <Slider
          className="mt-2"
          min={0}
          max={100}
          step={0.5}
          value={[config.posYPercent]}
          onValueChange={([v]) => setPosYPercent(v)}
        />
      </div>

      <div>
        <Label className="text-xs">
          Bounding Box Width ({config.boundingBoxWidthPercent.toFixed(1)}%)
        </Label>
        <Slider
          className="mt-2"
          min={10}
          max={100}
          step={1}
          value={[config.boundingBoxWidthPercent]}
          onValueChange={([v]) => setBoundingBoxWidthPercent(v)}
        />
      </div>

      <div>
        <Label className="text-xs">
          Bounding Box Height ({config.boundingBoxHeightPercent.toFixed(1)}%)
        </Label>
        <Slider
          className="mt-2"
          min={5}
          max={50}
          step={1}
          value={[config.boundingBoxHeightPercent]}
          onValueChange={([v]) => setBoundingBoxHeightPercent(v)}
        />
      </div>
    </div>
  );
}
