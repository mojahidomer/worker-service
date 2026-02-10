import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

const imgMikeReynolds = "https://www.figma.com/api/mcp/asset/3fada178-0213-40d6-8869-20a789cf7237";
const imgPlumbingWork1 = "https://www.figma.com/api/mcp/asset/e1096468-deb1-4cad-9422-e8ed1d5b3808";
const imgPlumbingWork2 = "https://www.figma.com/api/mcp/asset/b45f0900-5992-4517-be24-be833325a801";
const imgReviewAvatar1 = "https://www.figma.com/api/mcp/asset/1eaa0477-e180-445e-b712-a61c0bd35b14";
const imgReviewAvatar2 = "https://www.figma.com/api/mcp/asset/ebfd28bf-245c-400a-b253-424f7b10c8c2";

const payTypeSuffix: Record<string, string> = {
  HOURLY: "/hr",
  DAILY: "/day",
  WEEKLY: "/week",
  MONTHLY: "/month",
};

const reviews = [
  {
    name: "Sarah Jenkins",
    time: "2 days ago",
    rating: 5,
    avatar: imgReviewAvatar1,
    text:
      "Mike was fantastic. He arrived on time, fixed the leak under my sink in under an hour, and left the place spotless. Highly recommended!",
  },
  {
    name: "David Rodriguez",
    time: "1 week ago",
    rating: 4,
    avatar: imgReviewAvatar2,
    text:
      "Good work, but arrived a bit later than the scheduled window. The repair quality is solid though.",
  },
];

