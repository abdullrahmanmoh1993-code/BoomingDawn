import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="font-display text-6xl sm:text-8xl font-medium text-accent mb-4">
          404
        </h1>
        <p className="font-display text-2xl font-medium mb-4">
          Page Not Found
        </p>
        <p className="text-muted mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Button size="lg">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}
