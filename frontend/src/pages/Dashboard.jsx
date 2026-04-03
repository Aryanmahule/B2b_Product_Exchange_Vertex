import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Package, ArrowLeftRight, MessageSquare, Sparkles, TrendingUp, Star, CheckCircle } from 'lucide-react';

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { company } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [requests, setRequests] = useState([]);
  const [negotiations, setNegotiations] = useState([]);

  useEffect(() => {
    api.get('/analytics').then((r) => setAnalytics(r.data)).catch(() => {});
    api.get('/requests').then((r) => setRequests(r.data.slice(0, 5))).catch(() => {});
    api.get('/negotiations').then((r) => setNegotiations(r.data.slice(0, 5))).catch(() => {});
  }, []);

  const statusColor = { pending: 'bg-amber-100 text-amber-700', accepted: 'bg-emerald-100 text-emerald-700', rejected: 'bg-red-100 text-red-600', completed: 'bg-sky-100 text-sky-700' };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Welcome back, {company?.name}</h1>
        <p className="text-slate-500 text-sm mt-1">{company?.industry} · {company?.location}</p>
      </div>

      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Package} label="My Products" value={analytics.total_products} color="bg-sky-500" />
          <StatCard icon={ArrowLeftRight} label="Total Requests" value={analytics.total_requests} color="bg-violet-500" />
          <StatCard icon={MessageSquare} label="Active Negotiations" value={analytics.active_negotiations} color="bg-amber-500" />
          <StatCard icon={CheckCircle} label="Completed Deals" value={analytics.completed_deals} color="bg-emerald-500" />
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Credibility */}
        {analytics && (
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Star size={18} className="text-amber-500" />
              <h2 className="font-semibold text-slate-800">Credibility Score</h2>
            </div>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-bold text-slate-800">{parseFloat(analytics.credibility_score).toFixed(0)}</span>
              <span className="text-slate-400 mb-1">/100</span>
            </div>
            <div className="mt-3 bg-slate-100 rounded-full h-2">
              <div className="bg-amber-400 h-2 rounded-full transition-all" style={{ width: `${parseFloat(analytics.credibility_score) || 0}%` }} />
            </div>
            <p className="text-xs text-slate-400 mt-2">Based on completed deals, response time, and ratings</p>
          </div>
        )}

        {/* AI Matches teaser */}
        <div className="card p-5 bg-gradient-to-br from-sky-50 to-indigo-50 border-sky-100">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={18} className="text-sky-600" />
            <h2 className="font-semibold text-slate-800">AI Matches</h2>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Our AI engine found <strong>{analytics?.matches_found || 0}</strong> potential partners based on your needs and offerings.
          </p>
          <button onClick={() => navigate('/matches')} className="btn-primary">
            View Best Matches
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Requests */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Recent Requests</h2>
            <button onClick={() => navigate('/requests')} className="text-xs text-sky-600 hover:underline">View all</button>
          </div>
          {requests.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No requests yet</p>
          ) : (
            <div className="space-y-3">
              {requests.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {r.requester_id === company?.id ? `To: ${r.receiver_name}` : `From: ${r.requester_name}`}
                    </p>
                    <p className="text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`badge ${statusColor[r.status]}`}>{r.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Negotiations */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Active Negotiations</h2>
            <button onClick={() => navigate('/negotiations')} className="text-xs text-sky-600 hover:underline">View all</button>
          </div>
          {negotiations.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No negotiations yet</p>
          ) : (
            <div className="space-y-3">
              {negotiations.map((n) => (
                <div key={n.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0 cursor-pointer hover:bg-slate-50 rounded px-1"
                  onClick={() => navigate(`/negotiations/${n.id}`)}>
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {n.buyer_id === company?.id ? n.seller_name : n.buyer_name}
                    </p>
                    <p className="text-xs text-slate-400">{n.product_name || 'General exchange'}</p>
                  </div>
                  <span className={`badge ${n.status === 'active' ? 'bg-emerald-100 text-emerald-700' : n.status === 'deal_made' ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-500'}`}>
                    {n.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
