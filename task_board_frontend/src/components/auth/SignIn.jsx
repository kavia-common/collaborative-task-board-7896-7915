import React, { useState } from 'react';
import { useSupabase } from '../../supabase/SupabaseContext';

/**
 * PUBLIC_INTERFACE
 * SignIn
 * Simple sign-in form offering email magic link sign-in and GitHub OAuth as example.
 */
function SignIn() {
  const { client } = useSupabase();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  const signInWithEmail = async (e) => {
    e.preventDefault();
    setStatus('Sending magic link...');
    const siteUrl = process.env.REACT_APP_SITE_URL || window.location.origin; // Ensure orchestrator sets REACT_APP_SITE_URL
    const { error } = await client.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: siteUrl }
    });
    if (error) setStatus(error.message);
    else setStatus('Check your email for a magic link.');
  };

  const signInWithGithub = async () => {
    const siteUrl = process.env.REACT_APP_SITE_URL || window.location.origin;
    const { error } = await client.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: siteUrl }
    });
    if (error) setStatus(error.message);
  };

  return (
    <div className="app-shell" style={{ gridTemplateAreas: '"nav" "main" "sidebar" "chat"', gridTemplateColumns: '1fr', gridTemplateRows: 'auto 1fr auto auto' }}>
      <div className="navbar">
        <div className="brand">
          <span className="brand-badge" />
          Ocean Professional
        </div>
        <div />
      </div>
      <div style={{ display:'grid', placeItems:'center', padding:'40px' }}>
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'12px', boxShadow:'var(--shadow-sm)', padding:'24px', width:'100%', maxWidth:420 }}>
          <h2 style={{ margin:'0 0 8px' }}>Welcome back</h2>
          <p style={{ color:'var(--muted)', marginTop:0 }}>Sign in to your team workspace</p>
          <form onSubmit={signInWithEmail} style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <input
              aria-label="Email"
              placeholder="your@email.com"
              type="email"
              required
              value={email}
              onChange={e=>setEmail(e.target.value)}
              style={{ padding:12, borderRadius:10, border:'1px solid var(--border)' }}
            />
            <button className="btn primary" type="submit">Send magic link</button>
          </form>
          <div style={{ display:'flex', alignItems:'center', gap:8, margin:'14px 0', color:'var(--muted)', fontSize:12 }}>
            <span style={{ flex:1, height:1, background:'var(--border)' }} />
            Or
            <span style={{ flex:1, height:1, background:'var(--border)' }} />
          </div>
          <button className="btn" onClick={signInWithGithub}>Continue with GitHub</button>
          {status && <div style={{ marginTop:12, color:'var(--muted)', fontSize:12 }}>{status}</div>}
        </div>
      </div>
      <div />
      <div />
    </div>
  );
}

export default SignIn;
