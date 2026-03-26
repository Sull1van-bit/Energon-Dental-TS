import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, Phone, ShieldCheck, Award, HeartHandshake, Target, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import dentalTools1 from "@/assets/dental-tools-1.jpg";
import dentalTools2 from "@/assets/dental-tools-2.jpg";
import dentalTools3 from "@/assets/dental-tools-3.jpg";

const AboutUs = () => {
    const handleContactWhatsApp = () => {
        const message = "Halo, saya ingin konsultasi produk dental.";
        const whatsappUrl = `https://wa.me/6285717796330?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank");
    };

    const values = [
        {
            icon: ShieldCheck,
            title: "Integritas",
            description: "Menjunjung tinggi kejujuran, transparansi, dan etika dalam setiap aspek bisnis."
        },
        {
            icon: Award,
            title: "Kualitas",
            description: "Berkomitmen menyediakan produk dental yang berkualitas tinggi dan terpercaya."
        },
        {
            icon: HeartHandshake,
            title: "Pelayanan Prima",
            description: "Mengutamakan kepuasan pelanggan melalui layanan yang cepat, responsif, dan profesional."
        },
        {
            icon: Target,
            title: "Inovasi",
            description: "Terus mengikuti perkembangan teknologi dan menghadirkan solusi dental yang modern."
        },
        {
            icon: BadgeCheck,
            title: "Komitmen",
            description: "Berdedikasi untuk memberikan yang terbaik dalam mendukung pelayanan kesehatan gigi di Indonesia."
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
                            Mitra terpercaya Anda dalam keunggulan layanan dental sejak awal
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
                                Cerita Kami
                            </h2>
                            <p className="text-muted-foreground mb-4 leading-relaxed">
                               Energon Bintang Mulia adalah perusahaan yang bergerak di bidang impor produk dental serta distribusinya ke klinik dokter gigi, rumah sakit swasta maupun pemerintah, dan jaringan distributor di seluruh Indonesia. Perusahaan ini didirikan oleh sosok berpengalaman lebih dari 20 tahun di industri dental, yang memiliki pemahaman mendalam terhadap kebutuhan praktisi kesehatan gigi.
                            </p>
                            <p className="text-muted-foreground mb-4 leading-relaxed">
                           Berangkat dari pengalaman tersebut, Energon Bintang Mulia hadir dengan komitmen untuk memberikan solusi terbaik bagi klinik dan tenaga medis, melalui penyediaan alat dan bahan dental berkualitas tinggi dengan harga yang tetap kompetitif dan terjangkau. Seiring waktu, perusahaan terus berkembang dan dipercaya sebagai mitra dalam mendukung pelayanan kesehatan gigi di Indonesia.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 animate-scale-in">
                            <div className="aspect-square rounded-2xl overflow-hidden shadow-large">
                                <img
                                    src={dentalTools1}
                                    alt="Peralatan dental profesional"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="aspect-square rounded-2xl overflow-hidden shadow-large mt-8">
                                <img
                                    src={dentalTools2}
                                    alt="Koleksi peralatan dental"
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
                            Visi kami
                        </h2>
                        <p className="text-xl text-muted-foreground leading-relaxed">
        Visi
Menjadi partner terpercaya klinik gigi di <span className="text-primary font-semibold">seluruh Indonesia</span> dalam menyediakan produk dental berkualitas.
                        </p>
                    </div>
                </div>
                <br />
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto text-center animate-fade-in">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                            Misi Kami
                        </h2>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                       Menghadirkan produk dental terbaik dengan harga yang kompetitif,
                            mendukung dokter gigi melalui <span className="text-primary font-semibold">solusi praktis dan inovatif</span>,
                            memperluas distribusi agar produk mudah dijangkau di seluruh Indonesia,
                            memberikan pelayanan yang cepat, ramah, dan dapat diandalkan,
                            serta tumbuh bersama mitra dan pelanggan untuk kemajuan layanan kesehatan gigi.
                        </p>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-24 bg-background">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16 animate-fade-in">
                        <h2 className="text-4xl font-bold text-foreground mb-4">
                            Nilai Perusahaan 
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Prinsip utama yang menjadi pedoman kami dalam setiap langkah bisnis
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                            Mari Bekerja Sama
                        </h2>
                        <p className="text-muted-foreground mb-8">
                            Punya pertanyaan tentang produk atau layanan kami?
                            Kami siap membantu Anda menemukan solusi terbaik untuk praktik dental Anda.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button className="" onClick={handleContactWhatsApp}>
                                <Phone className="w-5 h-5 mr-2" />
                                Hubungi Kami
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