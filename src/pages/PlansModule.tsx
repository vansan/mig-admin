import { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Trash2, Edit2 } from 'lucide-react';

export default function PlansModule({ token, API_URL }: { token: string | null, API_URL: string }) {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ name: '', rounds: 1, price: 0, validityDays: 30 });

  const [editInlineId, setEditInlineId] = useState<string | null>(null);
  const [editInlineData, setEditInlineData] = useState({ name: '', rounds: 1, price: 0, validityDays: 30 });

  useEffect(() => { fetchPlans(); }, []);

  const fetchPlans = async () => {
    try {
      const res = await axios.get(`${API_URL}/plans`);
      setPlans(res.data);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/plans`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAdd(false);
      setFormData({ name: '', rounds: 1, price: 0, validityDays: 30 });
      fetchPlans();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving plan');
    }
  };

  const handleInlineSave = async (id: string) => {
    try {
      await axios.post(`${API_URL}/plans/update`, { id, ...editInlineData }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditInlineId(null);
      fetchPlans();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating plan');
    }
  };

  const handleDelete = async (id: string) => {
    if(!window.confirm("Delete this package?")) return;
    try {
      await axios.delete(`${API_URL}/plans/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPlans();
    } catch (err) {
      alert("Error deleting");
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Packages / Plans Management</h2>
        <button className="btn-primary" onClick={() => { setShowAdd(!showAdd); setFormData({ name: '', rounds: 1, price: 0, validityDays: 30 }); }}>
          <PlusCircle size={18} /> Add Package
        </button>
      </div>

      {showAdd && (
        <div className="form-card">
          <h3>Create New Package</h3>
          <form onSubmit={handleSubmit} className="inline-form">
            <input type="text" placeholder="Package Name" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} required />
            <input type="number" placeholder="Total Rounds" value={formData.rounds} onChange={e=>setFormData({...formData, rounds: parseInt(e.target.value)})} required />
            <input type="number" placeholder="Price (INR)" value={formData.price} onChange={e=>setFormData({...formData, price: parseFloat(e.target.value)})} required />
            <input type="number" placeholder="Validity Days" value={formData.validityDays} onChange={e=>setFormData({...formData, validityDays: parseInt(e.target.value)})} required />
            <button type="submit" className="btn-success">Create</button>
            <button type="button" className="btn-icon" style={{ background: 'rgba(255, 74, 74, 0.1)', color: 'var(--danger)', padding: '0.6rem 1.2rem', borderRadius: '6px' }} onClick={() => setShowAdd(false)}>Cancel</button>
          </form>
        </div>
      )}

      <div className="table-card">
        {loading ? <p>Loading...</p> : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Package Name</th>
                <th>Rounds</th>
                <th>Price / Round</th>
                <th>Total Price</th>
                <th>Period (Days)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map(p => (
                <tr key={p._id}>
                  {editInlineId === p._id ? (
                    <>
                      <td><input type="text" value={editInlineData.name} onChange={e=>setEditInlineData({...editInlineData, name: e.target.value})} style={{padding: '0.4rem', background:'transparent', color:'white', border:'1px solid rgba(255,255,255,0.2)', borderRadius:'4px'}}/></td>
                      <td><input type="number" value={editInlineData.rounds} onChange={e=>setEditInlineData({...editInlineData, rounds: parseInt(e.target.value)})} style={{padding: '0.4rem', width:'60px', background:'transparent', color:'white', border:'1px solid rgba(255,255,255,0.2)', borderRadius:'4px'}}/></td>
                      <td>-</td>
                      <td><input type="number" value={editInlineData.price} onChange={e=>setEditInlineData({...editInlineData, price: parseFloat(e.target.value)})} style={{padding: '0.4rem', width:'80px', background:'transparent', color:'white', border:'1px solid rgba(255,255,255,0.2)', borderRadius:'4px'}}/></td>
                      <td><input type="number" value={editInlineData.validityDays} onChange={e=>setEditInlineData({...editInlineData, validityDays: parseInt(e.target.value)})} style={{padding: '0.4rem', width:'60px', background:'transparent', color:'white', border:'1px solid rgba(255,255,255,0.2)', borderRadius:'4px'}}/></td>
                      <td>
                        <div style={{display:'flex', gap:'5px'}}>
                          <button className="btn-icon btn-success" onClick={() => handleInlineSave(p._id)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Save</button>
                          <button className="btn-icon" onClick={() => setEditInlineId(null)} style={{ background: 'rgba(255, 74, 74, 0.1)', color: 'var(--danger)', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Cancel</button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td><strong>{p.name}</strong></td>
                      <td>{p.rounds}</td>
                      <td>₹{p.rounds > 0 ? (p.price / p.rounds).toFixed(2) : 0}</td>
                      <td>₹{p.price}</td>
                      <td>{p.validityDays} Days</td>
                      <td>
                        <div style={{display:'flex', gap:'5px'}}>
                          <button className="btn-icon" onClick={() => { setEditInlineId(p._id); setEditInlineData({ name: p.name, rounds: p.rounds, price: p.price, validityDays: p.validityDays }); }}><Edit2 size={16}/> Edit</button>
                          <button className="btn-icon btn-danger" onClick={() => handleDelete(p._id)}><Trash2 size={16}/> Delete</button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
