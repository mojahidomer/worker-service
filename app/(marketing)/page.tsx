import {
  LandingNav,
  HeroSection,
  StatsSection,
  PopularCategoriesSection,
  HowItWorksSection,
  FeaturedProsSection,
  TestimonialsSection,
  TrustSection,
  FaqSection,
  AppDownloadSection,
  ServiceAreasSection,
  CtaSection,
  LandingFooter,
} from "./_components/landing";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col bg-white">
      <LandingNav />
      <HeroSection />
      <StatsSection />
      <PopularCategoriesSection />
      <HowItWorksSection />
      <FeaturedProsSection />
      <TestimonialsSection />
      <TrustSection />
      <FaqSection />
      <AppDownloadSection />
      <ServiceAreasSection />
      <CtaSection />
      <LandingFooter />
    </main>
  );
}
