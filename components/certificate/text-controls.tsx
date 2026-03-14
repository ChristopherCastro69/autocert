"use client";

import { TemplateTextConfig } from "@/types";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";

const FONT_FAMILIES = [
  "Arial",
  "Poppins",
  "Roboto",
  "Pacifico",
  "Times New Roman",
];

interface TextControlsProps {
  config: TemplateTextConfig;
  setFontFamily: (v: string) => void;
  setMaxFontSizePercent: (v: number) => void;
  setFontWeight: (v: TemplateTextConfig["fontWeight"]) => void;
  setFontStyle: (v: TemplateTextConfig["fontStyle"]) => void;
  setTextDecoration: (v: TemplateTextConfig["textDecoration"]) => void;
  setTextColor: (v: string) => void;
  setTextAlign: (v: TemplateTextConfig["textAlign"]) => void;
  setCapitalize: (v: boolean) => void;
}

export function TextControls({
  config,
  setFontFamily,
  setMaxFontSizePercent,
  setFontWeight,
  setFontStyle,
  setTextDecoration,
  setTextColor,
  setTextAlign,
  setCapitalize,
}: TextControlsProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs">Font Family</Label>
        <Select value={config.fontFamily} onValueChange={setFontFamily}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_FAMILIES.map((font) => (
              <SelectItem key={font} value={font}>
                {font}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs">
          Max Font Size ({config.maxFontSizePercent}%)
        </Label>
        <Slider
          className="mt-2"
          min={1}
          max={20}
          step={0.5}
          value={[config.maxFontSizePercent]}
          onValueChange={([v]) => setMaxFontSizePercent(v)}
        />
      </div>

      <div>
        <Label className="text-xs">Style</Label>
        <div className="mt-1 flex gap-1">
          <Button
            variant={config.fontWeight === "bold" ? "default" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={() =>
              setFontWeight(config.fontWeight === "bold" ? "normal" : "bold")
            }
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant={config.fontStyle === "italic" ? "default" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={() =>
              setFontStyle(config.fontStyle === "italic" ? "normal" : "italic")
            }
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant={
              config.textDecoration === "underline" ? "default" : "outline"
            }
            size="icon"
            className="h-8 w-8"
            onClick={() =>
              setTextDecoration(
                config.textDecoration === "underline" ? "none" : "underline"
              )
            }
          >
            <Underline className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div>
        <Label className="text-xs">Text Color</Label>
        <div className="mt-1 flex items-center gap-2">
          <Input
            type="color"
            value={config.textColor}
            onChange={(e) => setTextColor(e.target.value)}
            className="h-8 w-12 cursor-pointer p-0.5"
          />
          <Input
            type="text"
            value={config.textColor}
            onChange={(e) => setTextColor(e.target.value)}
            className="h-8 flex-1 font-mono text-xs"
          />
        </div>
      </div>

      <div>
        <Label className="text-xs">Alignment</Label>
        <div className="mt-1 flex gap-1">
          <Button
            variant={config.textAlign === "left" ? "default" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setTextAlign("left")}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant={config.textAlign === "center" ? "default" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setTextAlign("center")}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant={config.textAlign === "right" ? "default" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setTextAlign("right")}
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="capitalize"
          checked={config.capitalize}
          onCheckedChange={(checked) => setCapitalize(checked === true)}
        />
        <Label htmlFor="capitalize" className="text-xs cursor-pointer">
          Capitalize name
        </Label>
      </div>
    </div>
  );
}
