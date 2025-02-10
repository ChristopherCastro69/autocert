"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import Tiptap from "./email/tiptap-textarea";

export default function SendEmail() {
  const [content, setContent] = useState("");

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size={"lg"}>
            Send Email
          </Button>
        </DialogTrigger>
        <DialogContent className=" lg:max-w-[800px] max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-md">New message</DialogTitle>

            <div className="space-y-2">
              <Input
                className="h-8 bg-transparent "
                type="recipients"
                placeholder="To:"
              ></Input>
              <Input
                className="h-8 bg-transparent"
                type="subject"
                placeholder="Subject:"
              ></Input>
            </div>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Tiptap onChange={setContent} content={content} />
          </div>
          <DialogFooter>
            <Button variant={"default"}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
