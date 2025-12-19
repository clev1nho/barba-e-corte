import { Hero } from "@/components/landing/Hero";
import { About } from "@/components/landing/About";
import { CategoriesSection } from "@/components/landing/CategoriesSection";
import { GallerySection } from "@/components/landing/GallerySection";
import { BarbersList } from "@/components/landing/BarbersList";
import { HomeCardsSection } from "@/components/landing/HomeCardsSection";
import { TestimonialsList } from "@/components/landing/TestimonialsList";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";
import { useShopSettings } from "@/hooks/useShopSettings";
import { useBarbers } from "@/hooks/useBarbers";
import { useTestimonials } from "@/hooks/useTestimonials";

const Index = () => {
  const { data: settings, isLoading: loadingSettings } = useShopSettings();
  const { data: barbers, isLoading: loadingBarbers } = useBarbers();
  const { data: testimonials, isLoading: loadingTestimonials } = useTestimonials();

  // Show loading state for entire page until settings are loaded
  if (loadingSettings) {
    return (
      <main className="min-h-screen bg-background">
        {/* Neutral loading skeleton - no default content shown */}
        <section className="relative min-h-[90vh] flex items-center justify-center bg-background">
          <div className="absolute inset-0 bg-muted/50 animate-pulse" />
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Hero settings={settings ?? null} isLoading={loadingSettings} />
      <About settings={settings ?? null} />
      <CategoriesSection />
      <GallerySection />
      <BarbersList barbers={barbers ?? []} isLoading={loadingBarbers} />
      <HomeCardsSection />
      <TestimonialsList testimonials={testimonials ?? []} isLoading={loadingTestimonials} />
      <FinalCTA />
      <Footer />
    </main>
  );
};

export default Index;
