import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { BarChart2, Package, ArrowLeftRight, MessageSquare, CheckCircle, Sparkles, Star } from 'lucide-react';

function MetricCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="card p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-sm font-medium text-slate-700 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics').then((r) => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full" /></div>;
  if (!data) return <div className="text-center py-16 text-slate-400">Could not load analytics.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">Your platform activity overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <MetricCard icon={Package} label="Products Listed" value={data.total_products} color="bg-sky-500" />
        <MetricCard icon={ArrowLeftRight} label="Total Requests" value={data.total_requests} color="bg-violet-500" />
        <MetricCard icon={MessageSquare} label="Active Negotiations" value={data.active_negotiations} color="bg-amber-500" />
        <MetricCard icon={CheckCircle} label="Completed Deals" value={data.completed_deals} sub="Exchanges finalized" color="bg-emerald-500" />
        <MetricCard icon={Sparkles} label="AI Matches" value={data.matches_found} sub="Potential partners" color="bg-indigo-500" />
        <MetricCard icon={BarChart2} label="Total Negotiations" value={data.total_negotiations} color="bg-rose-500" />
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Star size={18} className="text-amber-500" />
          <h2 className="font-semibold text-slate-800">Credibility Score</h2>
        </div>
        <div className="flex items-end gap-3 mb-3">
          <span className="text-5xl font-bold text-slate-800">{parseFloat(data.credibility_score).toFixed(0)}</span>
          <span className="text-slate-400 mb-2 text-lg">/100</span>
        </div>
        <div className="bg-slate-100 rounded-full h-3 mb-3">
          <div className="h-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all"
            style={{ width: `${parseFloat(data.credibility_score) || 0}%` }} />
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4 text-center">
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-lg font-bold text-slate-800">{data.completed_deals}</p>
            <p className="text-xs text-slate-500">Completed Deals</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-lg font-bold text-slate-800">{data.active_negotiations}</p>
            <p className="text-xs text-slate-500">Active Now</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-lg font-bold text-slate-800">{data.matches_found}</p>
            <p className="text-xs text-slate-500">AI Matches</p>
          </div>
        </div>
      </div>
    </div>
  );
}