export default async function WorkerDetailsPage({ params }: { params: { workerId: string } }) {
  const isDemo = params.workerId === "demo";
  const worker = isDemo
    ? {
        id: "demo",
        name: "Mike Reynolds",
        skills: ["Leak Detection", "Pipe Repair", "Water Heater Installation", "Drain Cleaning"],
        rating: 4.9,
        totalReviews: 128,
        experienceYears: 12,
        pricePerService: 85,
        payType: "HOURLY",
        workDescription:
          "Hi, I'm Mike! I've been a licensed plumber in the Bay Area for over 12 years. I specialize in residential plumbing, from emergency leak repairs to full bathroom renovations.",
        address: { city: "San Francisco", state: "CA" },
      }
    : await prisma.worker.findUnique({
        where: { id: params.workerId },
        include: { address: true },
      });

  if (!worker) notFound();

  const location = worker.address
    ? `${worker.address.city}${worker.address.state ? `, ${worker.address.state}` : ""}`
    : "—";
  const paySuffix = payTypeSuffix[worker.payType] ?? "/hr";

  return (
    <div className="bg-white">
      <nav className="w-full border-b border-[#e8e8e8] bg-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 pb-[17px] pt-[16px] sm:px-12 lg:px-[48px]">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-brand-green" />
            <span className="text-[20px] font-bold text-black">LocalPros</span>
          </Link>
          <div className="hidden items-center gap-8 text-[14px] text-neutral-muted md:flex">
            <Link href="/find" className="text-black">Find Services</Link>
            <Link href="#">My Bookings</Link>
            <Link href="#">Messages</Link>
            <div className="flex h-8 w-8 items-center justify-center rounded-[16px] bg-[#e8e8e8]" />
          </div>
        </div>
      </nav>

      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-10 px-6 py-10 sm:px-12 lg:px-[24px] lg:flex-row">
        <div className="flex w-full flex-col gap-6 lg:w-[652px]">
          <div className="rounded-[12px] border border-[#e8e8e8] bg-[#fbfaf9] p-[25px]">
            <div className="flex flex-col gap-6 md:flex-row md:items-start">
              <div className="h-[100px] w-[100px] overflow-hidden rounded-full border-4 border-[#e8e8e8]">
                <img src={imgMikeReynolds} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 rounded-[8px] bg-[#eff6ff] px-2 py-1 text-[12px] font-medium text-[#00c444]">
                  Background Checked
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <h1 className="text-[28px] font-bold text-black">{worker.name}</h1>
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#dbf7e5] text-[12px] text-brand-green">
                    ✓
                  </span>
                </div>
                <p className="text-[16px] text-neutral-muted">
                  {worker.skills?.[0] ?? "Service Pro"} • License #PLM-93821
                </p>

                <div className="mt-4 border-t border-[#e8e8e8] pt-4">
                  <div className="flex flex-wrap items-center gap-6 text-[14px] text-neutral-muted">
                    <span className="flex items-center gap-2">
                      ⭐ <strong className="text-black">{worker.rating.toFixed(1)}</strong> ({worker.totalReviews} reviews)
                    </span>
                    <span className="flex items-center gap-2">
                      ⏱ <strong className="text-black">{worker.experienceYears}</strong> Yrs Experience
                    </span>
                    <span className="flex items-center gap-2">📍 {location}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[12px] border border-[#e8e8e8] bg-[#fbfaf9] p-[25px]">
            <h2 className="text-[18px] font-semibold text-black">About {worker.name.split(" ")[0]}</h2>
            <p className="mt-3 text-[15px] leading-[24px] text-[#334155]">
              {worker.workDescription ||
                "Licensed pro with years of experience delivering reliable, high-quality service and guaranteed workmanship."}
            </p>
          </div>

          <div className="rounded-[12px] border border-[#e8e8e8] bg-[#fbfaf9] p-[25px]">
            <h2 className="text-[18px] font-semibold text-black">Services & Skills</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {worker.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-[8px] border border-[#e8e8e8] bg-[#dbf7e5] px-3 py-1 text-[13px] font-medium text-black"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[12px] border border-[#e8e8e8] bg-[#fbfaf9] p-[25px]">
            <h2 className="text-[18px] font-semibold text-black">Recent Work</h2>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="h-[140px] overflow-hidden rounded-[8px] bg-[#e8e8e8]">
                <img src={imgPlumbingWork1} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="h-[140px] overflow-hidden rounded-[8px] bg-[#e8e8e8]">
                <img src={imgPlumbingWork2} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="h-[140px] rounded-[8px] bg-[#e8e8e8]" />
            </div>
          </div>

          <div className="rounded-[12px] border border-[#e8e8e8] bg-[#fbfaf9] p-[25px]">
            <h2 className="text-[18px] font-semibold text-black">Reviews ({worker.totalReviews})</h2>
            <div className="mt-4 divide-y divide-[#e8e8e8]">
              {reviews.map((review) => (
                <div key={review.name} className="py-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img src={review.avatar} alt="" className="h-8 w-8 rounded-[16px]" />
                      <div>
                        <p className="text-[14px] font-semibold text-black">{review.name}</p>
                        <p className="text-[12px] text-neutral-muted">{review.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[12px] text-brand-green">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <span key={idx}>{idx < review.rating ? "★" : "☆"}</span>
                      ))}
                    </div>
                  </div>
                  <p className="mt-3 text-[14px] leading-[22px] text-[#334155]">{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="w-full lg:w-[360px] lg:sticky lg:top-24">
          <div className="rounded-[12px] border border-[#e8e8e8] bg-[#fbfaf9] p-6 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="flex items-end justify-between">
              <div className="text-[24px] font-bold text-black">
                ₹{worker.pricePerService}
                <span className="ml-1 text-[14px] text-neutral-muted">{paySuffix}</span>
              </div>
              <span className="rounded-[4px] bg-[#00c444]/15 px-2 py-1 text-[13px] font-semibold text-green-700">
                Available Today
              </span>
            </div>

            <button className="mt-6 w-full rounded-[8px] bg-[#00c444] py-3 text-[14px] font-semibold text-white">
              Book Appointment
            </button>
            <button className="mt-3 w-full rounded-[8px] border border-[#e8e8e8] bg-white py-3 text-[14px] font-semibold text-black">
              Message {worker.name.split(" ")[0]}
            </button>
            <p className="mt-3 text-center text-[13px] text-neutral-muted">
              Typically responds within 15 minutes
            </p>

            <div className="mt-6 rounded-[8px] bg-[#f8fafc] p-4 text-[13px] text-neutral-muted">
              <p className="font-semibold text-neutral-muted">LocalPros Guarantee</p>
              <p>Secure payments & satisfaction protection on every booking.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
