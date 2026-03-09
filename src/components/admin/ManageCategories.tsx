import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Edit, Plus, Tag } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

const ManageCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form states
  const [name, setName] = useState("");

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug, created_at')
        .order('name');
      
      if (error) {
        console.error('Load categories error:', error);
        throw error;
      }
      
      setCategories(data || []);
    } catch (error: any) {
      console.error('Error loading categories:', error);
      const errorMessage = error?.message || 'Unknown error';
      alert(`Failed to load categories: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debug current user session
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) console.error('Auth error:', error);
    };
    
    checkAuth();
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      const categoryData = {
        name: name.trim(),
      };

      if (editingCategory) {
        const { data, error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', editingCategory.id)
          .select();
        
        if (error) {
          console.error('Update error:', error);
          throw error;
        }
      } else {
        const { data, error } = await supabase
          .from('categories')
          .insert([categoryData])
          .select();
        
        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
      }

      await loadCategories();
      resetForm();
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error('Full error object:', error);
      const errorMessage = error?.message || 'Unknown error occurred';
      const errorCode = error?.code || 'No error code';
      
      alert(`Failed to save category:\nError: ${errorMessage}\nCode: ${errorCode}\n\nThis might be due to RLS (Row Level Security) policy. Please check database permissions.`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    setDeleting(id);
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingCategory(null);
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
          <h2 className="text-2xl font-bold text-gray-900">Manage Categories</h2>
          <p className="text-gray-600">Add, edit, or remove product categories</p>
         
        </div>
        <Button onClick={handleAddNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((category) => (
          <Card key={category.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Tag className="h-5 w-5 text-primary" />
                    {category.name}
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">Slug: {category.slug}</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(category)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(category.id)}
                    disabled={deleting === category.id}
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

      {categories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No categories found</p>
          <Button onClick={handleAddNew}>Add your first category</Button>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Category Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dental Instruments, Dental Lab"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Slug will be generated automatically from the name
              </p>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={saving} className="flex-1">
                {saving ? 'Saving...' : editingCategory ? 'Update Category' : 'Add Category'}
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

export default ManageCategories;