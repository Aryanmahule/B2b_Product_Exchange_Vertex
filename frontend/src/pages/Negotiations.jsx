import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { MessageSquare } from 'lucide-react';

export default function Negotiations() {
  const { company } = useAuth();
  const navigate = useNavigate();
  const [negotiations, setNegotiations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/negotiations').then((r) => setNegotiations(r.data)).finally(() => setLoading(false));
  }, []);

  const statusColor = { active: 'bg-emerald-100 text-emerald-700', deal_made: 'bg-sky-100 text-sky-700', cancelled: 'bg-slate-100 text-slate-500' };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Negotiations</h1>
        <p className="text-slate-500 text-sm mt-1">Active and past negotiations</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="card p-4 animate-pulse h-20" />)}</div>
      ) : negotiations.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
          <p>No negotiations yet. Accept an exchange request to start.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {negotiations.map((n) => {
            const partner = n.buyer_id === company?.id ? n.seller_name : n.buyer_name;
            const role = n.buyer_id === company?.id ? 'Buyer' : 'Seller';
            return (
              <div key={n.id} className="card p-4 flex items-center justify-between gap-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/negotiations/${n.id}`)}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center text-sky-700 font-bold">
                    {partner?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{partner}</p>
                    <p className="text-xs text-slate-400">{n.product_name || 'General exchange'} · You are {role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {n.final_price && (
                    <span className="text-sm font-semibold text-slate-700">${parseFloat(n.final_price).toLocaleString()}</span>
                  )}
                  <span className={`badge ${statusColor[n.status]}`}>{n.status.replace('_', ' ')}</span>
                  <MessageSquare size={16} className="text-slate-400" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
