"use client";

import { Button } from "@nvii/ui/components/button";
import { Check, Copy } from "lucide-react";
import React, { useState } from "react";

const SmallBanner = () => {
  const text = "npm i -g nvii";
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={onCopy}
      className="inline-flex items-center group cursor-pointer mb-6 font-mono select-none  text-sm font-medium gap-2 p-1"
    >
      <span>{text}</span>
      {copied ? (
        <Button
          className="size-6 scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100 hover:bg-transparent"
          variant="ghost"
        >
          <Check className="size-3" />
        </Button>
      ) : (
        <Button
          className="size-6 scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100 hover:bg-transparent"
          variant="ghost"
        >
          <Copy className="size-3" />
        </Button>
      )}
    </div>
  );
};

export default SmallBanner;
