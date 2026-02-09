"use client";

type LoaderProps = {
  label?: string;
};

export function Loader({ label = "Loading..." }: LoaderProps) {
  return (
    <div className="flex items-center gap-3 rounded-[12px] border border-neutral-border bg-white px-4 py-3 text-[13px] text-neutral-muted shadow-sm">
      <span className="relative flex h-4 w-4">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-green/60" />
        <span className="relative inline-flex h-4 w-4 rounded-full bg-brand-green" />
      </span>
      <span>{label}</span>
    </div>
  );
}
