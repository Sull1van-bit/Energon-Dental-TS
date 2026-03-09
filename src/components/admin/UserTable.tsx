import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface UserProfile {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

const UserTable = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("staff");

  async function fetchUsers() {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, role, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mapped: UserProfile[] =
        data?.map((u) => ({
          id: u.id as string,
          email: (u.email as string) ?? "",
          role: (u.role as string) ?? "",
          created_at: (u.created_at as string) ?? "-",
        })) ?? [];

      setUsers(mapped);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data user");
    }
    setLoading(false);
  }

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    setProcessing(true);
    setError(null);
    setSuccess(null);
  
    if (!email || !password) {
      setError("Lengkapi email & password!");
      setProcessing(false);
      return;
    }
  
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // langsung confirmed, tidak perlu verifikasi
      });
  
      if (signUpError || !signUpData.user) {
        throw signUpError || new Error("Gagal menambah user");
      }
  
      await new Promise((resolve) => setTimeout(resolve, 1500));
  
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", signUpData.user.id);
  
      if (profileError) throw profileError;
  
      setSuccess("Berhasil menambah user!");
      setEmail("");
      setPassword("");
      setRole("staff");
      void fetchUsers();
    } catch (err: any) {
      setError(err.message || "Gagal menambah user");
    } finally {
      setProcessing(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin mau hapus user ini?")) return;
    setProcessing(true);
    setError(null);
    setSuccess(null);
    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setSuccess("User berhasil dihapus!");
      void fetchUsers();
    } catch (err: any) {
      setError(err.message || "Gagal menghapus user");
    } finally {
      setProcessing(false);
    }
  }

  useEffect(() => {
    void fetchUsers();
  }, []);

  async function handleRoleChange(id: string, newRole: string) {
    setProcessing(true);
    setError(null);
    setSuccess(null);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", id);

      if (error) throw error;
      setSuccess("Role berhasil di-update!");
      void fetchUsers();
    } catch (err: any) {
      setError(err.message || "Gagal mengubah role");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="space-y-4">
      {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
      {success && <div className="text-green-600 text-sm mb-2">{success}</div>}

      <form
        className="mb-4 space-y-2 bg-gray-50 border rounded p-4"
        onSubmit={handleAddUser}
      >
        <div className="flex flex-col md:flex-row md:items-center md:gap-3">
          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="md:flex-1 mb-2 md:mb-0"
          />
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="md:flex-1 mb-2 md:mb-0"
          />
          <select
            className="border rounded px-3 py-2 mb-2 md:mb-0"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
          </select>
          <Button type="submit" disabled={processing}>
            {processing ? "Menambah..." : "Tambah User"}
          </Button>
        </div>
      </form>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">Role</th>
              <th className="px-4 py-2 border">Created</th>
              <th className="px-4 py-2 border">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="border px-2 py-1">{user.email}</td>
                <td className="border px-2 py-1">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="border rounded px-2 py-1"
                    disabled={processing}
                  >
                    <option value="admin">Admin</option>
                    <option value="staff">Staff</option>
                  </select>
                </td>
                <td className="border px-2 py-1 whitespace-nowrap">
                  {user.created_at
                    ? new Date(user.created_at).toLocaleString()
                    : "-"}
                </td>
                <td className="border px-2 py-1">
                  <button
                    onClick={() => handleDelete(user.id)}
                    disabled={processing}
                    className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded disabled:opacity-50"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserTable;

