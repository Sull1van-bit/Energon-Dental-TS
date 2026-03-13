import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2, Edit, Plus } from "lucide-react";

interface Brand {
  id: string;
  name: string;
  created_at: string;
}

const ManageBrands = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form states
  const [name, setName] = useState("");

  const loadBrands = async () => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setBrands(data || []);
    } catch (error) {
      console.error('Error loading brands:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      const brandData = {
        name: name.trim(),
      };

      console.log('Attempting to save brand:', brandData);

      if (editingBrand) {
        const { data, error } = await supabase
          .from('brands')
          .update(brandData)
          .eq('id', editingBrand.id)
          .select();
        
        if (error) {
          console.error('Brand update error:', error);
          throw error;
        }
        console.log('Brand update successful:', data);
      } else {
        const { data, error } = await supabase
          .from('brands')
          .insert([brandData])
          .select();
        
        if (error) {
          console.error('Brand insert error:', error);
          throw error;
        }
        console.log('Brand insert successful:', data);
      }

      await loadBrands();
      resetForm();
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error('Full brand error object:', error);
      const errorMessage = error?.message || 'Unknown error occurred';
      const errorCode = error?.code || 'No error code';
      
      alert(`Failed to save brand:\nError: ${errorMessage}\nCode: ${errorCode}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this brand?')) return;
    
    setDeleting(id);
    try {
      const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await loadBrands();
    } catch (error) {
      console.error('Error deleting brand:', error);
      alert('Failed to delete brand');
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setName(brand.name);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingBrand(null);
    setName("");
  };

  const handleAddNew = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manage Brands</h2>
          <p className="text-gray-600">Add, edit, or remove product brands</p>
        </div>
        <Button onClick={handleAddNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Brand
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {brands.map((brand) => (
          <Card key={brand.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{brand.name}</CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(brand)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(brand.id)}
                    disabled={deleting === brand.id}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {brands.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No brands found</p>
          <Button onClick={handleAddNew}>Add your first brand</Button>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingBrand ? 'Edit Brand' : 'Add New Brand'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Brand Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Westlake, Nanofill"
                required
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={saving} className="flex-1">
                {saving ? 'Saving...' : editingBrand ? 'Update Brand' : 'Add Brand'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageBrands;