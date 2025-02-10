import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

import StarterKit from "@tiptap/starter-kit";
import { useEditor } from "@tiptap/react";




interface EmailCardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmailCard({ isOpen, onClose }: EmailCardProps) {

  if (!isOpen) return null;

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Email Template</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
        
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
