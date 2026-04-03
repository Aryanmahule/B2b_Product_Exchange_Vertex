import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Send, DollarSign, Package, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

export default function NegotiationChat() {
  const { id } = useParams();
  const { company } = useAuth();
  const navigate = useNavigate();
  const [neg, setNeg] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [offerQty, setOfferQty] = useState('');
  const [mode, setMode] = useState('message'); // message | offer
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const fetchData = async () => {
    try {
      const res = await api.get(`/negotiations/${id}`);
      const { messages: msgs, ...negData } = res.data;
      setNeg(negData);
      setMessages(msgs || []);
    } catch {
      navigate('/negotiations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    try {
      const payload = { content, message_type: mode };
      if (mode === 'offer') {
        if (offerPrice) payload.offer_price = offerPrice;
        if (offerQty) payload.offer_quantity = offerQty;
      }
      const res = await api.post(`/negotiations/${id}/messages`, payload);
      setMessages((prev) => [...prev, res.data]);
      setContent('');
      setOfferPrice('');
      setOfferQty('');
    } catch (e) {
      alert(e.response?.data?.error || 'Error sending message');
    } finally {
      setSending(false);
    }
  };

  const handleDeal = async (action) => {
    if (!window.confirm(action === 'accept' ? 'Accept this deal?' : 'Cancel this negotiation?')) return;
    try {
      await api.put(`/negotiations/${id}/deal`, { action, final_price: offerPrice || undefined });
      fetchData();
    } catch (e) {
      alert(e.response?.data?.error || 'Error');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full" /></div>;
  if (!neg) return null;

  const isActive = neg.status === 'active';
  const partner = neg.buyer_id === company?.id ? neg.seller_name : neg.buyer_name;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="card p-4 mb-4 flex items-center gap-3">
        <button onClick={() => navigate('/negotiations')} className="p-1.5 rounded-lg hover:bg-slate-100">
          <ArrowLeft size={18} />
        </button>
        <div className="w-9 h-9 bg-sky-100 rounded-xl flex items-center justify-center text-sky-700 font-bold">
          {partner?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-slate-800">{partner}</p>
          <p className="text-xs text-slate-400">{neg.product_name || 'General exchange'} · {neg.status.replace('_', ' ')}</p>
        </div>
        {neg.product_price && (
          <div className="text-right">
            <p className="text-xs text-slate-400">Listed price</p>
            <p className="font-semibold text-slate-700">${parseFloat(neg.product_price).toLocaleString()}</p>
          </div>
        )}
        {isActive && (
          <div className="flex gap-2">
            <button onClick={() => handleDeal('accept')} className="btn-success flex items-center gap-1.5 text-xs">
              <CheckCircle size={14} /> Accept Deal
            </button>
            <button onClick={() => handleDeal('cancel')} className="btn-danger flex items-center gap-1.5 text-xs">
              <XCircle size={14} /> Cancel
            </button>
          </div>
        )}
        {neg.status === 'deal_made' && (
          <span className="badge bg-sky-100 text-sky-700 text-sm px-3 py-1">Deal Made {neg.final_price ? `· $${parseFloat(neg.final_price).toLocaleString()}` : ''}</span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 px-1 pb-2">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 text-sm py-8">No messages yet. Start the negotiation.</div>
        )}
        {messages.map((m) => {
          const isMe = m.sender_id === company?.id;
          return (
            <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-sm rounded-2xl px-4 py-3 ${isMe ? 'bg-sky-600 text-white rounded-br-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'}`}>
                {!isMe && <p className="text-xs font-medium mb-1 opacity-60">{m.sender_name}</p>}
                {m.message_type === 'offer' && (
                  <div className={`flex items-center gap-2 mb-2 text-xs font-semibold ${isMe ? 'text-sky-100' : 'text-sky-600'}`}>
                    <DollarSign size={13} />
                    <span>Price Offer</span>
                    {m.offer_price && <span className="text-base font-bold">${parseFloat(m.offer_price).toLocaleString()}</span>}
                    {m.offer_quantity && <span className="flex items-center gap-1"><Package size={12} />{m.offer_quantity}</span>}
                  </div>
                )}
                <p className="text-sm">{m.content}</p>
                <p className={`text-xs mt-1 ${isMe ? 'text-sky-200' : 'text-slate-400'}`}>
                  {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {isActive && (
        <div className="card p-4 mt-2">
          <div className="flex gap-2 mb-3">
            <button onClick={() => setMode('message')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${mode === 'message' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
              Message
            </button>
            <button onClick={() => setMode('offer')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${mode === 'offer' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
              <DollarSign size={12} /> Make Offer
            </button>
          </div>
          {mode === 'offer' && (
            <div className="flex gap-2 mb-3">
              <input className="input flex-1" type="number" placeholder="Price (USD)" value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)} />
              <input className="input flex-1" placeholder="Quantity" value={offerQty} onChange={(e) => setOfferQty(e.target.value)} />
            </div>
          )}
          <form onSubmit={sendMessage} className="flex gap-2">
            <input className="input flex-1" placeholder={mode === 'offer' ? 'Add a note to your offer...' : 'Type a message...'}
              value={content} onChange={(e) => setContent(e.target.value)} />
            <button type="submit" disabled={sending || !content.trim()} className="btn-primary px-4 flex items-center gap-2">
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
