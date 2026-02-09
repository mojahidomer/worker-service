import Link from "next/link";

const PILLS = [
  { title: "Home Interior", slug: "home-interior", gradient: "from-amber-100 to-orange-200" },
  { title: "Plumbing Service", slug: "plumbing", gradient: "from-sky-100 to-blue-200" },
  { title: "Electrical Service", slug: "electrical", gradient: "from-yellow-100 to-amber-200" },
];

export function CategoryPillsSection() {
  return (
    <section className="px-5 sm:px-8 py-8" aria-labelledby="category-pills-heading">
      <div className="max-w-[1440px] mx-auto">
        <h2 id="category-pills-heading" className="sr-only">
          Quick categories
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-h-[400px] sm:max-h-[320px]">
          {PILLS.map((item) => (
            <Link
              key={item.slug}
              href={`/#services?category=${item.slug}`}
              className={`relative flex-1 min-h-[120px] sm:min-h-[200px] rounded-xl bg-neutral-border overflow-hidden group`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-80 group-hover:opacity-100 transition-opacity`}
              />
              <div className="relative flex items-end p-6 h-full">
                <span className="text-lg font-semibold text-black">{item.title}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
