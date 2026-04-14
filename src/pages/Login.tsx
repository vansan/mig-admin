import { useState } from 'react';

import axios from 'axios';
import { Lock, ShieldAlert } from 'lucide-react';
import './Login.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Use standard connection on port 5000 pointing to licensing-backend
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await axios.post(`${API_URL}/users/login`, { username, password });
      if (res.data.token) {
        localStorage.setItem('adminToken', res.data.token);
        window.location.href = '/'; // hard reload to process auth
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="icon-wrapper">
          <ShieldAlert size={48} className="shield-icon" />
        </div>
        <h2>Admin Portal</h2>
        <p className="subtitle">Secure access only.</p>

        {error && <div className="error-alert">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" disabled={loading} className="login-btn">
            {loading ? 'Authenticating...' : <><Lock size={18} /> Login</>}
          </button>
        </form>
      </div>
    </div>
  );
}
