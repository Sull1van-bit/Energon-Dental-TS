import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useProducts, type ProductItem, type ProductsData } from "@/hooks/useProducts";
import {
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  SortAsc,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const INITIAL_VISIBLE = 4;
const WHATSAPP_NUMBER = "6285717796330";
/** Hanya untuk menghapus data keranjang lama dari versi yang memakai localStorage */
const LEGACY_CART_STORAGE_KEY = "energon-dental-cart";

type ProductWithBrand = ProductItem & { brand: string; category: string };

type CartLine = {
  key: string;
  productId: number;
  name: string;
  brand: string;
  price: number;
  image: string;
  quantity: number;
};

function formatIdr(n: number) {
  return n.toLocaleString("id-ID", { style: "currency", currency: "IDR" });
}

function getOriginalPrice(product: ProductItem): number {
  const numericPrice = typeof product.price === "string" ? Number(product.price) : Number(product.price);
  return Number.isFinite(numericPrice) && numericPrice > 0 ? numericPrice : 0;
}

function getDiscountPercent(product: ProductItem): number {
  const raw = Number(product.discount ?? 0);
  if (!Number.isFinite(raw)) return 0;
  return Math.min(100, Math.max(0, raw));
}

function getEffectivePrice(product: ProductItem): number {
  const originalPrice = getOriginalPrice(product);
  const discountPercent = getDiscountPercent(product);
  if (originalPrice <= 0) return 0;
  const discounted = Math.round(originalPrice * (1 - discountPercent / 100));
  return Math.max(0, discounted);
}

function buildCartWhatsAppMessage(lines: CartLine[], total: number) {
  const header =
    "Halo, saya ingin memesan produk berikut dari katalog Energon Dental:\n\n";
  const body = lines
    .map((line, i) => {
      const sub = line.price * line.quantity;
      return `${i + 1}. ${line.name}\n   Merek: ${line.brand}\n   ${line.quantity} × ${formatIdr(line.price)} = ${formatIdr(sub)}`;
    })
    .join("\n\n");
  const footer = `\n\n*Total belanja: ${formatIdr(total)}*\n\nTerima kasih.`;
  return header + body + footer;
}

function openWhatsAppWithText(text: string) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
}

const SORT_OPTIONS = {
  "name-asc": "Nama A-Z",
  "name-desc": "Nama Z-A", 
  "price-asc": "Harga Terendah",
  "price-desc": "Harga Tertinggi",
  "brand": "Merek"
};

const Products = () => {
  const { data: productsData, loading } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<ProductWithBrand | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAddToCartChoiceOpen, setIsAddToCartChoiceOpen] = useState(false);
  const [expandedBrands, setExpandedBrands] = useState<Set<string>>(new Set());
  
  // Filter and search states
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [priceMin, setPriceMin] = useState<string>("");
  const [priceMax, setPriceMax] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("name-asc");
  const [showFilters, setShowFilters] = useState(false);

  const [cart, setCart] = useState<CartLine[]>([]);

  useEffect(() => {
    try {
      localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const cartTotal = useMemo(
    () => cart.reduce((sum, line) => sum + line.price * line.quantity, 0),
    [cart],
  );
  const cartCount = useMemo(() => cart.reduce((n, line) => n + line.quantity, 0), [cart]);

  const addToCart = (product: ProductWithBrand, qty = 1) => {
    const key = `${product.brand}-${product.id}`;
    const price = getEffectivePrice(product);
    setCart((prev) => {
      const idx = prev.findIndex((l) => l.key === key);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          quantity: next[idx].quantity + qty,
        };
        return next;
      }
      return [
        ...prev,
        {
          key,
          productId: product.id,
          name: product.name,
          brand: product.brand,
          price,
          image: product.image,
          quantity: qty,
        },
      ];
    });
  };

  const updateCartQty = (key: string, quantity: number) => {
    if (quantity < 1) {
      setCart((prev) => prev.filter((l) => l.key !== key));
      return;
    }
    setCart((prev) => prev.map((l) => (l.key === key ? { ...l, quantity } : l)));
  };

  const removeCartLine = (key: string) => {
    setCart((prev) => prev.filter((l) => l.key !== key));
  };

  const clearCart = () => setCart([]);

  const handleWhatsAppCart = () => {
    if (cart.length === 0) return;
    openWhatsAppWithText(buildCartWhatsAppMessage(cart, cartTotal));
  };

  const handleWhatsAppSingle = (product: ProductWithBrand) => {
    const originalPrice = getOriginalPrice(product);
    const discountPercent = getDiscountPercent(product);
    const finalPrice = getEffectivePrice(product);
    const priceInfo =
      discountPercent > 0
        ? `Harga: ${formatIdr(originalPrice)}\nDiskon: ${discountPercent}%\nHarga setelah diskon: ${formatIdr(finalPrice)}`
        : `Harga: ${formatIdr(finalPrice)}`;
    const message = `Halo, saya ingin memesan 1 item:\n\nProduk: ${product.name}\nMerek: ${product.brand}\n${priceInfo}`;
    openWhatsAppWithText(message);
  };
  
  // Dynamic categories from database
  const [availableCategories, setAvailableCategories] = useState<{id: string, name: string, slug: string}[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Load categories from database
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, slug')
          .order('name');
        
        if (error) throw error;
        setAvailableCategories(data || []);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };
    
    loadCategories();
  }, []);

  // Helper functions
  const categorizeProduct = (product: any): string => {
    // Use category from database relationship or fallback
    return product.category || "Lainnya";
  };
  
  // Processed and filtered data
  const { filteredProducts, availableBrands, productsByBrand } = useMemo(() => {
    if (!productsData) return { filteredProducts: [], availableBrands: [], productsByBrand: {} };
    
    // Flatten all products from all brands
    const allProducts: (ProductItem & { brand: string; category: string })[] = [];
    const brands = new Set<string>();
    const categories = new Set<string>();
    
    Object.entries(productsData)
      .filter(([key, value]) => key !== "brandLogos" && Array.isArray(value))
      .forEach(([brand, products]) => {
        brands.add(brand);
        (products as any[]).forEach(product => {
          const category = categorizeProduct(product);
          categories.add(category);
          allProducts.push({ ...product, brand, category });
        });
      });
      
    // Apply filters
    let filtered = allProducts.filter(product => {
      // Category filter
      if (selectedCategory !== "all") {
        const selectedCategoryName = availableCategories.find(c => c.slug === selectedCategory)?.name;
        if (selectedCategoryName && product.category !== selectedCategoryName) {
          return false;
        }
      }
      
      // Brand filter
      if (selectedBrand !== "all" && product.brand !== selectedBrand) {
        return false;
      }
      
      // Price filter
      const price = getEffectivePrice(product);
      if (priceMin && price < parseInt(priceMin)) {
        return false;
      }
      if (priceMax && price > parseInt(priceMax)) {
        return false;
      }
      
      // Search filter
      if (searchQuery) {
        const searchText = `${product.name} ${product.description} ${product.brand}`.toLowerCase();
        return searchText.includes(searchQuery.toLowerCase());
      }
      
      return true;
    });
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price-asc":
          return getEffectivePrice(a) - getEffectivePrice(b);
        case "price-desc":
          return getEffectivePrice(b) - getEffectivePrice(a);
        case "brand":
          return a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
    
    // Group by brand for display
    const byBrand: Record<string, typeof filtered> = {};
    filtered.forEach(product => {
      if (!byBrand[product.brand]) {
        byBrand[product.brand] = [];
      }
      byBrand[product.brand].push(product);
    });
    
    return {
      filteredProducts: filtered,
      availableBrands: Array.from(brands).sort(),
      productsByBrand: byBrand
    };
  }, [productsData, selectedCategory, selectedBrand, priceMin, priceMax, searchQuery, sortBy]);

  const handleProductClick = (product: ProductWithBrand) => {
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Beranda</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Produk</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Produk Kami
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Jelajahi berbagai peralatan dan instrumen dental profesional kami
          </p>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="gap-2 border-primary/30 shadow-sm"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="h-5 w-5 text-primary" />
            Keranjang belanja
            {cartCount > 0 ? (
              <Badge variant="secondary" className="ml-1 tabular-nums">
                {cartCount}
              </Badge>
            ) : null}
          </Button>
        </div>

        {/* Filters and Search */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2 lg:hidden"
            >
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            
            {/* Sort */}
            <div className="min-w-[200px]">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="gap-2">
                  <SortAsc className="h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SORT_OPTIONS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Filter Panel */}
          {showFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
              <div className="absolute bottom-0 left-0 right-0 bg-background rounded-t-xl p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Filter</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(false)}
                  >
                    ✕
                  </Button>
                </div>
                
                {/* Mobile Filter Content */}
                <div className="space-y-4">
                  {/* Category Filter */}
                  <div>
                    <Label className="text-sm font-medium">Kategori</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Kategori</SelectItem>
                        {availableCategories.map(category => (
                          <SelectItem key={category.id} value={category.slug}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Brand Filter */}
                  <div>
                    <Label className="text-sm font-medium">Merek</Label>
                    <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Merek</SelectItem>
                        {availableBrands.map(brand => (
                          <SelectItem key={brand} value={brand}>
                            {brand}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Price Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Harga Minimum (IDR)</Label>
                      <Input
                        type="number"
                        placeholder="contoh 100000"
                        value={priceMin}
                        onChange={(e) => setPriceMin(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Harga Maksimum (IDR)</Label>
                      <Input
                        type="number"
                        placeholder="contoh 10000000"
                        value={priceMax}
                        onChange={(e) => setPriceMax(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("all");
                        setSelectedBrand("all");
                        setPriceMin("");
                        setPriceMax("");
                      }}
                    >
                      Reset Filter
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => setShowFilters(false)}
                    >
                      Terapkan
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Desktop Filter Panel */}
          <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
            {/* Category Filter */}
            <div>
              <Label className="text-sm font-medium">Kategori</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {availableCategories.map(category => (
                    <SelectItem key={category.id} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Brand Filter */}
            <div>
              <Label className="text-sm font-medium">Merek</Label>
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Merek</SelectItem>
                  {availableBrands.map(brand => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Price Range */}
            <div>
              <Label className="text-sm font-medium">Harga Minimum (IDR)</Label>
              <Input
                type="number"
                placeholder="contoh 100000"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium">Harga Maksimum (IDR)</Label>
              <Input
                type="number"
                placeholder="contoh 10000000"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-12">
            {/* Skeleton Category Headers */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-6">
                <div className="h-8 w-48 bg-muted rounded animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="bg-card border rounded-lg overflow-hidden">
                      <div className="h-48 bg-muted animate-pulse" />
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                        <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                        <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                        <div className="h-5 bg-muted rounded animate-pulse w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {!loading && (
          <>
            {/* Results Count and Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <p className="text-sm text-muted-foreground">
                Menampilkan <span className="font-semibold">{filteredProducts.length}</span> produk
                {(selectedCategory !== "all" || selectedBrand !== "all" || searchQuery || priceMin || priceMax) && 
                  <span className="text-primary"> (difilter)</span>}
              </p>
              
              {(selectedCategory !== "all" || selectedBrand !== "all" || searchQuery || priceMin || priceMax) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setSelectedBrand("all");
                    setPriceMin("");
                    setPriceMax("");
                  }}
                  className="gap-2"
                >
                  Reset semua filter
                </Button>
              )}
            </div>

            {/* Products by Brand */}
            {Object.keys(productsByBrand).length > 0 ? (
              Object.entries(productsByBrand).sort(([a], [b]) => a.localeCompare(b)).map(([brand, products], brandIndex) => {
                const isExpanded = expandedBrands.has(brand);
                const hasMore = products.length > INITIAL_VISIBLE;
                const visibleProducts = hasMore && !isExpanded
                  ? products.slice(0, INITIAL_VISIBLE)
                  : products;

                return (
                  <div 
                    key={brand} 
                    className="mb-12" 
                    style={{ animationDelay: `${brandIndex * 0.1}s` }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-foreground">
                        {brand}
                        <span className="ml-2 text-sm font-normal text-muted-foreground">
                          ({products.length} produk)
                        </span>
                      </h2>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {visibleProducts.map((product, index) => (
                          <Card
                            key={product.id}
                            className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in"
                            style={{ animationDelay: `${(brandIndex * 0.1) + (index * 0.05)}s` }}
                            onClick={() => handleProductClick(product)}
                          >
                            <CardContent className="p-0">
                              <div className="relative">
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-full h-48 object-contain object-center rounded-t-lg"
                                />
                                <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm rounded-full px-3 py-1 border">
                                  <span className="text-xs font-medium">{product.brand}</span>
                                </div>
                              </div>
                              <div className="p-4">
                                <h3 className="text-lg font-semibold mb-1 text-foreground line-clamp-2">
                                  {product.name}
                                </h3>
                                {product.category && (
                                  <span className="inline-block text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5 mb-2 font-medium">
                                    {product.category}
                                  </span>
                                )}
                                <p className="text-muted-foreground text-sm line-clamp-2 whitespace-pre-line mb-3">
                                  {product.description}
                                </p>
                           
                                {getDiscountPercent(product) > 0 ? (
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <p className="text-muted-foreground line-through text-sm">
                                        {formatIdr(getOriginalPrice(product))}
                                      </p>
                                      <span className="inline-flex items-center rounded bg-red-100 text-red-700 text-xs px-2 py-0.5 font-medium">
                                        -{getDiscountPercent(product)}%
                                      </span>
                                    </div>
                                    <p className="text-primary font-semibold">
                                      {formatIdr(getEffectivePrice(product))}
                                    </p>
                                  </div>
                                ) : (
                                  <p className="text-primary font-semibold">
                                    {formatIdr(getOriginalPrice(product))}
                                  </p>
                                )}
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
                              Tampilkan lebih sedikit
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4" />
                              Tampilkan lebih banyak ({products.length - INITIAL_VISIBLE} produk lagi)
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  {searchQuery || selectedCategory !== "all" || selectedBrand !== "all" || priceMin || priceMax
                    ? "Tidak ada produk yang sesuai dengan kriteria Anda."
                    : "Belum ada produk tersedia. Admin dapat menambahkan produk dari dashboard."}
                </p>
                {(searchQuery || selectedCategory !== "all" || selectedBrand !== "all" || priceMin || priceMax) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                      setSelectedBrand("all");
                      setPriceMin("");
                      setPriceMax("");
                    }}
                  >
                    Reset semua filter
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl flex items-center gap-2">
                  {selectedProduct.name}
                </DialogTitle>
                <DialogDescription className="text-base">
                  Peralatan dental profesional - Hubungi kami untuk informasi lebih lanjut
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full max-w-[800px] max-h-[60vh] mx-auto object-contain rounded-lg border bg-muted/20"
                />
                
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Deskripsi</h4>
                    <p className="text-base leading-relaxed whitespace-pre-line">{selectedProduct.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Merek</h4>
                      <p className="text-base">{selectedProduct.brand || "Tidak tersedia"}</p>
                    </div>
                    
                  
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Harga</h4>
                    {getDiscountPercent(selectedProduct) > 0 ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-muted-foreground line-through text-base">
                            {formatIdr(getOriginalPrice(selectedProduct))}
                          </p>
                          <span className="inline-flex items-center rounded bg-red-100 text-red-700 text-xs px-2 py-0.5 font-medium">
                            -{getDiscountPercent(selectedProduct)}%
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-primary">
                          {formatIdr(getEffectivePrice(selectedProduct))}
                        </p>
                      </div>
                    ) : (
                      <p className="text-2xl font-bold text-primary">
                        {formatIdr(getOriginalPrice(selectedProduct))}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-6">
                                <Button
                  type="button"
                  onClick={() => handleWhatsAppSingle(selectedProduct)}
                  className="flex-1 bg-[#25D366] hover:bg-[#20BA5A] text-white gap-2 min-w-[140px]"
                >
                  <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  Pesan via WhatsApp
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1 gap-2 min-w-[140px]"
                  onClick={() => {
                    addToCart(selectedProduct);
                    setIsDialogOpen(false);
                    setIsAddToCartChoiceOpen(true);
                  }}
                >
                  <ShoppingCart className="h-5 w-5 shrink-0" />
                  Tambahkan ke keranjang
                </Button>


                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1 min-w-[140px]"
                >
                  Tutup
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAddToCartChoiceOpen} onOpenChange={setIsAddToCartChoiceOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Produk ditambahkan ke keranjang</AlertDialogTitle>
            <AlertDialogDescription>
              Mau lanjut mencari produk lain, atau langsung melihat isi keranjang?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Lanjut cari produk</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              className="gap-2"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="h-4 w-4 shrink-0" />
              Buka keranjang
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <ShoppingCart className="h-7 w-7 text-primary shrink-0" />
              Keranjang belanja
            </DialogTitle>
            <DialogDescription className="text-base">
              {cartCount === 0
                ? "Belum ada barang. Buka detail produk dan pilih Tambahkan ke keranjang."
                : `${cartCount} item — total ${formatIdr(cartTotal)}`}
            </DialogDescription>
          </DialogHeader>

          {cart.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              Keranjang masih kosong.
            </p>
          ) : (
            <>
              <ul className="divide-y rounded-lg border bg-muted/20 max-h-[min(50vh,420px)] overflow-y-auto">
                {cart.map((line) => (
                  <li
                    key={line.key}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 sm:p-4"
                  >
                    <img
                      src={line.image}
                      alt=""
                      className="h-16 w-16 rounded-md object-contain bg-background border shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground line-clamp-2">{line.name}</p>
                      <p className="text-sm text-muted-foreground">{line.brand}</p>
                      <p className="text-sm text-primary font-medium mt-1">
                        {formatIdr(line.price)} / item · subtotal {formatIdr(line.price * line.quantity)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center border rounded-md bg-background">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9"
                          onClick={() => updateCartQty(line.key, line.quantity - 1)}
                          aria-label="Kurangi"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium tabular-nums">
                          {line.quantity}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9"
                          onClick={() => updateCartQty(line.key, line.quantity + 1)}
                          aria-label="Tambah"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeCartLine(line.key)}
                        aria-label="Hapus dari keranjang"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2 border-t">
                <p className="text-lg font-bold text-foreground">Total: {formatIdr(cartTotal)}</p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" type="button" onClick={clearCart}>
                    Kosongkan
                  </Button>
                  <Button
                    type="button"
                    className="gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white"
                    onClick={() => handleWhatsAppCart()}
                  >
                    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                    </svg>
                    Pesan keranjang via WhatsApp
                  </Button>
                </div>
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

