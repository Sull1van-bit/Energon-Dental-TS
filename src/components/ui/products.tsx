import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface Product {
  id: string;
  name: string;
  description?: string;
  stock?: number;
  price?: number;
  image?: string;
  brand?: string;
  kategori?: string;
  brand_id?: string;
  category_id?: string;
  createdAt?: string;
}

interface Brand {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const INITIAL_VISIBLE = 4;

interface ProductsProps {
  reloadKey?: number;
}

const Products = ({ reloadKey }: ProductsProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStock, setEditStock] = useState<string>("");
  const [editPrice, setEditPrice] = useState<string>("");
  const [editKategori, setEditKategori] = useState("");
  const [editBrand, setEditBrand] = useState("");
  const [editBrandId, setEditBrandId] = useState<string>("");
  const [editCategoryId, setEditCategoryId] = useState<string>("");
  const [savingEdit, setSavingEdit] = useState(false);
  
  // Data for dropdowns
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Helper function to format price as Rupiah
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          brands ( id, name ),
          categories ( id, name, slug )
        `
        )
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (error) {
        // eslint-disable-next-line no-console
        console.error("Gagal memuat produk:", error.message);
        setProducts([]);
      } else {
        const mapped: Product[] =
          data?.map((p: any) => ({
            id: String(p.id),
            name: (p.name as string) ?? "",
            description: p.description ?? undefined,
            stock: typeof p.stock === "number" ? p.stock : undefined,
            price: typeof p.price === "number" ? p.price : Number(p.price) || undefined,
            image: p.image ?? undefined,
            brand: (p.brands?.name as string) ?? undefined,
            brand_id: p.brand_id ?? undefined,
            kategori: (p.categories?.name as string) ?? (p.kategori as string) ?? undefined,
            category_id: p.category_id ?? undefined,
            createdAt: p.created_at ?? undefined,
          })) ?? [];
        setProducts(mapped);
      }
      setLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  // Load brands for dropdown
  const loadBrands = async () => {
    setLoadingBrands(true);
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setBrands(data || []);
    } catch (error) {
      console.error('Error loading brands:', error);
    } finally {
      setLoadingBrands(false);
    }
  };

  // Load categories for dropdown
  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const openImageModal = (img: string) => {
    setModalImage(img);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setModalImage(null);
  };

  const handleDelete = async (id: string) => {
    const confirm = window.confirm('Hapus produk ini?');
    if (!confirm) return;
    setDeleting(id);
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert('Gagal hapus produk: ' + (err as any)?.message || 'Unknown error');
    } finally {
      setDeleting(null);
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProductId(product.id);
    setEditName(product.name);
    setEditDescription(product.description ?? "");
    setEditStock(
      typeof product.stock === "number" ? String(product.stock) : ""
    );
    setEditPrice(
      typeof product.price === "number" ? String(product.price) : ""
    );
    setEditKategori(product.kategori ?? "");
    setEditBrand(product.brand ?? "");
    setEditBrandId(product.brand_id ?? "");
    setEditCategoryId(product.category_id ?? "");
    setEditOpen(true);
    
    // Load dropdowns data if not already loaded
    if (brands.length === 0) loadBrands();
    if (categories.length === 0) loadCategories();
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProductId) return;

    const trimmedName = editName.trim();
    const trimmedDesc = editDescription.trim();

    if (!trimmedName) {
      alert("Nama produk tidak boleh kosong.");
      return;
    }

    const stockValue =
      editStock.trim() === "" ? null : Number(editStock.replace(",", "."));
    const priceValue =
      editPrice.trim() === "" ? null : Number(editPrice.replace(",", "."));

    if (Number.isNaN(stockValue as number) && stockValue !== null) {
      alert("Stok harus berupa angka yang valid.");
      return;
    }
    if (stockValue !== null && stockValue < 0) {
      alert("Stok tidak boleh bernilai negatif.");
      return;
    }
    if (Number.isNaN(priceValue as number) && priceValue !== null) {
      alert("Harga harus berupa angka yang valid.");
      return;
    }
    if (priceValue !== null && priceValue < 0) {
      alert("Harga tidak boleh bernilai negatif.");
      return;
    }

    setSavingEdit(true);
    try {
      const { error } = await supabase
        .from("products")
        .update({
          name: trimmedName,
          description: trimmedDesc || null,
          stock: stockValue,
          price: priceValue,
          brand_id: editBrandId || null,
          category_id: editCategoryId || null,
        })
        .eq("id", editingProductId);

      if (error) throw error;

      // Find the updated brand and category names
      const selectedBrand = brands.find(b => b.id === editBrandId);
      const selectedCategory = categories.find(c => c.id === editCategoryId);
      
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProductId
            ? {
                ...p,
                name: trimmedName,
                description: trimmedDesc || undefined,
                stock: stockValue === null ? undefined : stockValue,
                price: priceValue === null ? undefined : priceValue,
                kategori: selectedCategory?.name || undefined,
                brand: selectedBrand?.name || undefined,
                brand_id: editBrandId || undefined,
                category_id: editCategoryId || undefined,
              }
            : p
        )
      );

      setEditOpen(false);
      setEditingProductId(null);
    } catch (err: any) {
      alert(
        "Gagal mengupdate produk: " + (err?.message || "Terjadi kesalahan")
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const normalizedSearch = search.trim().toLowerCase();
  const filteredProducts = normalizedSearch
    ? products.filter((product) => {
        const haystack = [
          product.name,
          product.brand,
          product.kategori,
          product.description,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedSearch);
      })
    : products;

  const visibleProducts = showAll
    ? filteredProducts
    : filteredProducts.slice(0, INITIAL_VISIBLE);

  if (loading)
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#000099]"></div>
        <span className="ml-2 text-[#000099]">Loading...</span>
      </div>
    );

  if (products.length === 0)
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Belum ada produk tersedia.</p>
      </div>
    );

  return (
    <div className="shadow-lg rounded-lg">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 pt-4 pb-2">
        <p className="text-sm text-gray-600">
          Total produk: <span className="font-semibold">{products.length}</span>
          {normalizedSearch &&
            ` • Hasil filter: ${filteredProducts.length} produk`}
        </p>
        <input
          type="text"
          placeholder="Cari produk berdasarkan nama, brand, kategori..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setShowAll(false);
          }}
          className="w-full sm:w-64 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#000099]"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-[#000099] text-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider border-b border-gray-200">
                No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider border-b border-gray-200">
                Brand
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider border-b border-gray-200">
                Kategori
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider border-b border-gray-200">
                Nama Produk
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider border-b border-gray-200">
                Deskripsi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider border-b border-gray-200">
                Stok
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider border-b border-gray-200">
                Harga
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider border-b border-gray-200">
                Foto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider border-b border-gray-200">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {visibleProducts.map((product, index) => (
              <tr
                key={product.id}
                className="hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#000099]">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                  {product.brand || "Umum"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                  {product.kategori || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {product.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                  {product.description || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {typeof product.stock === "number" ? product.stock : "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#ff6600]">
                  {typeof product.price === "number"
                    ? formatRupiah(product.price)
                    : "Contact for pricing"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {product.image ? (
                    <button
                      onClick={() => openImageModal(product.image!)}
                      className="p-0 border-none bg-transparent focus:outline-none"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-12 w-12 rounded-lg object-cover border border-gray-200 cursor-pointer transition duration-200 hover:scale-105"
                      />
                    </button>
                  ) : (
                    <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-xs text-gray-400">No Image</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => openEditModal(product)}
                      className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded shadow"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      disabled={deleting === product.id}
                      className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded shadow disabled:opacity-50"
                    >
                      {deleting === product.id ? "Menghapus..." : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {visibleProducts.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="px-6 py-6 text-center text-sm text-gray-500"
                >
                  Tidak ada produk yang cocok dengan pencarian.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {filteredProducts.length > INITIAL_VISIBLE && (
        <div className="px-4 py-3 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="text-sm px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-[#000099] font-medium"
          >
            {showAll
              ? "See less"
              : `See more (${filteredProducts.length - INITIAL_VISIBLE} more products)`}
          </button>
        </div>
      )}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl flex flex-col items-center">
          {modalImage && (
            <img
              src={modalImage}
              alt="Preview"
              className="max-h-[70vh] rounded shadow border"
            />
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <h2 className="text-lg font-semibold mb-4">Edit Produk</h2>
          <form className="space-y-3" onSubmit={handleUpdateProduct}>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Nama Produk
              </label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Brand
              </label>
              <Select value={editBrandId || "none"} onValueChange={(value) => setEditBrandId(value === "none" ? "" : value)} disabled={loadingBrands}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingBrands ? "Loading brands..." : "Select brand (optional)"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Brand (Umum)</SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Kategori
              </label>
              <Select value={editCategoryId || "none"} onValueChange={(value) => setEditCategoryId(value === "none" ? "" : value)} disabled={loadingCategories}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingCategories ? "Loading categories..." : "Select category (optional)"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Category</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Deskripsi
              </label>
              <Input
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Deskripsi singkat produk"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Stok
                </label>
                <Input
                  type="number"
                  min={0}
                  value={editStock}
                  onChange={(e) => setEditStock(e.target.value)}
                  placeholder="Kosongkan jika tidak ingin diubah"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Harga
                </label>
                <Input
                  type="number"
                  min={0}
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  placeholder="Kosongkan jika tidak ingin diubah"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={savingEdit}>
                {savingEdit ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Products;