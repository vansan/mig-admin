import { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Trash2, Edit2 } from 'lucide-react';
import { format } from 'date-fns';

export default function CouponsModule({ token, API_URL }: { token: string | null, API_URL: string }) {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [formData, setFormData] = useState({ code: '', discountPerRound: 0, validUntil: '', isActive: true });

  useEffect(() => { fetchCoupons(); }, []);

  const fetchCoupons = async () => {
    try {
      const res = await axios.get(`${API_URL}/coupons`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCoupons(res.data);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${API_URL}/coupons/${editId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/coupons`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setEditId(null);
      setShowAdd(false);
      setFormData({ code: '', discountPerRound: 0, validUntil: '', isActive: true });
      fetchCoupons();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving coupon');
    }
  };

  const handleDelete = async (id: string) => {
    if(!window.confirm("Delete this coupon?")) return;
    try {
      await axios.delete(`${API_URL}/coupons/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCoupons();
    } catch (err) {
      alert("Error deleting");
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Coupons & Discounts</h2>
        <button className="btn-primary" onClick={() => { setShowAdd(!showAdd); setEditId(null); setFormData({ code: '', discountPerRound: 0, validUntil: '', isActive: true }); }}>
          <PlusCircle size={18} /> Add Coupon
        </button>
      </div>

      {showAdd && (
        <div className="form-card">
          <h3>{editId ? 'Edit Coupon' : 'Create New Coupon'}</h3>
          <form onSubmit={handleSubmit} className="inline-form">
            <input type="text" placeholder="Coupon Code (e.g. SUMMER24)" value={formData.code} onChange={e=>setFormData({...formData, code: e.target.value.toUpperCase()})} required />
            <input type="number" placeholder="Discount ₹ / Round" value={formData.discountPerRound} onChange={e=>setFormData({...formData, discountPerRound: parseFloat(e.target.value)})} required />
            <input type="datetime-local" value={formData.validUntil} onChange={e=>setFormData({...formData, validUntil: e.target.value})} required />
            <div style={{display:'flex', alignItems:'center', gap:'10px', color:'white'}}>
               <label>Active</label>
               <input type="checkbox" checked={formData.isActive} onChange={e=>setFormData({...formData, isActive: e.target.checked})} style={{width:'20px', minWidth:'20px'}}/>
            </div>
            <button type="submit" className="btn-success">{editId ? 'Update' : 'Create'}</button>
            <button type="button" className="btn-icon btn-danger" onClick={() => { setShowAdd(false); setEditId(null); }}>Cancel</button>
          </form>
        </div>
      )}

      <div className="table-card">
        {loading ? <p>Loading...</p> : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount / Round</th>
                <th>Valid Until</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c._id}>
                  <td><strong>{c.code}</strong></td>
                  <td>₹{c.discountPerRound}</td>
                  <td>{format(new Date(c.validUntil), 'MMM dd, yyyy HH:mm')}</td>
                  <td>{c.isActive ? <span style={{color:'#10B981'}}>Active</span> : <span style={{color:'var(--danger)'}}>Inactive</span>}</td>
                  <td>
                    <div style={{display:'flex', gap:'5px'}}>
                      <button className="btn-icon" onClick={() => { setEditId(c._id); setShowAdd(true); setFormData({ code: c.code, discountPerRound: c.discountPerRound, validUntil: new Date(c.validUntil).toISOString().slice(0,16), isActive: c.isActive }); }}><Edit2 size={16}/> Edit</button>
                      <button className="btn-icon btn-danger" onClick={() => handleDelete(c._id)}><Trash2 size={16}/> Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
