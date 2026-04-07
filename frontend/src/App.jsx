import { useState, useEffect } from 'react';
import { Camera, ImagePlus, User as UserIcon, LogOut, Upload, Trash2, Aperture, X, Image as ImageIcon } from 'lucide-react';
import './index.css';

const API_URL = "http://localhost:8000";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('snapstream_token'));
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (token) {
      fetchFeed();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/feed`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      } else {
        triggerLogout();
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const triggerLogout = () => {
    setToken(null);
    localStorage.removeItem('snapstream_token');
    setPosts([]);
  };

  if (!token) {
    if (showAuth) {
      return <AuthScreen setToken={(t) => {
        setToken(t);
        localStorage.setItem('snapstream_token', t);
      }} onBack={() => setShowAuth(false)} />;
    }
    return <LandingPage onJoin={() => setShowAuth(true)} />;
  }

  return (
    <div className="app-container">
      <header className="header">
        <div className="brand">
          <Aperture size={28} className="text-accent" />
          SnapStream
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>
            <ImagePlus size={18} /> New Post
          </button>
          <button className="btn" onClick={triggerLogout}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      {loading ? (
        <div className="empty-state">
          <div className="loader" style={{ width: '40px', height: '40px', margin: '0 auto', borderColor: 'rgba(255,255,255,0.1)', borderTopColor: '#6366f1' }}></div>
          <p style={{ marginTop: '1rem' }}>Loading feed...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <Camera size={64} />
          <h3>No posts yet</h3>
          <p>Be the first to share a moment!</p>
        </div>
      ) : (
        <div className="feed-grid">
          {posts.map(post => (
            <PostCard key={post.id} post={post} token={token} onDeleted={fetchFeed} />
          ))}
        </div>
      )}

      {showUploadModal && <UploadModal token={token} onClose={() => setShowUploadModal(false)} onUploadSuccess={fetchFeed} />}
    </div>
  );
}

function PostCard({ post, token, onDeleted }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/posts/${post.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        onDeleted();
      }
    } catch (err) {
      console.error(err);
    }
    setDeleting(false);
  };

  return (
    <div className="post-card">
      <img src={post.url} alt={post.caption} className="post-image" loading="lazy" />
      <div className="post-content">
        <div className="post-header">
          <div className="post-author">
            <div className="avatar">
              {post.name.charAt(0).toUpperCase()}
            </div>
            {post.name}
          </div>
          <span className="post-date">
            {new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        </div>
        <p className="post-caption">{post.caption}</p>
        {post.is_owner && (
          <div className="post-actions">
            <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? <div className="loader" style={{width:'14px', height:'14px'}}></div> : <Trash2 size={14} />}
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function AuthScreen({ setToken, onBack }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const formData = new URLSearchParams();
        formData.append('username', name); // fastapi-users uses username field for email/name
        formData.append('password', password);

        const res = await fetch(`${API_URL}/auth/jwt/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData
        });

        if (res.ok) {
          const data = await res.json();
          setToken(data.access_token);
        } else {
          setError('Invalid credentials');
        }
      } else {
        // Register map Name + Password
        const payload = {
          name,
          password
        };
        const res = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          // auto login after register
          const formData = new URLSearchParams();
          formData.append('username', name);
          formData.append('password', password);
          const loginRes = await fetch(`${API_URL}/auth/jwt/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData
          });
          const loginData = await loginRes.json();
          setToken(loginData.access_token);
        } else {
          const errData = await res.json();
          setError(errData.detail || 'Registration failed');
        }
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {onBack && (
          <button className="btn btn-ghost" style={{ position: 'absolute', top: '1rem', left: '1rem', padding: '0.4rem' }} onClick={onBack}>
             ← Back
          </button>
        )}
        <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
          <Aperture className="text-accent" /> SnapStream
        </h2>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input 
              type="text" 
              className="form-control" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
              placeholder="Your username"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              className="form-control" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading || !name || !password}>
            {loading && <div className="loader"></div>}
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        <div className="auth-switch">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <span onClick={() => { setIsLogin(!isLogin); setError(''); }}>
            {isLogin ? 'Sign up' : 'Sign in'}
          </span>
        </div>
      </div>
    </div>
  );
}

function UploadModal({ token, onClose, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('caption', caption);

    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }, // Form data, don't set Content-Type header manually
        body: formData
      });

      if (res.ok) {
        onUploadSuccess();
        onClose();
      } else {
        setError('Upload failed. Please try again.');
      }
    } catch (err) {
      setError('Network error');
    }
    setUploading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={24} /></button>
        <h3>New Post</h3>
        {error && <div className="error-msg">{error}</div>}
        
        {preview ? (
          <div>
            <img src={preview} alt="Preview" className="image-preview" />
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <button className="btn" onClick={() => { setFile(null); setPreview(null); }} style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}>
                Change Image
              </button>
            </div>
          </div>
        ) : (
          <div className="file-input-wrapper">
            <input type="file" accept="image/*" onChange={handleFile} />
            <div className="file-input-btn">
              <ImageIcon size={48} />
              <span>Click or drag image to upload</span>
            </div>
          </div>
        )}

        <div className="form-group">
          <label>Caption</label>
          <textarea 
            className="form-control" 
            rows="3" 
            placeholder="Write something about this photo..."
            value={caption}
            onChange={e => setCaption(e.target.value)}
            style={{ resize: 'none' }}
          ></textarea>
        </div>

        <button 
          className="btn btn-primary" 
          style={{ width: '100%', marginTop: '1rem' }} 
          onClick={handleUpload} 
          disabled={!file || uploading}
        >
          {uploading ? <div className="loader"></div> : <Upload size={18} />}
          {uploading ? 'Uploading...' : 'Share Post'}
        </button>
      </div>
    </div>
  );
}

function LandingPage({ onJoin }) {
  return (
    <div className="landing-container">
      <nav className="landing-nav">
        <div className="brand" style={{ fontSize: '1.8rem' }}>
          <Aperture size={32} className="text-accent" />
          SnapStream
        </div>
        <button className="btn btn-primary" onClick={onJoin}>Sign In</button>
      </nav>
      
      <main className="landing-hero">
        <div className="hero-content">
          <div className="badge">✨ Join the fastest growing community</div>
          <h1 className="hero-title">
            Your moments, <br/>
            <span className="text-gradient">beautifully framed.</span>
          </h1>
          <p className="hero-subtitle">
            Experience a new way of sharing life through your lenses. 
            Connect with friends, explore stunning photography, and build your digital legacy on SnapStream.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-large" onClick={onJoin}>
              Get Started for Free <Aperture size={20} />
            </button>
            <button className="btn btn-large" onClick={onJoin}>
              Explore Feed
            </button>
          </div>
          
          <div className="hero-stats">
            <div className="stat">
              <h3>10M+</h3>
              <p>Active Users</p>
            </div>
            <div className="stat">
              <h3>50M+</h3>
              <p>Photos Shared</p>
            </div>
            <div className="stat">
              <h3>99.9%</h3>
              <p>Uptime</p>
            </div>
          </div>
        </div>
        
        <div className="hero-visual">
          <div className="glass-panel main-image">
            <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop" alt="Abstract fluid" />
            <div className="floating-card top-right">
              <div className="avatar">A</div>
              <div>
                <strong>Alice</strong> 
                <span>Just now</span>
              </div>
            </div>
            <div className="floating-card bottom-left">
              <span className="heart-icon">❤️ 1.2k</span>
              <p>Loving this new dynamic aesthetic!</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
