import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

interface CreateProductsProps {
  open: boolean;
  onClose?: () => void;
  existingBrands?: string[];
}

const CreateProducts = ({ open, onClose, existingBrands: existingBrandsProp = [] }: CreateProductsProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [brand, setBrand] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchedBrands, setFetchedBrands] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    getDocs(collection(db, 'products'))
      .then((snap) => {
        const brands = new Set<string>();
        snap.docs.forEach((d) => {
          const b = (d.data() as { brand?: string }).brand;
          if (b && b.trim()) brands.add(b.trim());
        });
        setFetchedBrands(Array.from(brands).sort());
      })
      .catch(() => setFetchedBrands([]));
  }, [open]);

  const existingBrands = existingBrandsProp.length > 0 ? existingBrandsProp : fetchedBrands;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name || !description || !price || !imageUrl) {
      setError('Nama, deskripsi, harga, dan gambar wajib diisi!');
      return;
    }
    const brandName = brand.trim() || 'Umum';
    setUploading(true);
    try {
      await addDoc(collection(db, 'products'), {
        name: name.trim(),
        description: description.trim(),
        price: price.trim(),
        image: imageUrl.trim(),
        brand: brandName,
        createdAt: new Date().toISOString()
      });
      // alert('Produk berhasil ditambahkan!');
      if (onClose) onClose();
      setName('');
      setDescription('');
      setPrice('');
      setImageUrl('');
      setBrand('');
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
            <Input
              placeholder="Contoh: Westlake, Nanofill, MLG (kosongkan = Umum)"
              value={brand}
              onChange={e => setBrand(e.target.value)}
              list="brand-list"
            />
            {existingBrands.length > 0 && (
              <datalist id="brand-list">
                {existingBrands.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            )}
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
            <Label>Deskripsi</Label>
            <Input
              placeholder="Deskripsi singkat produk"
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>URL Gambar</Label>
            <Input
              placeholder="https://... atau /path/gambar.jpg"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
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