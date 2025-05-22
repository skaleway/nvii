import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";

import { cn } from "@workspace/ui/lib/utils";

const iconvVariants = cva(
  "rounded-full border flex items-center justify-center",
  {
    variants: {
      size: {
        default: "!size-9 min-w-9 rounded-md",
        sm: "!size-8 min-w-8",
        lg: "!size-10 min-w-10 rounded-md",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

interface ProfileProps extends VariantProps<typeof iconvVariants> {
  className?: string;
  url?: string;
  name: string;
}

const Profile = ({ className, url, name, size }: ProfileProps) => {
  const twoLettersName = name
    .split("-")
    .map((l) => l[0])
    .join("");

  return (
    <Avatar className={cn(iconvVariants({ size, className }))}>
      <AvatarImage src={url as string} />
      <AvatarFallback className="text-sm font-semibold rounded-md">
        {twoLettersName}
      </AvatarFallback>
    </Avatar>
  );
};

export default Profile;
