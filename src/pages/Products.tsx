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
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useProducts, type ProductItem, type ProductsData } from "@/hooks/useProducts";
import { ChevronDown, ChevronUp, Search, Filter, SortAsc } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const INITIAL_VISIBLE = 4;

const SORT_OPTIONS = {
  "name-asc": "Nama A-Z",
  "name-desc": "Nama Z-A", 
  "price-asc": "Harga Terendah",
  "price-desc": "Harga Tertinggi",
  "brand": "Merek"
};

const Products = () => {
  const { data: productsData, loading } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expandedBrands, setExpandedBrands] = useState<Set<string>>(new Set());
  
  // Filter and search states
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [priceMin, setPriceMin] = useState<string>("");
  const [priceMax, setPriceMax] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("name-asc");
  const [showFilters, setShowFilters] = useState(false);
  
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
  
  const parsePrice = (priceStr: string): number => {
    const cleanPrice = priceStr.replace(/[^0-9]/g, '');
    return cleanPrice ? parseInt(cleanPrice) : 0;
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
      const price = parsePrice(product.price);
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
          return parsePrice(a.price) - parsePrice(b.price);
        case "price-desc":
          return parsePrice(b.price) - parsePrice(a.price);
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

  const handleProductClick = (product: ProductItem) => {
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
    const message = `Halo, saya tertarik untuk memesan : ${selectedProduct.name}`;
    const whatsappUrl = `https://wa.me/6285717796330?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
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
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Jelajahi berbagai peralatan dan instrumen dental profesional kami
          </p>
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
                      {visibleProducts.map((product, index) => {
                        const brandLogo = (productsData as ProductsData).brandLogos?.[product.brand] ?? "/placeholder.svg";
                        
                        return (
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
                                {/* Brand Badge */}
                                <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm rounded-full px-3 py-1 border">
                                  <div className="flex items-center gap-2">
        
                                    <span className="text-xs font-medium">{product.brand}</span>
                                  </div>
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
                                <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                                  {product.description}
                                </p>
                                {product.stock !== undefined && (
                                  <p className="text-sm text-muted-foreground mb-2">
                                    Stok: {typeof product.stock === "number" ? product.stock : "Hubungi admin"}
                                  </p>
                                )}
                                <p className="text-primary font-semibold">
                                  {Number(product.price).toLocaleString("id-ID", { 
                                    style: "currency", 
                                    currency: "IDR" 
                                  })}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
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
                    <p className="text-base leading-relaxed">{selectedProduct.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Merek</h4>
                      <p className="text-base">{(selectedProduct as any).brand || "Tidak tersedia"}</p>
                    </div>
                    
                    {selectedProduct.stock !== undefined && (
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Stok</h4>
                        <p className="text-base">
                          {typeof selectedProduct.stock === "number" ? selectedProduct.stock : "Hubungi admin"}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Harga</h4>
                    <p className="text-2xl font-bold text-primary">
                      {Number(selectedProduct.price).toLocaleString("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      })}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <Button
                  onClick={handleWhatsAppOrder}
                  className="flex-1 bg-[#25D366] hover:bg-[#20BA5A] text-white gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  Pesan via WhatsApp
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Tutup
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

