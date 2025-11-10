import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDocs, collection, updateDoc } from 'firebase/firestore';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

const UserDashboard = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Owner'); // default Owner, bisa Admin/Owner
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // Fetch semua user dari Firestore
  async function fetchUsers() {
    setLoading(true);
    setError(null);
    try {
      const snap = await getDocs(collection(db, 'users'));
      const users: UserProfile[] = snap.docs.map(docu => {
        const data = docu.data();
        return {
          id: docu.id,
          email: data.email,
          role: data.role,
          created_at: data.created_at || '-',
        }
      });
      setUsers(users);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data user');
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  // Tambah user baru (register Auth + set doc Firestore)
  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    setProcessing(true);
    setError(null); setSuccess(null);
    if (!email || !password) { setError('Lengkapi email & password!'); setProcessing(false); return; }
    try {
      // Create auth account
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const profile = {
        email: userCred.user.email,
        role,
        created_at: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', userCred.user.uid), profile);
      setSuccess('Berhasil menambah user!');
      setEmail(''); setPassword(''); setRole('Owner');
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Gagal tambah user');
    }
    setProcessing(false);
  }

  // Edit role user di firestore
  async function handleRoleChange(id: string, newRole: string) {
    setProcessing(true); setError(null); setSuccess(null);
    try {
      await updateDoc(doc(db, 'users', id), { role: newRole });
      setSuccess('Role berhasil di-update!');
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false); }
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      {/* Form tambah user */}
      <form className="mb-8 space-y-4 bg-white p-6 rounded shadow" onSubmit={handleAddUser}>
        <div className="flex flex-col md:flex-row md:gap-4">
          <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <Input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          <select className="border rounded px-3 py-2" value={role} onChange={e => setRole(e.target.value)}>
            <option value="Owner">Owner</option>
            <option value="Admin">Admin</option>
          </select>
          <Button type="submit" disabled={processing}>{processing ? 'Menambah...' : 'Tambah User'}</Button>
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
      </form>
      {/* Tabel user */}
      <div className="bg-white rounded p-6 shadow">
        <h2 className="text-lg font-semibold mb-3">Daftar User</h2>
        {loading ? <div>Loading...</div> : (
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
              {users.map(user => (
                <tr key={user.id}>
                  <td className="border px-2 py-1">{user.email}</td>
                  <td className="border px-2 py-1">
                    <select value={user.role} onChange={e => handleRoleChange(user.id, e.target.value)} className="border rounded px-2 py-1">
                      <option value="Owner">Owner</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </td>
                  <td className="border px-2 py-1 whitespace-nowrap">{user.created_at ? new Date(user.created_at).toLocaleString() : '-'}</td>
                  <td className="border px-2 py-1">-</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
