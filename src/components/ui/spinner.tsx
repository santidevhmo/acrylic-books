import { LoaderCircle } from "lucide-react";

interface SpinnerProps {
  className?: string;
}

export function Spinner({ className = "" }: SpinnerProps) {
  return (
    <LoaderCircle
      aria-label="Loading"
      role="status"
      className={`size-4 animate-spin ${className}`}
    />
  );
}
