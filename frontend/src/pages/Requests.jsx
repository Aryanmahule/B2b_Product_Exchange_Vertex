import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { ArrowLeftRight, CheckCircle, XCircle } from 'lucide-react';

const statusColor = {
  pending: 'bg-amber-100 text-amber-700',
  accepted: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-600',
  completed: 'bg-sky-100 text-sky-700',
};

export default function Requests() {
  const { company } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    api.get('/requests').then((r) => setRequests(r.data)).finally(() => setLoading(false));
  }, []);

  const handleAction = async (id, status) => {
    try {
      const res = await api.put(`/requests/${id}`, { status });
      setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
      if (status === 'accepted' && res.data.negotiation) {
        navigate(`/negotiations/${res.data.negotiation.id}`);
      }
    } catch (e) {
      alert(e.response?.data?.error || 'Error');
    }
  };

  const filtered = requests.filter((r) => {
    if (tab === 'sent') return r.requester_id === company?.id;
    if (tab === 'received') return r.receiver_id === company?.id;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Exchange Requests</h1>
        <p className="text-slate-500 text-sm mt-1">Manage incoming and outgoing exchange requests</p>
      </div>

      <div className="flex gap-2">
        {['all', 'sent', 'received'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-sky-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="card p-4 animate-pulse h-16" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <ArrowLeftRight size={40} className="mx-auto mb-3 opacity-30" />
          <p>No requests found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const isSender = r.requester_id === company?.id;
            return (
              <div key={r.id} className="card p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-slate-400">{isSender ? 'Sent to' : 'From'}</span>
                    <span className="text-sm font-medium text-slate-800">
                      {isSender ? r.receiver_name : r.requester_name}
                    </span>
                    <span className="badge bg-slate-100 text-slate-500 text-xs">{isSender ? r.receiver_industry : r.requester_industry}</span>
                  </div>
                  {r.message && <p className="text-xs text-slate-500 truncate">{r.message}</p>}
                  <p className="text-xs text-slate-400 mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`badge ${statusColor[r.status]}`}>{r.status}</span>
                  {!isSender && r.status === 'pending' && (
                    <>
                      <button onClick={() => handleAction(r.id, 'accepted')}
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">
                        <CheckCircle size={18} />
                      </button>
                      <button onClick={() => handleAction(r.id, 'rejected')}
                        className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                        <XCircle size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
