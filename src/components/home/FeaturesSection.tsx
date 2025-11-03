import { Button } from "@/components/ui/button.tsx";
import { Card } from "@/components/ui/card.tsx";
import { DollarSign, Wrench, Settings, Clock } from "lucide-react";

const features = [
  {
    icon: DollarSign,
    title: "Flexible and Cost-Effective",
    description: "Flexible solutions designed to suit your practice needs without the overhead costs. Our leasing options make high-quality equipment accessible to practices of all sizes."
  },
  {
    icon: Wrench,
    title: "Reduced Maintenance and Downtime",
    description: "Stay productive with reliable dental equipment and warranty. Without administrative burden, less paper and labor, our service reduces downtime with quick support."
  },
  {
    icon: Settings,
    title: "Versatility and Scalability",
    description: "As practices grow, our equipment offers scalability. With our versatile product range, we ensure you have access to the latest technology that grows with your practice."
  },
  {
    icon: Clock,
    title: "Timely Delivery and Pickup",
    description: "We understand the importance of deadlines. Our quick delivery service ensures equipment arrives when you need it, with hassle-free pickup when you're done."
  }
];

const FeaturesSection = () => {
  return (
    <section id="services" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="animate-slide-in">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Unlock the Advantages of{" "}
              <span className="text-secondary">Professional Dental Equipment</span>
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              At Energon Dental, we take pride in providing dental equipment solutions
              that go beyond expectations. Our comprehensive product line is designed 
              to keep your practice running efficiently. Whether you need a specialized 
              tool for surgical work or the latest diagnostic equipment, our range 
              of offerings has you covered.
            </p>
            <Button className="bg-primary hover:bg-primary/90 text-white shadow-medium">
              Contact us
            </Button>
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
