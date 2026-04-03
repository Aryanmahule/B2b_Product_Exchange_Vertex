import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { MapPin, Star, Package, ArrowLeftRight, ArrowLeft } from 'lucide-react';

export default function CompanyProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    api.get(`/companies/${id}`).then((r) => setCompany(r.data)).finally(() => setLoading(false));
  }, [id]);

  const handleRequest = async () => {
    setRequesting(true);
    try {
      await api.post('/requests', { receiver_id: id, message: 'I am interested in exchanging with your company.' });
      setRequested(true);
    } catch {
      alert('Could not send request.');
    } finally {
      setRequesting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full" /></div>;
  if (!company) return <div className="text-center py-16 text-slate-400">Company not found</div>;

  const score = parseFloat(company.credibility_score) || 50;
  const stars = Math.round((score / 100) * 5);
  let products = [];
  try {
    const raw = company.products;
    if (Array.isArray(raw)) products = raw.filter(Boolean);
    else if (typeof raw === 'string') products = JSON.parse(raw).filter(Boolean);
  } catch { products = []; }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="card p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-sky-100 rounded-2xl flex items-center justify-center text-sky-700 font-bold text-2xl">
              {company.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">{company.name}</h1>
              <span className="badge bg-sky-50 text-sky-700 mt-1">{company.industry}</span>
              {company.location && (
                <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                  <MapPin size={12} /> {company.location}
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-0.5 justify-end mb-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className={i < stars ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'} />
              ))}
            </div>
            <p className="text-sm font-semibold text-slate-700">{score.toFixed(0)}/100</p>
            <p className="text-xs text-slate-400">Credibility</p>
          </div>
        </div>

        {company.description && <p className="text-sm text-slate-600 mb-4">{company.description}</p>}

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {company.needs && (
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Looking For</p>
              <p className="text-sm text-slate-700">{company.needs}</p>
            </div>
          )}
          {company.offerings && (
            <div className="bg-emerald-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2">Offerings</p>
              <p className="text-sm text-slate-700">{company.offerings}</p>
            </div>
          )}
        </div>

        <button onClick={handleRequest} disabled={requesting || requested}
          className={`flex items-center gap-2 ${requested ? 'btn-success' : 'btn-primary'}`}>
          <ArrowLeftRight size={16} />
          {requested ? 'Request Sent' : requesting ? 'Sending...' : 'Request Exchange'}
        </button>
      </div>

      {products.length > 0 && (
        <div className="card p-6">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Package size={18} /> Products & By-products
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {products.map((p, i) => (
              <div key={i} className="border border-slate-100 rounded-xl p-4">
                <div className="flex items-start justify-between mb-1">
                  <p className="font-medium text-slate-800 text-sm">{p.name}</p>
                  <span className={`badge ${p.product_type === 'byproduct' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                    {p.product_type === 'byproduct' ? 'By-product' : 'Main'}
                  </span>
                </div>
                {p.category && <p className="text-xs text-slate-400 mb-1">{p.category}</p>}
                {p.description && <p className="text-xs text-slate-500 line-clamp-2">{p.description}</p>}
                {p.price && <p className="text-sm font-semibold text-slate-700 mt-2">${parseFloat(p.price).toLocaleString()}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
