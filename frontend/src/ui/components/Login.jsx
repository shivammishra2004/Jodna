import React, { useState } from 'react';
import axios from 'axios';
import "./Login.css";

const BACKEND_URL = 'http://localhost:5000';
const ADOBE_REDIRECT_URI = "https://express.adobe.com/static/oauth-redirect.html";

// --- PKCE Utilities ---
const generateCodeVerifier = () => {
    const array = new Uint32Array(56 / 2);
    window.crypto.getRandomValues(array);
    return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
};

const sha256 = (plain) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return window.crypto.subtle.digest('SHA-256', data);
};

const base64urlencode = (a) => {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(a)))
        .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const Login = ({ onLoginSuccess, addOnUISdk }) => {
    const [authMode, setAuthMode] = useState('login');
    const [authData, setAuthData] = useState({ displayName: '', email: '', password: '' });

    const handleAuth = async (e) => {
        e.preventDefault();
        try {
            const endpoint = authMode === 'login' ? '/auth/login' : '/auth/signup';
            const res = await axios.post(`${BACKEND_URL}${endpoint}`, authData);

            localStorage.setItem('token', res.data.token);
            onLoginSuccess(res.data);
        } catch (err) {
            alert(err.response?.data?.msg || 'Authentication failed');
        }
    };

    const handleGoogleLogin = async () => {
        try {
            // 1. PKCE Setup
            const codeVerifier = generateCodeVerifier();
            const hashed = await sha256(codeVerifier);
            const codeChallenge = base64urlencode(hashed);

            // 2. Adobe OAuth Request
            const clientId = "800444309443-lpeohk0h1b63mkj543n8f3n151bcqagl.apps.googleusercontent.com";
            const authorizationUrl = "https://accounts.google.com/o/oauth2/v2/auth";

            console.log("Opening Adobe OAuth Popup...");
            const result = await addOnUISdk.app.oauth.authorize({
                authorizationUrl,
                clientId,
                scope: "openid email profile",
                codeChallenge,
            });

            if (!result.code) {
                throw new Error("No authorization code returned from Google.");
            }

            // 3. Send to Backend
            console.log("Sending code to backend...");
            const res = await axios.post(`${BACKEND_URL}/auth/google`, {
                code: result.code,
                codeVerifier,
                redirectUri: ADOBE_REDIRECT_URI
            });

            // 4. Handle Success
            if (res.data && res.data.token) {
                localStorage.setItem('token', res.data.token);
                onLoginSuccess(res.data);
            }
        } catch (err) {
            console.error("Google Login Error:", err);
            alert("Login Failed: " + (err.response?.data?.msg || err.message));
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <img src={require("../assets/login_illustration.png")} alt="Login Illustration" className="login-illustration" />
                <div style={{ marginBottom: '24px', color: '#505050', fontSize: '14px', lineHeight: '1.5' }}>
                </div>
                <button className="google-btn" onClick={handleGoogleLogin}>
                    <svg className="google-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.653-3.343-11.303-8l-6.571,4.827C9.656,39.664,16.318,44,24,44z" />
                        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                    </svg>
                    <span>Sign in with Google</span>
                </button>
                {/* <div className="divider"><span>OR</span></div>
                <form onSubmit={handleAuth} className="auth-form">
                    {authMode === 'signup' && (
                        <input className="auth-input" placeholder="Name" value={authData.displayName}
                            onChange={e => setAuthData({ ...authData, displayName: e.target.value })} required />
                    )}
                    <input className="auth-input" placeholder="Email" type="email" value={authData.email}
                        onChange={e => setAuthData({ ...authData, email: e.target.value })} required />
                    <input className="auth-input" placeholder="Password" type="password" value={authData.password}
                        onChange={e => setAuthData({ ...authData, password: e.target.value })} required />
                    <button type="submit" className="submit-btn">{authMode === 'login' ? 'Login' : 'Sign Up'}</button>
                </form>
                <button className="switch-btn" onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}>
                    {authMode === 'login' ? 'Need an account? Sign Up' : 'Have an account? Login'}
                </button> */}
            </div>
        </div>
    );
};

export default Login;