import { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

interface CreateProductsProps {
  open: boolean;
  onClose?: () => void;
}

const CreateProducts = ({ open, onClose }: CreateProductsProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name || !description || !price || !imageUrl) {
      setError('All fields are required!');
      return;
    }
    setUploading(true);
    try {
      // Simpan data produk ke Firestore
      await addDoc(collection(db, 'products'), {
        name: name,
        description,
        price,
        image: imageUrl,
        createdAt: new Date().toISOString()
      });
      // alert('Produk berhasil ditambahkan!');
      if (onClose) onClose();
      setName('');
      setDescription('');
      setPrice('');
      setImageUrl('');
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
          <DialogDescription>Isi data lengkap produk dan url gambar produk (gunakan url image direct). Upload akan difasilitasi nanti.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            placeholder="Product Name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <Input
            placeholder="Price (e.g. 100000)"
            value={price}
            onChange={e => setPrice(e.target.value)}
            required
          />
          <Input
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          />
          <Input
            placeholder="Image URL (https://...)"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            required
          />
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