export type TemplateType = "participant" | "volunteer" | "speaker" | "custom";

export interface TemplateTextConfig {
  posXPercent: number;
  posYPercent: number;
  boundingBoxWidthPercent: number;
  boundingBoxHeightPercent: number;
  fontFamily: string;
  maxFontSizePercent: number;
  minFontSizePx: number;
  fontWeight: "normal" | "bold";
  fontStyle: "normal" | "italic";
  textDecoration: "none" | "underline";
  textColor: string;
  textAlign: "center" | "left" | "right";
  capitalize: boolean;
  outputFormat: "png" | "jpeg";
  outputQuality: number;
}

export interface Template {
  id: string;
  event_id: string;
  name: string;
  type: TemplateType;
  template_url: string;
  text_config: TemplateTextConfig;
  created_at: string;
  updated_at: string;
}

export interface CreateTemplateInput {
  event_id: string;
  name: string;
  type?: TemplateType;
  template_url: string;
  text_config?: Partial<TemplateTextConfig>;
}

export interface UpdateTemplateInput {
  name?: string;
  type?: TemplateType;
  text_config?: TemplateTextConfig;
}
