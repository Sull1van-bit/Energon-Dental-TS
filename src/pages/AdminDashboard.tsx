import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import Products from "@/components/ui/products";

const AdminDashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [selectedMenu, setSelectedMenu] = useState<'products' | 'users'>('products');

  useEffect(() => {
    if (!loading && !user) {
      navigate("/admin/login");
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    const { error } = await signOut();
    if (!error) {
      navigate("/admin/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white h-screen shadow-md flex flex-col justify-between">
        <div>
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-indigo-700">Admin Panel</h1>
            {user && (
              <p className="text-xs text-gray-500 mt-1">{user.email}</p>
            )}
          </div>
          <nav className="mt-8">
            <ul>
              <li>
                <button
                  className={`w-full text-left py-3 px-6 flex items-center transition bg-transparent hover:bg-orange-300 font-medium ${selectedMenu === 'products' ? 'bg-[#ff6600] text-white' : 'text-gray-600'}`}
                  onClick={() => setSelectedMenu('products')}
                >
                  Products
                </button>
              </li>
              <li>
                <button
                  className={`w-full text-left py-3 px-6 flex items-center transition bg-transparent hover:bg-orange-300 font-medium ${selectedMenu === 'users' ? 'bg-[#ff6600] text-white' : 'text-gray-600'}`}
                  onClick={() => setSelectedMenu('users')}
                >
                  Users
                </button>
              </li>
            </ul>
          </nav>
        </div>
        <div className="p-6 border-t">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {selectedMenu === 'products' && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Products Management</h2>
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Add New Product
              </button>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <Products />
            </div>
          </section>
        )}
        {selectedMenu === 'users' && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
            </div>
            <div className="bg-white shadow rounded-lg p-6 min-h-[200px] flex items-center justify-center text-gray-400">
              {/* TODO: Ganti dengan komponen tabel user nanti */}
              User table coming soon...
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
