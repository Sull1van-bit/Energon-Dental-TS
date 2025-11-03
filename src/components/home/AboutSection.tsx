import { Button } from "@/components/ui/button.tsx";
import { Mail } from "lucide-react";
import dentalTools1 from "@/assets/dental-tools-1.jpg";

const AboutSection = () => {
  return (
    <section id="about" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-in">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Passionate About
              <br />
              <span className="text-secondary">Dental Excellence</span>
            </h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Energon Dental is at the forefront of dental tools, offering passionate
              solutions that drive success. Committed to dentist satisfaction,
              innovation, and embracing today's technology, we ensure excellence
              in every product.
            </p>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              We believe that success is the right equipment combined with the right
              techniques. Experience a transformative dentistry journey—one step at a
              time. Our dedication is to dental practice improvement that combines
              modern tools with proven techniques to drive better outcomes.
            </p>
            <Button className="bg-primary hover:bg-primary/90 text-white shadow-medium">
              <Mail className="w-5 h-5 mr-2" />
              Contact us
            </Button>
          </div>

          <div className="animate-scale-in">
            <div className="relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-large">
                <img
                  src={dentalTools1}
                  alt="Professional dental tools"
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
