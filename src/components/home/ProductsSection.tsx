import { Button } from "@/components/ui/button.tsx";
import { Card } from "@/components/ui/card.tsx";
import { Link } from "react-router-dom";
import dentalTools1 from "@/assets/dental-tools-1.jpg";
import dentalTools2 from "@/assets/dental-tools-2.jpg";
import dentalTools3 from "@/assets/dental-tools-3.jpg";

const products = [
  {
    title: "Instrumen Bedah",
    description: "Instrumen bedah kami menyediakan beragam alat khusus untuk memenuhi kebutuhan bedah dental Anda.",
    image: dentalTools1,
  },
  {
    title: "Peralatan Diagnostik",
    description: "Kami menyediakan pilihan lengkap peralatan diagnostik canggih dan solusi teknologi modern.",
    image: dentalTools2,
  },
  {
    title: "Handpiece Presisi",
    description: "Koleksi handpiece kami menghadirkan berbagai peralatan dental berkualitas tinggi untuk performa optimal.",
    image: dentalTools3,
  },
];

const ProductsSection = () => {
  return (
    <section id="products" className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Jelajahi Beragam
            <br />
            <span className="text-primary">Peralatan Dental</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <Card 
              key={index}
              className="overflow-hidden border-0 shadow-medium hover:shadow-large transition-all duration-300 hover:-translate-y-2 animate-scale-in bg-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  {product.title}
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {product.description}
                </p>
                <Link to="/products">
                  <Button variant="ghost" className="text-primary hover:text-primary/80 p-0 h-auto font-semibold">
                    Lihat selengkapnya →
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
