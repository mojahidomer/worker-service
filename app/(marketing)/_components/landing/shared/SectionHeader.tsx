type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  eyebrow?: string;
};

export function SectionHeader({ title, subtitle, align = "center", eyebrow }: SectionHeaderProps) {
  const alignmentClasses = align === "center" ? "items-center text-center" : "items-start text-left";

  return (
    <div className={`flex flex-col gap-3 ${alignmentClasses}`}>
      {eyebrow ? (
        <span className="text-[12px] uppercase tracking-[1.2px] text-neutral-muted">{eyebrow}</span>
      ) : null}
      <h2 className="text-[32px] font-bold leading-[44px] text-black sm:text-[36px]">{title}</h2>
      {subtitle ? (
        <p className="text-[16px] leading-[24px] text-neutral-muted max-w-[640px]">{subtitle}</p>
      ) : null}
    </div>
  );
}
