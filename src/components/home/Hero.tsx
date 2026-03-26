import { Button } from "@/components/ui/button.tsx";
import { ArrowRight, Mail } from "lucide-react";
import heroImage from "@/assets/hero.jpg";

const Hero = () => {
  const handleContactWhatsApp = () => {
    const message = "Halo, saya ingin konsultasi produk dental.";
    const whatsappUrl = `https://wa.me/6285717796330?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20">
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.7) 50%, rgba(255, 255, 255, 0.4) 100%), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
          Partner Terpercaya untuk 
            <span className="text-primary"> Solusi Produk Dental Berkualitas </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl">
          Menyediakan alat dan bahan dental berkualitas tinggi dengan harga kompetitif untuk klinik, rumah sakit, dan distributor di seluruh Indonesia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white shadow-medium group"
              onClick={handleContactWhatsApp}
            >
              <Mail className="w-5 h-5 mr-2" />
              Hubungi Kami
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
    
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
