import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

interface CreateProductsProps {
  open: boolean;
  onClose?: () => void;
  existingBrands?: string[];
}

const CreateProducts = ({ open, onClose, existingBrands: existingBrandsProp = [] }: CreateProductsProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState<number | ''>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [brandId, setBrandId] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchedBrands, setFetchedBrands] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (!open) return;
    (async () => {
      const { data, error } = await supabase.from("brands").select("id, name");
      if (error || !data) {
        setFetchedBrands([]);
        return;
      }
      const mapped = (data as any[]).map((row) => ({
        id: String(row.id),
        name: (row.name as string) ?? "",
      }));
      setFetchedBrands(mapped);
    })().catch(() => setFetchedBrands([]));
  }, [open]);

  const existingBrands =
    existingBrandsProp.length > 0
      ? existingBrandsProp.map((name, idx) => ({ id: String(idx), name }))
      : fetchedBrands;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name || !description || !price || stock === '' || !imageFile || !brandId) {
      setError('Nama, deskripsi, harga, stok, brand, dan file gambar wajib diisi!');
      return;
    }
    const selectedBrand = existingBrands.find((b) => b.id === brandId);
    const brandName = selectedBrand?.name?.trim() ?? "";
    setUploading(true);
    try {
      // Upload image ke Supabase Storage
      const bucket = "product-images";
      const ext = imageFile.name.split(".").pop() ?? "jpg";
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const filePath = `${brandName || "Umum"}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, imageFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError || !uploadData?.path) {
        throw uploadError ?? new Error("Gagal mengunggah gambar.");
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(uploadData.path);

      const { error } = await supabase.from("products").insert({
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        stock: Number(stock),
        image: publicUrl,
        // Simpan relasi ke tabel brands lewat ID
        brand_id: brandId,        // Simpan juga nama brand agar fitur lain yang masih pakai kolom "brand" tetap jalan
  
      });
      if (error) throw error;
      // alert('Produk berhasil ditambahkan!');
      if (onClose) onClose();
      setName('');
      setDescription('');
      setPrice('');
      setStock('');
      setImageFile(null);
      setBrandId('');
    } catch (err: any) {
      setError(err.message || 'Gagal tambah produk.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v && onClose) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Produk Baru</DialogTitle>
          <DialogDescription>Isi data lengkap produk. Produk akan tampil di halaman Products sesuai brand yang dipilih.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label>Nama Produk</Label>
            <Input
              placeholder="Contoh: Digital X-Ray System"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Brand</Label>
            <select
              className="border rounded px-3 py-2 w-full"
              value={brandId}
              onChange={e => setBrandId(e.target.value)}
              required
            >
              <option value="">Pilih brand</option>
              {existingBrands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Harga</Label>
            <Input
              placeholder="Contoh: Rp 5.000.000 atau Contact for pricing"
              value={price}
              onChange={e => setPrice(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Stok</Label>
            <Input
              type="number"
              min={0}
              placeholder="Contoh: 10"
              value={stock}
              onChange={e => {
                const v = e.target.value;
                setStock(v === '' ? '' : Number(v));
              }}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Deskripsi</Label>
            <Input
              placeholder="Deskripsi singkat produk"
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Gambar Produk</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={e => {
                const file = e.target.files?.[0] ?? null;
                setImageFile(file);
              }}
              required
            />
          </div>
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          <DialogFooter>
            <Button type="submit" disabled={uploading}>{uploading ? "Saving..." : "Create Product"}</Button>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateProducts;