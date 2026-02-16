import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc, setDoc, deleteDoc, query, where } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CONFIG_PATH = "config";
const CONFIG_ID = "products";

export default function ManageBrandLogos() {
  const [brandLogos, setBrandLogos] = useState<Record<string, string>>({});
  const [brands, setBrands] = useState<string[]>([]);
  const [brandCounts, setBrandCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingBrand, setDeletingBrand] = useState<string | null>(null);
  const [newBrand, setNewBrand] = useState("");

  const loadData = () => {
    Promise.all([
      getDocs(collection(db, "products")),
      getDoc(doc(db, CONFIG_PATH, CONFIG_ID)),
    ])
      .then(([productsSnap, configSnap]) => {
        const brandSet = new Set<string>();
        const counts: Record<string, number> = {};
        productsSnap.docs.forEach((d) => {
          const b = (d.data() as { brand?: string }).brand?.trim();
          if (b) {
            brandSet.add(b);
            counts[b] = (counts[b] ?? 0) + 1;
          }
        });
        setBrands(Array.from(brandSet).sort());
        setBrandCounts(counts);
        const logos = (configSnap.data()?.brandLogos as Record<string, string>) ?? {};
        setBrandLogos(logos);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogoChange = (brand: string, value: string) => {
    setBrandLogos((prev) => ({ ...prev, [brand]: value }));
  };

  const handleAddBrand = () => {
    const b = newBrand.trim();
    if (!b) return;
    if (brands.includes(b)) return;
    setBrands((prev) => [...prev, b].sort());
    setNewBrand("");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, CONFIG_PATH, CONFIG_ID), { brandLogos }, { merge: true });
      alert("Logo brand berhasil disimpan.");
    } catch (e) {
      alert("Gagal menyimpan: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBrand = async (brandName: string) => {
    const count = brandCounts[brandName] ?? 0;
    const msg = count > 0
      ? `Hapus brand "${brandName}"? ${count} produk di brand ini juga akan dihapus.`
      : `Hapus brand "${brandName}"?`;
    if (!window.confirm(msg)) return;
    setDeletingBrand(brandName);
    try {
      const productsSnap = await getDocs(
        query(collection(db, "products"), where("brand", "==", brandName))
      );
      await Promise.all(productsSnap.docs.map((d) => deleteDoc(doc(db, "products", d.id))));
      const newLogos = { ...brandLogos };
      delete newLogos[brandName];
      await setDoc(doc(db, CONFIG_PATH, CONFIG_ID), { brandLogos: newLogos }, { merge: true });
      setBrandLogos(newLogos);
      setBrands((prev) => prev.filter((b) => b !== brandName));
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
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Logo Brand</h3>
      <p className="text-sm text-gray-600 mb-4">
        Atur URL gambar logo per brand. Logo akan tampil di samping judul brand di halaman Products.
      </p>
      <div className="space-y-3 max-w-xl">
        {brands.map((brand) => (
          <div key={brand} className="flex items-center gap-3">
            <Label className="w-28 shrink-0 text-sm font-medium">{brand}</Label>
            <Input
              placeholder="/logo.png atau https://..."
              value={brandLogos[brand] ?? ""}
              onChange={(e) => handleLogoChange(brand, e.target.value)}
              className="flex-1"
            />
          </div>
        ))}
        <div className="flex items-center gap-3">
          <Input
            placeholder="Nama brand baru"
            value={newBrand}
            onChange={(e) => setNewBrand(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddBrand())}
            className="w-28"
          />
          <Button type="button" variant="outline" size="sm" onClick={handleAddBrand}>
            Tambah brand
          </Button>
        </div>
        <Button onClick={handleSave} disabled={saving} size="sm">
          {saving ? "Menyimpan..." : "Simpan logo brand"}
        </Button>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Daftar Brand</h3>
        <p className="text-sm text-gray-600 mb-4">
          Hapus brand akan menghapus brand dan semua produk di dalamnya.
        </p>
        <div className="overflow-x-auto shadow rounded-lg border border-gray-200">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">No</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Brand</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Jumlah Produk</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Aksi</th>
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
                  <tr key={brand} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{brand}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{brandCounts[brand] ?? 0}</td>
                    <td className="px-4 py-3">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={deletingBrand === brand}
                        onClick={() => handleDeleteBrand(brand)}
                      >
                        {deletingBrand === brand ? "Menghapus..." : "Hapus"}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
