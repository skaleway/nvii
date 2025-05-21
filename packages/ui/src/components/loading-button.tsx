import { cn } from "@workspace/ui/lib/utils";
import { Loader } from "lucide-react";
import { Button, ButtonProps } from "@workspace/ui/components/button";

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
    <Button
      disabled={loading || disabled}
      className={cn(className)}
      style={{
        display: "grid",
        gridTemplateAreas: "stacked",
      }}
      {...props}
    >
      <span
        className={cn("visible", loading && "invisible")}
        style={{ gridArea: "stacked" }}
      >
        {props.children}
      </span>
      <span
        className={cn(
          "visible flex items-center justify-center",
          !loading && "invisible",
        )}
        style={{ gridArea: "stacked" }}
      >
        <Loader className=" animate-spin size-5" />
      </span>
    </Button>
  );
}
