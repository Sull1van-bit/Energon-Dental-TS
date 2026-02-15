import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import productsData from "@/data/products.json";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
}

type ProductsData = {
  [key: string]: Product[];
};

const INITIAL_VISIBLE = 4;

const Products = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expandedBrands, setExpandedBrands] = useState<Set<string>>(new Set());

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const toggleBrand = (brand: string) => {
    setExpandedBrands((prev) => {
      const next = new Set(prev);
      if (next.has(brand)) next.delete(brand);
      else next.add(brand);
      return next;
    });
  };

  const handleWhatsAppOrder = () => {
    if (!selectedProduct) return;
    const message = `Hi, I'm interested in ordering: ${selectedProduct.name}`;
    const whatsappUrl = `https://wa.me/1234567890?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-24">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Our Products
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our comprehensive range of professional dental equipment and instruments
          </p>
        </div>

        {Object.entries(productsData as ProductsData).map(([brand, products], brandIndex) => {
          const isExpanded = expandedBrands.has(brand);
          const hasMore = products.length > INITIAL_VISIBLE;
          const visibleProducts = hasMore && !isExpanded
            ? products.slice(0, INITIAL_VISIBLE)
            : products;

          return (
            <div key={brand} className="mb-16" style={{ animationDelay: `${brandIndex * 0.1}s` }}>
              <h2 className="text-3xl font-bold mb-8 text-foreground">{brand}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {visibleProducts.map((product, index) => (
                  <Card
                    key={product.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in"
                    style={{ animationDelay: `${(brandIndex * 0.1) + (index * 0.05)}s` }}
                    onClick={() => handleProductClick(product)}
                  >
                    <CardContent className="p-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 object-contain object-center rounded-t-lg"
                      />
                      <div className="p-6">
                        <h3 className="text-xl font-semibold mb-2 text-foreground">{product.name}</h3>
                        <p className="text-muted-foreground text-sm line-clamp-2">{product.description}</p>
                        <p className="text-primary font-semibold mt-4">{product.price}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {hasMore && (
                <div className="mt-6 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => toggleBrand(brand)}
                    className="gap-2"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        See less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        See more ({products.length - INITIAL_VISIBLE} more products)
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedProduct.name}</DialogTitle>
              </DialogHeader>
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full h-64 object-contain object-center rounded-lg my-4"
              />
              <DialogDescription className="text-base">
                {selectedProduct.description}
              </DialogDescription>
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <Button
                  onClick={handleWhatsAppOrder}
                  className="flex-1 bg-[#25D366] hover:bg-[#20BA5A] text-white"
                >
                  Order via WhatsApp
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Products;

