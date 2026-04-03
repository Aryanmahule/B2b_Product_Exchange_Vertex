import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import CompanyCard from '../components/CompanyCard';
import { Search, Filter } from 'lucide-react';

const INDUSTRIES = ['', 'Manufacturing', 'Agriculture', 'Chemicals', 'Electronics', 'Plastics & Recycling', 'Forestry & Wood', 'Energy', 'Textiles', 'Food & Beverage', 'Construction'];

export default function Marketplace() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('');
  const [productType, setProductType] = useState('');

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (industry) params.industry = industry;
      if (productType) params.product_type = productType;
      const res = await api.get('/companies', { params });
      setCompanies(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCompanies(); }, [industry, productType]);

  const handleSearch = (e) => { e.preventDefault(); fetchCompanies(); };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Marketplace</h1>
        <p className="text-slate-500 text-sm mt-1">Discover companies and exchange products</p>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9" placeholder="Search companies, products..."
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input md:w-48" value={industry} onChange={(e) => setIndustry(e.target.value)}>
            <option value="">All Industries</option>
            {INDUSTRIES.filter(Boolean).map((i) => <option key={i}>{i}</option>)}
          </select>
          <select className="input md:w-44" value={productType} onChange={(e) => setProductType(e.target.value)}>
            <option value="">All Products</option>
            <option value="main">Main Products</option>
            <option value="byproduct">By-products</option>
          </select>
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Filter size={16} /> Filter
          </button>
        </form>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-3" />
              <div className="h-3 bg-slate-100 rounded w-1/2 mb-2" />
              <div className="h-3 bg-slate-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : companies.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-lg">No companies found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500">{companies.length} companies found</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((c) => <CompanyCard key={c.id} company={c} />)}
          </div>
        </>
      )}
    </div>
  );
}
