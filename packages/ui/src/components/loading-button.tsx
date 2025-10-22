import { cn } from "@nvii/ui/lib/utils";
import { Loader } from "lucide-react";
import { Button } from "@nvii/ui/components/button";
import type { ButtonProps } from "@nvii/ui/components/button";

interface LoadingButtonProps extends ButtonProps {
  loading: boolean;
}

export default function LoadingButton({
  loading,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <Button disabled={loading || disabled} className={cn(className)} {...props}>
      <div className="grid grid-cols-1 grid-rows-1 place-items-center">
        <span
          style={{ gridArea: "1 / 1" }}
          className="flex items-center justify-center"
        >
          <Loader
            className={cn(
              "size-4 animate-spin transition-opacity duration-200",
              loading ? "opacity-100" : "opacity-0"
            )}
          />
        </span>

        <span
          className={cn(
            "flex items-center gap-2 transition-opacity duration-200",
            loading ? "opacity-0" : "opacity-100"
          )}
          style={{ gridArea: "1 / 1" }}
        >
          {props.children as React.ReactNode}
        </span>
      </div>
    </Button>
  );
}
