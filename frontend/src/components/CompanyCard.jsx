import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Package, ArrowLeftRight, Sparkles } from 'lucide-react';
import api from '../api/axios';

export default function CompanyCard({ company, matchScore }) {
  const navigate = useNavigate();
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);

  const score = parseFloat(company.credibility_score) || 50;
  const stars = Math.round((score / 100) * 5);

  const handleRequest = async (e) => {
    e.stopPropagation();
    setRequesting(true);
    try {
      await api.post('/requests', { receiver_id: company.id, message: 'I am interested in exchanging with your company.' });
      setRequested(true);
    } catch {
      alert('Could not send request. You may have already sent one.');
    } finally {
      setRequesting(false);
    }
  };

  // Safely parse products — DB may return null or a JSON array
  let products = [];
  try {
    const raw = company.products;
    if (Array.isArray(raw)) products = raw.filter(Boolean);
    else if (typeof raw === 'string') products = JSON.parse(raw).filter(Boolean);
  } catch { products = []; }

  return (
    <div className="card p-5 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/company/${company.id}`)}>
      {matchScore !== undefined && (
        <div className="flex items-center gap-1 mb-3">
          <Sparkles size={13} className="text-amber-500" />
          <span className="text-xs font-semibold text-amber-600">{Math.round((parseFloat(matchScore) || 0) * 100)}% match</span>
        </div>
      )}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center text-sky-700 font-bold text-lg">
            {company.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">{company.name}</h3>
            <span className="badge bg-sky-50 text-sky-700">{company.industry}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-0.5 justify-end">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} className={i < stars ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'} />
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{score.toFixed(0)}/100</p>
        </div>
      </div>

      {company.location && (
        <div className="flex items-center gap-1 text-xs text-slate-400 mb-3">
          <MapPin size={12} /> {company.location}
        </div>
      )}

      {products.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-1 text-xs text-slate-500 mb-1.5">
            <Package size={12} /> Products
          </div>
          <div className="flex flex-wrap gap-1">
            {products.slice(0, 3).map((p, i) => (
              <span key={i} className={`badge ${p.product_type === 'byproduct' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                {p.name}
              </span>
            ))}
            {products.length > 3 && <span className="badge bg-slate-100 text-slate-500">+{products.length - 3}</span>}
          </div>
        </div>
      )}

      <div className="flex gap-2 mt-4">
        <button onClick={(e) => { e.stopPropagation(); navigate(`/company/${company.id}`); }}
          className="btn-secondary flex-1 text-center">
          View Profile
        </button>
        <button onClick={handleRequest} disabled={requesting || requested}
          className={`flex items-center gap-1.5 justify-center flex-1 ${requested ? 'btn-success' : 'btn-primary'}`}>
          <ArrowLeftRight size={14} />
          {requested ? 'Requested' : requesting ? '...' : 'Request'}
        </button>
      </div>
    </div>
  );
}
