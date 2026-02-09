"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type CategoryDropdownProps = {
  options: string[];
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  label?: string;
  buttonClassName?: string;
  listClassName?: string;
};

export function CategoryDropdown({
  options,
  values,
  onChange,
  placeholder,
  label = "Category",
  buttonClassName,
  listClassName,
}: CategoryDropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return options.filter((opt) => opt.toLowerCase().includes(q));
  }, [options, query]);

  const handleSelect = (opt: string) => {
    const next = values.includes(opt)
      ? values.filter((item) => item !== opt)
      : [...values, opt];
    onChange(next);
  };

  const removeSelected = (opt: string) => {
    onChange(values.filter((item) => item !== opt));
  };

  const labelText = values.length
    ? values.length === 1
      ? values[0]
      : `${values[0]} +${values.length - 1}`
    : placeholder || "Select services";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between gap-3 rounded-[12px] border border-neutral-border bg-white px-4 py-3 text-[13px] text-black ${buttonClassName ?? ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-[4px] border border-neutral-border" />
          <span>{labelText}</span>
        </div>
        <span className="text-neutral-muted">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {open ? (
        <div className={`absolute left-0 top-[calc(100%+8px)] z-20 w-full rounded-[12px] border border-neutral-border bg-white p-3 shadow-lg ${listClassName ?? ""}`}>
          <div className="flex items-center justify-between text-[11px] text-neutral-muted">
            <span>{label}</span>
            <span>Category</span>
          </div>
          <div className="mt-2 flex items-center gap-2 rounded-[10px] border border-neutral-border bg-[#f8f8f7] px-3 py-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            </svg>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={placeholder || "Search services..."}
              className="w-full bg-transparent text-[12px] text-black placeholder:text-neutral-muted focus:outline-none"
              ref={inputRef}
            />
          </div>
          {values.length ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {values.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => removeSelected(opt)}
                  className="flex items-center gap-2 rounded-[14px] border border-[#d7f2e3] bg-[#dbf7e5] px-3 py-1 text-[11px] text-black"
                >
                  {opt}
                  <span aria-hidden>×</span>
                </button>
              ))}
            </div>
          ) : null}
          <ul className="mt-2 max-h-[220px] overflow-auto text-[12px]">
            {filtered.map((opt) => (
              <li key={opt}>
                <button
                  type="button"
                  onClick={() => handleSelect(opt)}
                  className={`flex w-full items-center justify-between rounded-[8px] px-3 py-2 text-left ${
                    values.includes(opt) ? "bg-[#dbf7e5] text-black" : "hover:bg-[#f8f8f7]"
                  }`}
                >
                  <span>{opt}</span>
                  {values.includes(opt) ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
