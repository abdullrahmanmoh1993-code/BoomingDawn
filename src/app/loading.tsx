export default function Loading() {
  return (
    <div className="min-h-app flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-muted border-t-accent rounded-full animate-spin" role="status" aria-label="Loading" />
    </div>
  );
}
