import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export interface Product {
  id: string;
  name: string;
  description?: string;
  stock?: number;
  price?: number;
  image?: string;
  brand?: string;
  createdAt?: string;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          brands ( name )
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
  }, []);

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

  if (loading) return (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#000099]"></div>
      <span className="ml-2 text-[#000099]">Loading...</span>
    </div>
  );

  if (products.length === 0) return (
    <div className="text-center py-8">
      <p className="text-gray-500">Belum ada produk tersedia.</p>
    </div>
  );

  return (
    <div className="overflow-x-auto shadow-lg rounded-lg">
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
          {products.map((product, index) => (
            <tr key={product.id} className="hover:bg-gray-50 transition-colors duration-200">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#000099]">{index + 1}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                {product.brand || "Umum"}
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
                {typeof product.price === "number" ? product.price : "Contact for pricing"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {product.image ? (
                  <button onClick={() => openImageModal(product.image!)} className="p-0 border-none bg-transparent focus:outline-none">
                    <img src={product.image} alt={product.name} className="h-12 w-12 rounded-lg object-cover border border-gray-200 cursor-pointer transition duration-200 hover:scale-105" />
                  </button>
                ) : (
                  <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-xs text-gray-400">No Image</span>
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <button onClick={() => handleDelete(product.id)} disabled={deleting===product.id} className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded shadow disabled:opacity-50">
                  {deleting===product.id ? 'Menghapus...' : 'Delete'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl flex flex-col items-center">
          {modalImage && (
            <img src={modalImage} alt="Preview" className="max-h-[70vh] rounded shadow border" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Products;