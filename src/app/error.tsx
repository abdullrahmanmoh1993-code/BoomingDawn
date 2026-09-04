"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-app flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="font-display text-4xl font-medium mb-4">
          Something went wrong
        </h1>
        <p className="text-muted mb-8">
          An unexpected error occurred. Please try again.
        </p>
        <Button onClick={reset}>Try Again</Button>
      </div>
    </div>
  );
}
