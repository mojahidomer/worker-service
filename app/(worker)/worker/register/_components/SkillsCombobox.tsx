"use client";

import { useMemo, useRef, useState } from "react";

type SkillsComboboxProps = {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  error?: string;
};

export function SkillsCombobox({ options, value, onChange, placeholder, error }: SkillsComboboxProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLUListElement | null>(null);

  const normalizedQuery = query.trim();
  const filtered = useMemo(() => {
    const q = normalizedQuery.toLowerCase();
    return options.filter((option) => {
      const matches = option.toLowerCase().includes(q);
      const notSelected = !value.includes(option);
      return matches && notSelected;
    });
  }, [options, normalizedQuery, value]);

  const selectOption = (option: string) => {
    const normalized = option.trim();
    if (!normalized) return;
    if (value.some((item) => item.toLowerCase() === normalized.toLowerCase())) return;
    onChange([...value, normalized]);
    setQuery("");
    setIsOpen(true);
    setActiveIndex(0);
  };

  const removeOption = (option: string) => {
    onChange(value.filter((item) => item !== option));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      setIsOpen(true);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, filtered.length - 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      if (filtered[activeIndex]) {
        selectOption(filtered[activeIndex]);
      }
      return;
    }

    if (event.key === "Escape") {
      setIsOpen(false);
      return;
    }

    if (event.key === "Backspace" && !query && value.length > 0) {
      removeOption(value[value.length - 1]);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-2 rounded-[8px] border border-[#e8e8e8] bg-[#f8f8f7] px-[12px] py-[10px]">
        {value.map((skill) => (
          <button
            type="button"
            key={skill}
            onClick={() => removeOption(skill)}
            className="flex items-center gap-2 rounded-[20px] border border-brand-green bg-brand-green px-[12px] py-[6px] text-[12px] font-medium text-white"
          >
            {skill}
            <span aria-hidden>×</span>
          </button>
        ))}
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
            setActiveIndex(0);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          placeholder={placeholder}
          className="flex-1 min-w-[160px] bg-transparent text-[13.3px] text-black placeholder:text-[#757575] focus:outline-none"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="skills-listbox"
          aria-autocomplete="list"
          aria-activedescendant={filtered[activeIndex] ? `skill-${filtered[activeIndex]}` : undefined}
        />
      </div>

      {isOpen && filtered.length > 0 ? (
        <ul
          ref={listRef}
          id="skills-listbox"
          role="listbox"
          className="mt-2 max-h-[220px] overflow-auto rounded-[12px] border border-[#e8e8e8] bg-white p-2 text-[13px]"
        >
          {filtered.map((option, index) => (
            <li
              key={option}
              id={`skill-${option}`}
              role="option"
              aria-selected={index === activeIndex}
              className={`cursor-pointer rounded-[8px] px-3 py-2 ${
                index === activeIndex ? "bg-[#dbf7e5]" : "hover:bg-[#f8f8f7]"
              }`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectOption(option)}
            >
              {option}
            </li>
          ))}
        </ul>
      ) : null}

      {error ? <span className="mt-2 block text-[12px] text-red-500">{error}</span> : null}
    </div>
  );
}
