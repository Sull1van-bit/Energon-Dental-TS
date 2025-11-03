import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, Phone, Award, Users, Target, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import dentalTools1 from "@/assets/dental-tools-1.jpg";
import dentalTools2 from "@/assets/dental-tools-2.jpg";
import dentalTools3 from "@/assets/dental-tools-3.jpg";

const AboutUs = () => {
    const values = [
        {
            icon: Award,
            title: "Excellence",
            description: "We maintain the highest standards in every product we offer, ensuring quality that dentists can trust."
        },
        {
            icon: Users,
            title: "Partnership",
            description: "We work closely with dental professionals to understand their needs and deliver solutions that matter."
        },
        {
            icon: Target,
            title: "Innovation",
            description: "We stay at the forefront of dental technology, bringing the latest advancements to your practice."
        },
        {
            icon: Heart,
            title: "Care",
            description: "We're passionate about supporting dentists who improve lives through exceptional dental care."
        }
    ];

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-16 bg-gradient-hero">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto text-center animate-fade-in">
                        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
                            About <span className="text-primary">Energon Dental</span>
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            Your trusted partner in dental excellence since day one
                        </p>
                    </div>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-24 bg-background">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="animate-slide-in">
                            <h2 className="text-4xl font-bold text-foreground mb-6">
                                Our Story
                            </h2>
                            <p className="text-muted-foreground mb-4 leading-relaxed">
                                Energon Dental was founded with a singular vision: to empower dental professionals
                                with the finest tools and equipment available. We understand that exceptional
                                dental care starts with exceptional instruments.
                            </p>
                            <p className="text-muted-foreground mb-4 leading-relaxed">
                                Over the years, we've built strong relationships with leading manufacturers
                                and dental practitioners worldwide. This allows us to curate a selection of
                                products that truly make a difference in daily practice.
                            </p>
                            <p className="text-muted-foreground leading-relaxed">
                                Today, we serve dental professionals across the region, providing not just
                                products, but comprehensive support and expertise to help practices thrive.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 animate-scale-in">
                            <div className="aspect-square rounded-2xl overflow-hidden shadow-large">
                                <img
                                    src={dentalTools1}
                                    alt="Professional dental equipment"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="aspect-square rounded-2xl overflow-hidden shadow-large mt-8">
                                <img
                                    src={dentalTools2}
                                    alt="Dental tools showcase"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-24 bg-gradient-hero">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto text-center animate-fade-in">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                            Our Mission
                        </h2>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            To empower dentists with the <span className="text-primary font-semibold">machinery, tools, and expertise</span> they
                            need to optimize productivity, increase sustainability, and drive profitability
                            while delivering exceptional patient care.
                        </p>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-24 bg-background">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16 animate-fade-in">
                        <h2 className="text-4xl font-bold text-foreground mb-4">
                            Our Values
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            The principles that guide everything we do
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, index) => {
                            const Icon = value.icon;
                            return (
                                <div
                                    key={index}
                                    className="bg-card p-6 rounded-2xl shadow-medium hover:shadow-large transition-all duration-300 animate-scale-in border border-border"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4">
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground mb-2">
                                        {value.title}
                                    </h3>
                                    <p className="text-muted-foreground">
                                        {value.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-24 bg-gradient-hero">
                <div className="container mx-auto px-6">
                    <div className="max-w-3xl mx-auto text-center animate-fade-in">
                        <h2 className="text-4xl font-bold text-foreground mb-6">
                            Let's Work Together
                        </h2>
                        <p className="text-muted-foreground mb-8">
                            Have questions about our products or services? We're here to help
                            you find the perfect solutions for your dental practice.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button className="bg-primary hover:bg-primary/90 text-white shadow-medium">
                                <Mail className="w-5 h-5 mr-2" />
                                Email Us
                            </Button>
                            <Button variant="outline" className="shadow-medium">
                                <Phone className="w-5 h-5 mr-2" />
                                Call Us
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default AboutUs;