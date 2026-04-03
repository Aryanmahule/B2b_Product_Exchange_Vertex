import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles } from 'lucide-react';

const INDUSTRIES = ['Manufacturing', 'Agriculture', 'Chemicals', 'Electronics', 'Plastics & Recycling', 'Forestry & Wood', 'Energy', 'Textiles', 'Food & Beverage', 'Construction', 'Other'];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', industry: '', location: '', contact_person: '', email: '', password: '', needs: '', offerings: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-sky-600 rounded-2xl mb-4">
            <Sparkles size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">SymbioTrade</h1>
          <p className="text-slate-500 text-sm mt-1">Create your company account</p>
        </div>
        <div className="card p-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Company Registration</h2>
          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">Company Name *</label>
                <input className="input" placeholder="Acme Corp" value={form.name} onChange={set('name')} required />
              </div>
              <div>
                <label className="label">Industry *</label>
                <select className="input" value={form.industry} onChange={set('industry')} required>
                  <option value="">Select industry</option>
                  {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Location</label>
                <input className="input" placeholder="City, State" value={form.location} onChange={set('location')} />
              </div>
              <div className="col-span-2">
                <label className="label">Contact Person</label>
                <input className="input" placeholder="John Smith" value={form.contact_person} onChange={set('contact_person')} />
              </div>
              <div>
                <label className="label">Email *</label>
                <input className="input" type="email" placeholder="you@company.com" value={form.email} onChange={set('email')} required />
              </div>
              <div>
                <label className="label">Password *</label>
                <input className="input" type="password" placeholder="Min 6 chars" value={form.password} onChange={set('password')} required minLength={6} />
              </div>
              <div className="col-span-2">
                <label className="label">What does your company need?</label>
                <textarea className="input" rows={2} placeholder="e.g. scrap metal, plastic waste, organic materials..."
                  value={form.needs} onChange={set('needs')} />
              </div>
              <div className="col-span-2">
                <label className="label">What does your company offer?</label>
                <textarea className="input" rows={2} placeholder="e.g. steel beams, recycled pellets, chemical byproducts..."
                  value={form.offerings} onChange={set('offerings')} />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-sky-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
