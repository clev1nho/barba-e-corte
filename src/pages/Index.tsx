import { Hero } from "@/components/landing/Hero";
import { About } from "@/components/landing/About";
import { Benefits } from "@/components/landing/Benefits";
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
      <Benefits settings={settings ?? null} />
      <BarbersList barbers={barbers ?? []} isLoading={loadingBarbers} />
      <TestimonialsList testimonials={testimonials ?? []} isLoading={loadingTestimonials} />
      <FinalCTA />
      <Footer />
    </main>
  );
};

export default Index;
