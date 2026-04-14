import { useState, useEffect } from 'react';
import axios from 'axios';
import { LogOut, Users, PlusCircle, Trash2, Mail, Smartphone, Key } from 'lucide-react';
import { format } from 'date-fns';
import PlansModule from './PlansModule';
import CouponsModule from './CouponsModule';
import './Dashboard.css';

export default function Dashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states (Add User)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [planId, setPlanId] = useState('');

  // Edit states
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editUserData, setEditUserData] = useState({ name: '', email: '', mobile: '' });

  // Tab routing locally
  const [currentTab, setCurrentTab] = useState<'users' | 'plans' | 'coupons'>('users');

  const token = localStorage.getItem('adminToken');
  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchUsers();
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await axios.get(`${API_URL}/plans`);
      setPlans(res.data);
      if (res.data.length > 0) setPlanId(res.data[0]._id);
    } catch (err) {
      console.error("Failed to load plans");
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err: any) {
      setError('Failed to load users');
      if (err.response?.status === 401) handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`${API_URL}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/users`, { name, email, mobile, planId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAddForm(false);
      setName(''); setEmail(''); setMobile(''); setPlanId('');
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create user');
    }
  };

  const handleApproveUser = async (userId: string, newPlanId: string) => {
    if (!newPlanId) {
      alert("Please select a package to approve.");
      return;
    }
    try {
      await axios.put(`${API_URL}/users/${userId}/plan`, { planId: newPlanId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('User successfully activated with the selected package!');
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve user');
    }
  };

  const handleEditSave = async (userId: string) => {
    try {
      await axios.put(`${API_URL}/users/${userId}`, editUserData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditUserId(null);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/login';
  };

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="brand" style={{ display: 'flex', justifyContent: 'center', padding: '1rem 0' }}>
          <img src="/logo1.png" alt="MyInterviewGenie Logo" style={{ height: '140px', width: 'auto', maxWidth: '100%' }} />
        </div>
        <nav className="nav-menu">
          <div className={`nav-item ${currentTab === 'users' ? 'active' : ''}`} onClick={() => setCurrentTab('users')}><Users size={18} /> Users Management</div>
          <div className={`nav-item ${currentTab === 'plans' ? 'active' : ''}`} onClick={() => setCurrentTab('plans')}><PlusCircle size={18} /> Packages & Plans</div>
          <div className={`nav-item ${currentTab === 'coupons' ? 'active' : ''}`} onClick={() => setCurrentTab('coupons')}><PlusCircle size={18} /> Discount Coupons</div>
        </nav>
        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={18} /> Logout
        </button>
      </aside>

      <main className="main-content">
        {currentTab === 'plans' && <PlansModule token={token} API_URL={API_URL} />}
        {currentTab === 'coupons' && <CouponsModule token={token} API_URL={API_URL} />}

        {currentTab === 'users' && (
          <>
            <div className="page-header">
              <h2>Registered Users</h2>
              <button className="btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
                <PlusCircle size={18} /> Add New User Manually
              </button>
            </div>

            {error && <div className="error-alert">{error}</div>}

            {showAddForm && (
              <div className="form-card">
                <h3>Add New User Manually</h3>
                <form onSubmit={handleCreateUser} className="inline-form">
                  <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
                  <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                  <input type="text" placeholder="Mobile" value={mobile} onChange={e => setMobile(e.target.value)} required pattern="[0-9]{10}" />
                  <select value={planId} onChange={e => setPlanId(e.target.value)} required>
                    {plans.map(p => <option key={p._id} value={p._id}>{p.name} ({p.rounds} Rounds)</option>)}
                  </select>
                  <button type="submit" className="btn-success">Activate License</button>
                  <button type="button" className="btn-icon" style={{ background: 'rgba(255, 74, 74, 0.1)', color: 'var(--danger)', padding: '0.6rem 1.2rem', borderRadius: '6px' }} onClick={() => setShowAddForm(false)}>Cancel</button>
                </form>
              </div>
            )}

            <div className="table-card">
              {loading ? <p>Loading users...</p> : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>User Info</th>
                      <th>License Key</th>
                      <th>Plan & Usage</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id}>
                        <td>
                          {editUserId === u._id ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                              <input type="text" value={editUserData.name} onChange={e => setEditUserData({ ...editUserData, name: e.target.value })} style={{ padding: '0.4rem', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'white', borderRadius: '4px' }} placeholder="Name" />
                              <input type="email" value={editUserData.email} onChange={e => setEditUserData({ ...editUserData, email: e.target.value })} style={{ padding: '0.4rem', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'white', borderRadius: '4px' }} placeholder="Email" />
                              <input type="text" value={editUserData.mobile} onChange={e => setEditUserData({ ...editUserData, mobile: e.target.value })} style={{ padding: '0.4rem', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'white', borderRadius: '4px' }} placeholder="Mobile" />
                            </div>
                          ) : (
                            <>
                              <div className="user-name">{u.name || 'No Name'}</div>
                              <div className="user-contact"><Mail size={12} /> {u.email}</div>
                              <div className="user-contact"><Smartphone size={12} /> {u.mobile}</div>
                            </>
                          )}
                        </td>
                        <td><Key size={14} className="primary-icon" /> <code className="license">{u.licenseKey}</code></td>
                        <td>
                          <div><strong>{u.planId?.name || 'Unknown Plan'}</strong></div>
                          <div className="sub-stat">Rounds left: {u.roundsRemaining}</div>
                          <div className="sub-stat">Expires: {format(new Date(u.expiryDate), 'MMM dd, yyyy')}</div>
                        </td>
                        <td>
                          <div className="action-btns" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <select
                                defaultValue={u.planId?._id || ''}
                                id={`plan-select-${u._id}`}
                                className="inline-select"
                                style={{ padding: '0.4rem', borderRadius: '4px', background: 'var(--bg-dark)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
                              >
                                <option value="">Select Package</option>
                                {plans.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                              </select>
                              <button
                                className="btn-success"
                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                                onClick={() => {
                                  const sel = document.getElementById(`plan-select-${u._id}`) as HTMLSelectElement;
                                  handleApproveUser(u._id, sel.value);
                                }}
                              >
                                Approve
                              </button>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', width: 'fit-content' }}>
                              {editUserId === u._id ? (
                                <>
                                  <button className="btn-icon btn-success" onClick={() => handleEditSave(u._id)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Save</button>
                                  <button className="btn-icon" onClick={() => setEditUserId(null)} style={{ background: 'rgba(255, 74, 74, 0.1)', color: 'var(--danger)', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Cancel</button>
                                </>
                              ) : (
                                <button className="btn-icon" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }} title="Edit User" onClick={() => { setEditUserId(u._id); setEditUserData({ name: u.name, email: u.email, mobile: u.mobile }); }}>
                                  Edit
                                </button>
                              )}
                              <button className="btn-icon btn-danger" title="Delete User" onClick={() => handleDelete(u._id)}>
                                <Trash2 size={16} /> Delete
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No users found.</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
