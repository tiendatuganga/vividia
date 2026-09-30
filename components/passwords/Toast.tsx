import { CheckCircle2 } from "lucide-react";

export function Toast({ message }: { message: string }) {
  if (!message) return null;

  return (
    <div role="status" aria-live="polite" className="fixed bottom-5 left-1/2 z-[80] flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#2d211b] px-4 py-3 text-sm font-bold text-white shadow-[0_14px_40px_rgba(37,24,18,0.3)]">
      <CheckCircle2 aria-hidden="true" className="size-4 text-[#79a8e4]" />
      <span className="whitespace-nowrap">{message}</span>
    </div>
  );
}
