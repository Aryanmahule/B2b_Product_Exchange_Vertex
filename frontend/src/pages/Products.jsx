import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';

function ProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState(product || { name: '', category: '', description: '', quantity: '', price: '', product_type: 'main' });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== undefined && v !== null) fd.append(k, v); });
      if (product?.id) {
        const res = await api.put(`/products/${product.id}`, fd);
        onSave(res.data, 'update');
      } else {
        const res = await api.post('/products', fd);
        onSave(res.data, 'create');
      }
      onClose();
    } catch (e) {
      alert(e.response?.data?.error || 'Error saving product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-lg p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-5">{product?.id ? 'Edit Product' : 'Add Product'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Product Name *</label>
              <input className="input" value={form.name} onChange={set('name')} required />
            </div>
            <div>
              <label className="label">Category</label>
              <input className="input" placeholder="e.g. Metals, Plastics" value={form.category} onChange={set('category')} />
            </div>
            <div>
              <label className="label">Type</label>
              <select className="input" value={form.product_type} onChange={set('product_type')}>
                <option value="main">Main Product</option>
                <option value="byproduct">By-product</option>
              </select>
            </div>
            <div>
              <label className="label">Quantity</label>
              <input className="input" placeholder="e.g. 500 tons" value={form.quantity} onChange={set('quantity')} />
            </div>
            <div>
              <label className="label">Price (USD)</label>
              <input className="input" type="number" step="0.01" placeholder="Optional" value={form.price} onChange={set('price')} />
            </div>
            <div className="col-span-2">
              <label className="label">Description</label>
              <textarea className="input" rows={3} value={form.description} onChange={set('description')} />
            </div>
            <div className="col-span-2">
              <label className="label">Image</label>
              <input className="input" type="file" accept="image/*" onChange={(e) => setForm({ ...form, image: e.target.files[0] })} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Saving...' : 'Save Product'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    api.get('/products').then((r) => setProducts(r.data)).finally(() => setLoading(false));
  }, []);

  const handleSave = (product, action) => {
    if (action === 'create') setProducts((p) => [product, ...p]);
    else setProducts((p) => p.map((x) => x.id === product.id ? product : x));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this product?')) return;
    await api.delete(`/products/${id}`);
    setProducts((p) => p.filter((x) => x.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Products</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your product listings</p>
        </div>
        <button onClick={() => setModal({})} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="card p-5 animate-pulse h-32" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Package size={40} className="mx-auto mb-3 opacity-30" />
          <p>No products yet. Add your first product.</p>
          <button onClick={() => setModal({})} className="btn-primary mt-4">Add Product</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.id} className="card p-5">
              {p.image_url && (
                <img src={p.image_url} alt={p.name} className="w-full h-32 object-cover rounded-lg mb-3" />
              )}
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-slate-800 text-sm">{p.name}</h3>
                <span className={`badge ${p.product_type === 'byproduct' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                  {p.product_type === 'byproduct' ? 'By-product' : 'Main'}
                </span>
              </div>
              {p.category && <p className="text-xs text-slate-400 mb-1">{p.category}</p>}
              {p.description && <p className="text-xs text-slate-500 mb-2 line-clamp-2">{p.description}</p>}
              <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                {p.quantity && <span>Qty: {p.quantity}</span>}
                {p.price && <span className="font-medium text-slate-700">${parseFloat(p.price).toLocaleString()}</span>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setModal(p)} className="btn-secondary flex-1 flex items-center justify-center gap-1">
                  <Pencil size={13} /> Edit
                </button>
                <button onClick={() => handleDelete(p.id)} className="btn-danger flex-1 flex items-center justify-center gap-1">
                  <Trash2 size={13} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal !== null && (
        <ProductModal product={modal.id ? modal : null} onClose={() => setModal(null)} onSave={handleSave} />
      )}
    </div>
  );
}
