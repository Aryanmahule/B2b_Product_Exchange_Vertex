import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import CompanyCard from '../components/CompanyCard';
import { Sparkles, RefreshCw } from 'lucide-react';

export default function AIMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res = await api.get('/companies/matches');
      setMatches(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMatches(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="text-sky-600" size={24} /> AI Matches
          </h1>
          <p className="text-slate-500 text-sm mt-1">Companies ranked by how well they match your needs and offerings</p>
        </div>
        <button onClick={fetchMatches} disabled={loading} className="btn-secondary flex items-center gap-2">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="card p-4 bg-gradient-to-r from-sky-50 to-indigo-50 border-sky-100">
        <div className="flex items-start gap-3">
          <Sparkles size={20} className="text-sky-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-slate-800">How AI Matching Works</p>
            <p className="text-xs text-slate-500 mt-1">
              Our engine uses TF-IDF cosine similarity to compare your company's needs against other companies' offerings and vice versa.
              Companies with higher mutual benefit scores float to the top of your personalized feed.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-3" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Sparkles size={40} className="mx-auto mb-3 opacity-30" />
          <p>No matches found yet. Complete your profile with needs and offerings to get matched.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.map((c) => (
            <CompanyCard key={c.id} company={c} matchScore={c.match_score} />
          ))}
        </div>
      )}
    </div>
  );
}
