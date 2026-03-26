import { Button } from "@/components/ui/button.tsx";
import { Mail } from "lucide-react";
import dentalTools1 from "@/assets/dental-tools-1.jpg";

const AboutSection = () => {
  const handleContactWhatsApp = () => {
    const message = "Halo, saya ingin konsultasi produk dental.";
    const whatsappUrl = `https://wa.me/6285717796330?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <section id="about" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-in">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Berdedikasi untuk
              <br />
              <span className="text-secondary">Keunggulan Dental</span>
            </h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Energon Dental berada di garis depan penyedia alat dental, menghadirkan
              solusi terbaik yang mendorong keberhasilan praktik Anda. Dengan komitmen
              pada kepuasan dokter gigi, inovasi, dan pemanfaatan teknologi terkini,
              kami memastikan kualitas unggul pada setiap produk.
            </p>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Kami percaya bahwa keberhasilan ditentukan oleh kombinasi peralatan
              yang tepat dan teknik yang benar. Rasakan perjalanan praktik kedokteran
              gigi yang transformatif, selangkah demi selangkah. Dedikasi kami adalah
              meningkatkan layanan dental melalui perpaduan alat modern dan metode
              yang telah terbukti untuk hasil yang lebih baik.
            </p>
      
          </div>  

          <div className="animate-scale-in">
            <div className="relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-large">
                <img
                  src={dentalTools1}
                  alt="Peralatan dental profesional"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-primary rounded-2xl opacity-20 blur-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
