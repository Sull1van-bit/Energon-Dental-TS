import Navbar from "@/components/Navbar.tsx";
import Hero from "@/components/home/Hero.tsx";
import ProductsSection from "@/components/home/ProductsSection.tsx";
import AboutSection from "@/components/home/AboutSection.tsx";
import MissionSection from "@/components/home/MissionSection.tsx";
import FeaturesSection from "@/components/home/FeaturesSection.tsx";
import Footer from "@/components/Footer.tsx";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <ProductsSection />
      <AboutSection />
      <MissionSection />
      <FeaturesSection />
      <Footer />
    </div>
  );
};

export default Index;
