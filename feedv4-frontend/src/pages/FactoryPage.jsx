import React, { useEffect, useState } from 'react';

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const emptyForm = {
  id: null,
  name: '',
  registrationNumber: '',
  address: '',
  contactNumber: '',
  email: '',
  logoUrl: ''
};

const FactoryPage = () => {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [preview, setPreview] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const fetchList = async (query = '') => {
    setLoading(true);
    try {
      const url = query ? `${API_BASE}/api/factories?q=${encodeURIComponent(query)}` : `${API_BASE}/api/factories`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('List failed');
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setPreview('');
    setIsEditing(false);
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onUploadLogo = async (file) => {
    if (!file) return;
    // local preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    // upload to backend -> returns { url }
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch(`${API_BASE}/api/files/upload`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error(await res.text().catch(() => 'Upload failed'));
      const json = await res.json();
      if (!json?.url) throw new Error('No url in upload response');
      setForm((f) => ({ ...f, logoUrl: json.url }));
    } catch (e) {
      console.error(e);
      alert('Logo upload failed');
      // drop preview if upload fails
      setPreview('');
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // basic validation
      if (!form.name?.trim()) return alert('Name is required');

      const isUpdate = !!form.id;
      const url = isUpdate ? `${API_BASE}/api/factories/${form.id}` : `${API_BASE}/api/factories`;
      const method = isUpdate ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: form.id,
          name: form.name?.trim(),
          registrationNumber: form.registrationNumber?.trim() || null,
          address: form.address?.trim() || null,
          contactNumber: form.contactNumber?.trim() || null,
          email: form.email?.trim() || null,
          logoUrl: form.logoUrl || null
        })
      });
      if (!res.ok) {
        const msg = await res.text().catch(() => '');
        throw new Error(msg || 'Save failed');
      }
      await fetchList(q);
      resetForm();
      alert('Saved');
    } catch (e) {
      console.error(e);
      alert(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (row) => {
    setIsEditing(true);
    setForm({
      id: row.id,
      name: row.name || '',
      registrationNumber: row.registrationNumber || '',
      address: row.address || '',
      contactNumber: row.contactNumber || '',
      email: row.email || '',
      logoUrl: row.logoUrl || ''
    });
    setPreview(row.logoUrl || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this factory?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/factories/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      await fetchList(q);
    } catch (e) {
      console.error(e);
      alert('Delete failed');
    }
  };

  const onSearch = async (e) => {
    e.preventDefault();
    await fetchList(q);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-gray-800 space-y-8">
      <div className="bg-white border rounded-md shadow p-6">
        <h2 className="text-xl font-semibold mb-4">{isEditing ? 'Edit Factory' : 'Add Factory'}</h2>

        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                required
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Factory name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Registration Number</label>
              <input
                name="registrationNumber"
                value={form.registrationNumber}
                onChange={onChange}
                className="w-full border rounded-md px-3 py-2 text-sm"
                placeholder="e.g., BR-2025-0012"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Contact Number</label>
              <input
                name="contactNumber"
                value={form.contactNumber}
                onChange={onChange}
                className="w-full border rounded-md px-3 py-2 text-sm"
                placeholder="+94 7X XXX XXXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                className="w-full border rounded-md px-3 py-2 text-sm"
                placeholder="factory@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <textarea
                name="address"
                value={form.address}
                onChange={onChange}
                rows={3}
                className="w-full border rounded-md px-3 py-2 text-sm"
                placeholder="Street, City"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm px-5 py-2 rounded-md shadow-sm"
              >
                {saving ? 'Saving…' : isEditing ? 'Update' : 'Create'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-sm px-4 py-2 rounded-md border"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium mb-1">Logo</label>
            {preview ? (
              <div className="flex items-center gap-4">
                <img
                  src={preview}
                  alt="logo preview"
                  className="w-20 h-20 object-contain border rounded bg-white"
                />
                <div className="flex gap-2">
                  <label className="cursor-pointer text-blue-600 hover:underline text-sm">
                    Replace
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => onUploadLogo(e.target.files?.[0])}
                    />
                  </label>
                  <button
                    type="button"
                    className="text-red-600 hover:underline text-sm"
                    onClick={() => { setPreview(''); setForm((f) => ({ ...f, logoUrl: '' })); }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer inline-block text-blue-600 hover:underline text-sm">
                Upload logo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onUploadLogo(e.target.files?.[0])}
                />
              </label>
            )}

            {!!form.logoUrl && (
              <p className="text-xs text-gray-500 break-all">Saved URL: {form.logoUrl}</p>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white border rounded-md shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Factories</h2>
          <form onSubmit={onSearch} className="flex items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
              placeholder="Search by name…"
            />
            <button className="text-sm px-3 py-2 rounded-md border">Search</button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[900px] table-auto text-sm w-full">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-3 py-2 text-left">Logo</th>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Reg. No</th>
                <th className="px-3 py-2 text-left">Contact</th>
                <th className="px-3 py-2 text-left">Email</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-sm text-gray-500">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-sm text-gray-500">
                    No factories found.
                  </td>
                </tr>
              )}
              {items.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    {row.logoUrl ? (
                      <img
                        src={row.logoUrl}
                        alt="logo"
                        className="w-10 h-10 object-contain border rounded bg-white"
                      />
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2">{row.name || '—'}</td>
                  <td className="px-3 py-2">{row.registrationNumber || '—'}</td>
                  <td className="px-3 py-2">{row.contactNumber || '—'}</td>
                  <td className="px-3 py-2">{row.email || '—'}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-3 text-xs">
                      <button
                        onClick={() => onEdit(row)}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(row.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FactoryPage;
