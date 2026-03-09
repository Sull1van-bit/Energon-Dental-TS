import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";

interface CreateProductsProps {
  open: boolean;
  onClose?: () => void;
  onCreated?: () => void;
}

const CreateProducts = ({ open, onClose, onCreated }: CreateProductsProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState<number | ''>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [brandId, setBrandId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (!open) return;
    
    const loadData = async () => {
      try {
        // Load brands
        const { data: brandsData, error: brandsError } = await supabase
          .from("brands")
          .select("id, name")
          .order('name');
        
        if (brandsError) throw brandsError;
        setBrands(brandsData || []);
        
        // Load categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("id, name")
          .order('name');
        
        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
  }, [open]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setStock('');
    setImageFile(null);
    setBrandId('');
    setCategoryId('');
    setError(null);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    
    if (!name || !description || !price || stock === '' || !imageFile || !brandId || !categoryId) {
      setError('Semua field wajib diisi!');
      return;
    }
    
    const selectedBrand = brands.find((b) => b.id === brandId);
    const selectedCategory = categories.find((c) => c.id === categoryId);
    const brandName = selectedBrand?.name?.trim() ?? "";
    
    console.log('Saving product with:', {
      brandId,
      categoryId,
      brandName,
      categoryName: selectedCategory?.name
    });
    
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
        brand_id: brandId,
        category_id: categoryId,
      });
      
      if (error) {
        console.error('Database error:', error);
        throw new Error(`Failed to save product: ${error.message}`);
      }
      
      resetForm();
      if (onCreated) {
        onCreated();
      } else if (onClose) {
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Gagal tambah produk.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && onClose) onClose(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tambah Produk Baru</DialogTitle>
          <DialogDescription>
            Isi data lengkap produk. Produk akan tampil di halaman Products sesuai brand dan kategori yang dipilih.
          </DialogDescription>
        </DialogHeader>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Brand *</Label>
              <Select value={brandId} onValueChange={setBrandId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {brands.length === 0 && (
                <p className="text-xs text-amber-600">
                  No brands available. Please add brands first in Brands menu.
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Kategori *</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {categories.length === 0 && (
                <p className="text-xs text-amber-600">
                  No categories available. Please add categories first in Categories menu.
                </p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Nama Produk *</Label>
            <Input
              placeholder="Contoh: Digital X-Ray System"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Deskripsi *</Label>
            <Textarea
              placeholder="Deskripsi lengkap produk"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Harga (IDR) *</Label>
              <Input
                type="number"
                placeholder="5000000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>Stok *</Label>
              <Input
                type="number"
                min={0}
                placeholder="10"
                value={stock}
                onChange={(e) => {
                  const v = e.target.value;
                  setStock(v === '' ? '' : Number(v));
                }}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Gambar Produk *</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setImageFile(file);
              }}
              required
            />
            {imageFile && (
              <p className="text-sm text-gray-600">
                File dipilih: {imageFile.name}
              </p>
            )}
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={uploading} className="flex-1">
              {uploading ? 'Menyimpan...' : 'Tambah Produk'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose && onClose()}
              className="flex-1"
            >
              Batal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProducts;