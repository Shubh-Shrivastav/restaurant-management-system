import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiCpu, FiMail, FiLock, FiLogIn } from 'react-icons/fi';
import { toast } from 'react-toastify';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userData = await login(email, password);
            toast.success('Welcome back!');
            if (userData.role === 'SuperAdmin') {
                navigate('/super-admin');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-bg-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
            </div>
            <div className="login-card">
                <div className="login-header">
                    <FiCpu className="login-logo-icon" />
                    <h1>PetPooja<span className="logo-plus">+</span></h1>
                    <p>Smart Restaurant Management</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <div className="input-wrapper">
                            <FiMail className="input-icon" />
                            <input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="input-wrapper">
                            <FiLock className="input-icon" />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                        {loading ? <div className="btn-spinner"></div> : <><FiLogIn /> Sign In</>}
                    </button>
                </form>
                <div className="login-footer">
                    <p>Demo Credentials</p>
                    <div className="demo-creds">
                        <span><strong>Super Admin:</strong> superadmin@petpooja.com / superadmin123</span>
                        <span><strong>Admin:</strong> admin@test.com / admin123</span>
                        <span><strong>Kitchen:</strong> kitchen@test.com / kitchen123</span>
                    </div>
                    <div className="register-link-container">
                        <p>Want to join PetPooja+?</p>
                        <Link to="/register" className="register-link">Register your Restaurant</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

