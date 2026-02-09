import { prisma } from "../prisma";

const SERVICES = [
  // Core Home Services
  { name: "Plumbing", sortOrder: 1 },
  { name: "Electrician", sortOrder: 2 },
  { name: "Home Cleaning", sortOrder: 3 },
  { name: "Deep Cleaning", sortOrder: 4 },
  { name: "Appliance Repair", sortOrder: 5 },
  { name: "Painting", sortOrder: 6 },
  { name: "Carpentry", sortOrder: 7 },
  { name: "Handyman", sortOrder: 8 },

  // Mechanical & Technical
  { name: "HVAC Repair", sortOrder: 9 },
  { name: "AC Service & Repair", sortOrder: 10 },
  { name: "Refrigerator Repair", sortOrder: 11 },
  { name: "Washing Machine Repair", sortOrder: 12 },
  { name: "TV Repair", sortOrder: 13 },
  { name: "Computer/Laptop Repair", sortOrder: 14 },
  { name: "Mobile Repair", sortOrder: 15 },

  // Construction & Exterior
  { name: "Roofing", sortOrder: 16 },
  { name: "Landscaping", sortOrder: 17 },
  { name: "Gardening", sortOrder: 18 },
  { name: "Pest Control", sortOrder: 19 },
  { name: "Waterproofing", sortOrder: 20 },
  { name: "Tile & Marble Work", sortOrder: 21 },

  // Installation Services
  { name: "Furniture Assembly", sortOrder: 22 },
  { name: "Modular Kitchen Installation", sortOrder: 23 },
  { name: "CCTV Installation", sortOrder: 24 },
  { name: "Solar Panel Installation", sortOrder: 25 },

  // Moving & Transport
  { name: "Packers & Movers", sortOrder: 26 },
  { name: "Local Shifting", sortOrder: 27 },

  // Personal & Lifestyle
  { name: "Salon at Home", sortOrder: 28 },
  { name: "Spa & Massage at Home", sortOrder: 29 },
  { name: "Fitness Trainer", sortOrder: 30 },

  // Events & Media
  { name: "Photographer", sortOrder: 31 },
  { name: "Videographer", sortOrder: 32 },
  { name: "Event Decorator", sortOrder: 33 },

  // Automotive
  { name: "Car Repair", sortOrder: 34 },
  { name: "Bike Repair", sortOrder: 35 },
  { name: "Car Cleaning", sortOrder: 36 },

  // Security & Safety
  { name: "Security Guard", sortOrder: 37 },
  { name: "Fire Safety Inspection", sortOrder: 38 },

  // Misc
  { name: "Interior Designer", sortOrder: 39 },
  { name: "Architect", sortOrder: 40 },
  { name: "Sofa Cleaning", sortOrder: 41 },
  { name: "Carpet Cleaning", sortOrder: 42 },
  { name: "Water Tank Cleaning", sortOrder: 43 },
  { name: "Septic Tank Cleaning", sortOrder: 44 },
  { name: "Drain Cleaning", sortOrder: 45 },

  // Home Improvement
  { name: "False Ceiling Work", sortOrder: 46 },
  { name: "Wallpaper Installation", sortOrder: 47 },
  { name: "Curtain & Blinds Installation", sortOrder: 48 },
  { name: "Floor Polishing", sortOrder: 49 },
  { name: "Granite Work", sortOrder: 50 },

  // Smart Home & IT
  { name: "Smart Home Setup", sortOrder: 51 },
  { name: "WiFi Installation", sortOrder: 52 },
  { name: "Network Cabling", sortOrder: 53 },
  { name: "Printer Repair", sortOrder: 54 },
  { name: "Data Recovery", sortOrder: 55 },

  // Electrical Specialized
  { name: "Generator Repair", sortOrder: 56 },
  { name: "Inverter Installation", sortOrder: 57 },
  { name: "Battery Backup Setup", sortOrder: 58 },
  { name: "EV Charger Installation", sortOrder: 59 },

  // Plumbing Specialized
  { name: "Borewell Service", sortOrder: 60 },
  { name: "Motor Pump Repair", sortOrder: 61 },
  { name: "Pipeline Installation", sortOrder: 62 },
  { name: "Bathroom Fittings", sortOrder: 63 },

  // Outdoor & Property
  { name: "Fence Installation", sortOrder: 64 },
  { name: "Gate Fabrication", sortOrder: 65 },
  { name: "Swimming Pool Cleaning", sortOrder: 66 },
  { name: "Pool Maintenance", sortOrder: 67 },

  // Fabrication & Welding
  { name: "Welding Work", sortOrder: 68 },
  { name: "Steel Fabrication", sortOrder: 69 },
  { name: "Aluminum Work", sortOrder: 70 },

  // Glass & Windows
  { name: "Glass Repair", sortOrder: 71 },
  { name: "Window Installation", sortOrder: 72 },
  { name: "Door Installation", sortOrder: 73 },

  // Logistics & Delivery
  { name: "Courier Service", sortOrder: 74 },
  { name: "Parcel Delivery", sortOrder: 75 },
  { name: "Bike Delivery", sortOrder: 76 },

  // Personal Services
  { name: "Home Tutor", sortOrder: 77 },
  { name: "Music Teacher", sortOrder: 78 },
  { name: "Dance Teacher", sortOrder: 79 },
  { name: "Yoga Instructor", sortOrder: 80 },

  // Health at Home
  { name: "Nurse at Home", sortOrder: 81 },
  { name: "Physiotherapist", sortOrder: 82 },
  { name: "Elder Care", sortOrder: 83 },
  { name: "Baby Care", sortOrder: 84 },

  // Pet Services
  { name: "Pet Grooming", sortOrder: 85 },
  { name: "Dog Training", sortOrder: 86 },
  { name: "Pet Sitting", sortOrder: 87 },

  // Event Support
  { name: "Catering", sortOrder: 88 },
  { name: "DJ Service", sortOrder: 89 },
  { name: "Sound System Rental", sortOrder: 90 },
  { name: "Tent & Stage Setup", sortOrder: 91 },

  // Business Services
  { name: "Accountant", sortOrder: 92 },
  { name: "Tax Consultant", sortOrder: 93 },
  { name: "Legal Advisor", sortOrder: 94 },
  { name: "Document Notary", sortOrder: 95 },

  // Digital Services (local freelancers)
  { name: "Web Developer", sortOrder: 96 },
  { name: "Graphic Designer", sortOrder: 97 },
  { name: "SEO Expert", sortOrder: 98 },
  { name: "Digital Marketing", sortOrder: 99 },
  { name: "Content Writer", sortOrder: 100 }
];


const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export async function seedServiceTypes() {
  for (const service of SERVICES) {
    const slug = slugify(service.name);
    await prisma.serviceType.upsert({
      where: { slug },
      update: { name: service.name, isActive: true, sortOrder: service.sortOrder },
      create: { name: service.name, slug, isActive: true, sortOrder: service.sortOrder },
    });
  }
}
