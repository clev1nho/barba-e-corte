import { Hero } from "@/components/landing/Hero";
import { About } from "@/components/landing/About";
import { CategoriesSection } from "@/components/landing/CategoriesSection";
import { GallerySection } from "@/components/landing/GallerySection";
import { BarbersList } from "@/components/landing/BarbersList";
import { TestimonialsList } from "@/components/landing/TestimonialsList";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";
import { useShopSettings } from "@/hooks/useShopSettings";
import { useBarbers } from "@/hooks/useBarbers";
import { useTestimonials } from "@/hooks/useTestimonials";

const Index = () => {
  const { data: settings } = useShopSettings();
  const { data: barbers, isLoading: loadingBarbers } = useBarbers();
  const { data: testimonials, isLoading: loadingTestimonials } = useTestimonials();

  return (
    <main className="min-h-screen bg-background">
      <Hero settings={settings ?? null} />
      <About settings={settings ?? null} />
      <CategoriesSection />
      <GallerySection />
      <BarbersList barbers={barbers ?? []} isLoading={loadingBarbers} />
      <TestimonialsList testimonials={testimonials ?? []} isLoading={loadingTestimonials} />
      <FinalCTA />
      <Footer />
    </main>
  );
};

export default Index;
