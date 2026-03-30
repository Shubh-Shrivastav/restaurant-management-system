import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { registrationAPI } from '../services/api';
import { FiCpu, FiUser, FiMail, FiLock, FiPhone, FiHome, FiSend, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';

const Register = () => {
    const [formData, setFormData] = useState({
        restaurantName: '',
        ownerName: '',
        email: '',
        password: '',
        phone: '',
        restaurantType: 'Restaurant'
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await registrationAPI.register(formData);
            setSubmitted(true);
            toast.success('Registration submitted!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="login-page">
                <div className="login-bg-shapes">
                    <div className="shape shape-1"></div>
                    <div className="shape shape-2"></div>
                    <div className="shape shape-3"></div>
                </div>
                <div className="login-card register-success-card">
                    <div className="register-success">
                        <FiCheckCircle className="success-icon" />
                        <h2>Registration Submitted!</h2>
                        <p>Your registration request has been submitted successfully. Please wait for admin approval before logging in.</p>
                        <p className="success-sub">You will be able to log in once the Super Admin approves your request.</p>
                        <Link to="/login" className="btn btn-primary btn-full" style={{ marginTop: '1.5rem', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <FiUser /> Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="login-page">
            <div className="login-bg-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
            </div>
            <div className="login-card register-card">
                <div className="login-header">
                    <FiCpu className="login-logo-icon" />
                    <h1>PetPooja<span className="logo-plus">+</span></h1>
                    <p>Register your Restaurant</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <div className="input-wrapper">
                            <FiHome className="input-icon" />
                            <input
                                type="text"
                                name="restaurantName"
                                placeholder="Restaurant / Hotel Name"
                                value={formData.restaurantName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="input-wrapper">
                            <FiUser className="input-icon" />
                            <input
                                type="text"
                                name="ownerName"
                                placeholder="Owner Name"
                                value={formData.ownerName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="input-wrapper">
                            <FiMail className="input-icon" />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="input-wrapper">
                            <FiLock className="input-icon" />
                            <input
                                type="password"
                                name="password"
                                placeholder="Password (min 6 chars)"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={6}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="input-wrapper">
                            <FiPhone className="input-icon" />
                            <input
                                type="tel"
                                name="phone"
                                placeholder="Phone Number"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="input-wrapper">
                            <FiHome className="input-icon" />
                            <select
                                name="restaurantType"
                                value={formData.restaurantType}
                                onChange={handleChange}
                                className="register-select"
                            >
                                <option value="Restaurant">Restaurant</option>
                                <option value="Hotel">Hotel</option>
                                <option value="Cafe">Cafe</option>
                                <option value="Bar">Bar</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                        {loading ? <div className="btn-spinner"></div> : <><FiSend /> Submit Registration</>}
                    </button>
                </form>
                <div className="login-footer">
                    <p>Already registered?</p>
                    <Link to="/login" className="register-link">Sign In here</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
