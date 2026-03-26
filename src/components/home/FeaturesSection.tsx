import { Button } from "@/components/ui/button.tsx";
import { Card } from "@/components/ui/card.tsx";
import { DollarSign, Wrench, Settings, Clock } from "lucide-react";

const features = [
  {
    icon: DollarSign,
    title: "Fleksibel dan Hemat Biaya",
    description: "Solusi fleksibel yang dirancang sesuai kebutuhan praktik Anda tanpa biaya operasional berlebih. Opsi kami membuat peralatan berkualitas tinggi lebih mudah diakses untuk klinik dengan berbagai skala."
  },
  {
    icon: Wrench,
    title: "Perawatan dan Downtime Lebih Rendah",
    description: "Tetap produktif dengan peralatan dental yang andal serta dukungan garansi. Dengan proses yang lebih praktis dan dukungan cepat, layanan kami membantu mengurangi downtime operasional."
  },
  {
    icon: Settings,
    title: "Serbaguna dan Skalabel",
    description: "Seiring pertumbuhan praktik Anda, peralatan kami dirancang agar mudah ditingkatkan. Dengan pilihan produk yang serbaguna, Anda dapat terus mengakses teknologi terbaru yang berkembang bersama klinik Anda."
  },
  {
    icon: Clock,
    title: "Pengiriman dan Penjemputan Tepat Waktu",
    description: "Kami memahami pentingnya ketepatan waktu. Layanan pengiriman cepat kami memastikan peralatan tiba saat dibutuhkan, dengan proses penjemputan kembali yang mudah saat selesai digunakan."
  }
];

const FeaturesSection = () => {
  const handleContactWhatsApp = () => {
    const message = "Halo, saya ingin konsultasi produk dental.";
    const whatsappUrl = `https://wa.me/6285717796330?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <section id="services" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="animate-slide-in">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Dapatkan Keunggulan{" "}
              <span className="text-secondary">Peralatan Dental Profesional</span>
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Di Energon Dental, kami bangga menghadirkan solusi peralatan dental
              yang melampaui ekspektasi. Lini produk kami yang komprehensif dirancang
              untuk menjaga praktik Anda tetap efisien. Baik Anda membutuhkan alat
              khusus untuk tindakan bedah maupun peralatan diagnostik terbaru,
              kami siap memenuhi kebutuhan tersebut.
            </p>
       
          </div>

          <div className="space-y-6">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="p-6 border-0 shadow-soft hover:shadow-medium transition-all duration-300 animate-scale-in bg-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
