import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const INDUSTRIES = ['Manufacturing', 'Agriculture', 'Chemicals', 'Electronics', 'Plastics & Recycling', 'Forestry & Wood', 'Energy', 'Textiles', 'Food & Beverage', 'Construction', 'Other'];

export default function Profile() {
  const { company, updateCompany } = useAuth();
  const [form, setForm] = useState({ name: company?.name || '', industry: company?.industry || '', location: company?.location || '', contact_person: company?.contact_person || '', needs: company?.needs || '', offerings: company?.offerings || '', description: company?.description || '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/companies/me', form);
      updateCompany(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      alert(e.response?.data?.error || 'Error saving');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Company Profile</h1>
        <p className="text-slate-500 text-sm mt-1">Keep your profile updated to improve AI matching</p>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Company Name</label>
              <input className="input" value={form.name} onChange={set('name')} required />
            </div>
            <div>
              <label className="label">Industry</label>
              <select className="input" value={form.industry} onChange={set('industry')}>
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
              <input className="input" value={form.contact_person} onChange={set('contact_person')} />
            </div>
            <div className="col-span-2">
              <label className="label">Company Description</label>
              <textarea className="input" rows={3} value={form.description} onChange={set('description')} />
            </div>
            <div className="col-span-2">
              <label className="label">What does your company need?</label>
              <textarea className="input" rows={2} placeholder="e.g. scrap metal, plastic waste, organic materials..."
                value={form.needs} onChange={set('needs')} />
              <p className="text-xs text-slate-400 mt-1">Used by AI to find matching suppliers</p>
            </div>
            <div className="col-span-2">
              <label className="label">What does your company offer?</label>
              <textarea className="input" rows={2} placeholder="e.g. steel beams, recycled pellets, chemical byproducts..."
                value={form.offerings} onChange={set('offerings')} />
              <p className="text-xs text-slate-400 mt-1">Used by AI to match you with buyers</p>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            {saved && <span className="text-sm text-emerald-600 font-medium">Saved successfully</span>}
          </div>
        </form>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-slate-800 mb-3">Account Info</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b border-slate-50">
            <span className="text-slate-500">Email</span>
            <span className="text-slate-800">{company?.email}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-50">
            <span className="text-slate-500">Credibility Score</span>
            <span className="font-semibold text-slate-800">{parseFloat(company?.credibility_score || 50).toFixed(0)}/100</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-slate-500">Member since</span>
            <span className="text-slate-800">{company?.created_at ? new Date(company.created_at).toLocaleDateString() : '-'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
