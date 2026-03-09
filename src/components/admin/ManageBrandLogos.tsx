import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ManageBrandLogos() {
  const [brands, setBrands] = useState<{ id: number | string; name: string }[]>([]);
  const [brandCounts, setBrandCounts] = useState<Record<string | number, number>>({});
  const [loading, setLoading] = useState(true);
  const [deletingBrand, setDeletingBrand] = useState<string | null>(null);
  const [newBrand, setNewBrand] = useState("");

  const loadData = () => {
    Promise.all([
      supabase.from("brands").select("id, name"),
      // Hitung jumlah produk per brand berdasarkan kolom relasi brand_id
      supabase.from("products").select("id, brand_id"),
    ])
      .then(([brandsRes, productsRes]) => {
        const { data: brandsData } = brandsRes;
        const { data: productsData } = productsRes;

        const mappedBrands =
          (brandsData ?? []).map((b: any) => ({
            id: b.id,
            name: (b.name as string) ?? "",
          })) ?? [];
        setBrands(mappedBrands);

        const counts: Record<string | number, number> = {};
        (productsData ?? []).forEach((row: any) => {
          const brandId = row.brand_id as number | string | null | undefined;
          if (brandId == null) return;
          counts[brandId] = (counts[brandId] ?? 0) + 1;
        });
        setBrandCounts(counts);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddBrand = async () => {
    const b = newBrand.trim();
    if (!b) return;
    if (brands.some((br) => br.name.toLowerCase() === b.toLowerCase())) return;

    const { error } = await supabase.from("brands").insert({ name: b });
    if (error) {
      alert("Gagal menambah brand: " + error.message);
      return;
    }

    setNewBrand("");
    loadData();
  };

  const handleDeleteBrand = async (brandName: string) => {
    const count = brandCounts[brandName] ?? 0;
    const msg =
      count > 0
        ? `Hapus brand "${brandName}"? ${count} produk di brand ini juga akan dihapus.`
        : `Hapus brand "${brandName}"?`;
    if (!window.confirm(msg)) return;
    setDeletingBrand(brandName);
    try {
      const { error: deleteProductsError } = await supabase
        .from("products")
        .delete()
        .eq("brand", brandName);
      if (deleteProductsError) throw deleteProductsError;

      const { error: deleteBrandError } = await supabase
        .from("brands")
        .delete()
        .eq("name", brandName);
      if (deleteBrandError) throw deleteBrandError;

      setBrands((prev) => prev.filter((b) => b.name !== brandName));
      setBrandCounts((prev) => {
        const next = { ...prev };
        delete next[brandName];
        return next;
      });
    } catch (e) {
      alert("Gagal hapus brand: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setDeletingBrand(null);
    }
  };

  if (loading) return <p className="text-sm text-gray-500">Memuat...</p>;

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Daftar Brand</h3>
      <p className="text-sm text-gray-600 mb-4">
        Tambah atau hapus brand. Hapus brand akan menghapus semua produk di brand tersebut.
      </p>

      <div className="flex items-center gap-3 mb-6 max-w-md">
        <Input
          placeholder="Nama brand baru"
          value={newBrand}
          onChange={(e) => setNewBrand(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddBrand())}
        />
        <Button type="button" variant="outline" size="sm" onClick={handleAddBrand}>
          Tambah brand
        </Button>
      </div>

      <div className="overflow-x-auto shadow rounded-lg border border-gray-200">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">No</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Brand
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Jumlah Produk
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {brands.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-500 text-sm">
                  Belum ada brand.
                </td>
              </tr>
            ) : (
              brands.map((brand, index) => (
                <tr key={brand.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{brand.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {brandCounts[brand.id] ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={deletingBrand === brand.name}
                      onClick={() => handleDeleteBrand(brand.name)}
                    >
                      {deletingBrand === brand.name ? "Menghapus..." : "Hapus"}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
