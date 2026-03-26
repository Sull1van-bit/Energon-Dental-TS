import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';

const Events = () => {
    useEffect(() => {
        const existing = document.querySelector<HTMLScriptElement>('script[src^="https://www.instagram.com/embed.js"]');
        const script = existing ?? document.createElement('script');

        if (!existing) {
            script.src = 'https://www.instagram.com/embed.js';
            script.async = true;
            document.body.appendChild(script);
        }

        const handleLoad = () => {
            window.instgrm?.Embeds?.process();
        };

        if (!existing) {
            script.addEventListener('load', handleLoad);
        } else {
            handleLoad();
        }

        return () => {
            if (!existing) {
                script.removeEventListener('load', handleLoad);
            }
        };
    }, []);

    const events = [
        {
            id: 1,
            title: "Foril 2025",
            date: "15 Maret 2025",
            instagramUrl: "https://www.instagram.com/reel/DOGw9kmEm3Z/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
        },
        {
            id: 2,
            title: "IDS 2025",
            date: "20 April 2025",
            instagramUrl: "https://www.instagram.com/reel/DMNSLAbScYh/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
        },
        {
            id: 3,
            title: "Lokakarya Kesehatan Gigi",
            date: "10 Mei 2025",
            instagramUrl: "https://www.instagram.com/reel/DPdkT-FD5BW/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
        },
    ];

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="pt-24 pb-16">
                <div className="container mx-auto px-4">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            Acara Kami
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Tetap update dengan acara, lokakarya, dan konferensi terbaru kami
                        </p>
                    </div>

                    {/* Events Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {events.map((event) => (
                            <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="mb-4">
                                        <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                                        <p className="text-sm text-muted-foreground mb-4">{event.date}</p>
                                    </div>

                                    {/* Instagram Embed */}
                                    <div className="instagram-embed-wrapper">
                                        <blockquote
                                            className="instagram-media"
                                            data-instgrm-captioned
                                            data-instgrm-permalink={event.instagramUrl}
                                            data-instgrm-version="14"
                                            style={{
                                                background: '#FFF',
                                                border: 0,
                                                borderRadius: '3px',
                                                boxShadow: '0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)',
                                                margin: '1px',
                                                maxWidth: '540px',
                                                minWidth: '326px',
                                                padding: 0,
                                                width: '100%'
                                            }}
                                        >
                                            <div style={{ padding: '16px' }}>
                                                <a
                                                    href={event.instagramUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        background: '#FFFFFF',
                                                        lineHeight: 0,
                                                        padding: '0 0',
                                                        textAlign: 'center',
                                                        textDecoration: 'none',
                                                        width: '100%'
                                                    }}
                                                >
                                                    Lihat postingan ini di Instagram
                                                </a>
                                            </div>
                                        </blockquote>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Events;