import React, { useState, useEffect } from 'react';
import { customerAPI } from '../services/api';
import { FiUsers, FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiGift, FiList } from 'react-icons/fi';
import { toast } from 'react-toastify';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editCustomer, setEditCustomer] = useState(null);
    const [showOrders, setShowOrders] = useState(null);
    const [customerOrders, setCustomerOrders] = useState([]);
    const [showLoyalty, setShowLoyalty] = useState(null);
    const [loyaltyPoints, setLoyaltyPoints] = useState('');
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', notes: '' });

    const fetchCustomers = async () => {
        try {
            const params = {};
            if (search) params.search = search;
            const res = await customerAPI.getAll(params);
            setCustomers(res.data);
        } catch (error) {
            toast.error('Failed to fetch');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCustomers(); }, [search]);

    const openModal = (c = null) => {
        if (c) {
            setEditCustomer(c);
            setForm({ name: c.name, phone: c.phone, email: c.email, address: c.address, notes: c.notes });
        } else {
            setEditCustomer(null);
            setForm({ name: '', phone: '', email: '', address: '', notes: '' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editCustomer) { await customerAPI.update(editCustomer._id, form); toast.success('Updated'); }
            else { await customerAPI.create(form); toast.success('Created'); }
            setShowModal(false);
            fetchCustomers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete?')) return;
        try { await customerAPI.delete(id); toast.success('Deleted'); fetchCustomers(); } catch { toast.error('Failed'); }
    };

    const viewOrders = async (customer) => {
        try {
            const res = await customerAPI.getOrders(customer._id);
            setCustomerOrders(res.data);
            setShowOrders(customer);
        } catch { toast.error('Failed'); }
    };

    const handleLoyalty = async () => {
        try {
            await customerAPI.addLoyalty(showLoyalty._id, Number(loyaltyPoints));
            toast.success('Points added!');
            setShowLoyalty(null);
            setLoyaltyPoints('');
            fetchCustomers();
        } catch { toast.error('Failed'); }
    };

    if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

    return (
        <div className="customers-page">
            <div className="page-header"><h1><FiUsers /> Customers</h1><button className="btn btn-primary" onClick={() => openModal()}><FiPlus /> Add Customer</button></div>
            <div className="filter-bar"><div className="search-box"><FiSearch /><input placeholder="Search name, phone, email..." value={search} onChange={(e) => setSearch(e.target.value)} /></div></div>

            <div className="table-wrapper">
                <table className="data-table">
                    <thead><tr><th>Name</th><th>Phone</th><th>Email</th><th>Orders</th><th>Spent</th><th>Points</th><th>Last Visit</th><th>Actions</th></tr></thead>
                    <tbody>
                        {customers.map(c => (
                            <tr key={c._id}>
                                <td>{c.name}</td>
                                <td>{c.phone || '-'}</td>
                                <td>{c.email || '-'}</td>
                                <td>{c.totalOrders}</td>
                                <td>₹{c.totalSpent}</td>
                                <td><span className="badge badge-primary">{c.loyaltyPoints} pts</span></td>
                                <td>{new Date(c.lastVisit).toLocaleDateString()}</td>
                                <td className="action-cell">
                                    <button className="btn btn-sm btn-outline" onClick={() => viewOrders(c)} title="Orders"><FiList /></button>
                                    <button className="btn btn-sm btn-outline" onClick={() => { setShowLoyalty(c); setLoyaltyPoints(''); }} title="Loyalty"><FiGift /></button>
                                    <button className="btn btn-sm btn-outline" onClick={() => openModal(c)}><FiEdit2 /></button>
                                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c._id)}><FiTrash2 /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header"><h2>{editCustomer ? 'Edit' : 'Add'} Customer</h2><button className="modal-close" onClick={() => setShowModal(false)}><FiX /></button></div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-row"><div className="form-group"><label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div><div className="form-group"><label>Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required /></div></div>
                            <div className="form-row"><div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div><div className="form-group"><label>Address</label><input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div></div>
                            <div className="form-group"><label>Notes</label><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows="2" /></div>
                            <div className="modal-actions"><button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">{editCustomer ? 'Update' : 'Create'}</button></div>
                        </form>
                    </div>
                </div>
            )}

            {showOrders && (
                <div className="modal-overlay" onClick={() => setShowOrders(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header"><h2>Orders - {showOrders.name}</h2><button className="modal-close" onClick={() => setShowOrders(null)}><FiX /></button></div>
                        <div className="modal-body">
                            {customerOrders.length > 0 ? (
                                <table className="data-table"><thead><tr><th>Order #</th><th>Type</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
                                    <tbody>{customerOrders.map(o => (<tr key={o._id}><td>{o.orderNumber}</td><td>{o.orderType}</td><td>{o.items?.length}</td><td>₹{o.total}</td><td><span className={`badge badge-${o.status === 'Completed' ? 'success' : 'warning'}`}>{o.status}</span></td><td>{new Date(o.createdAt).toLocaleDateString()}</td></tr>))}</tbody></table>
                            ) : <p className="no-data">No orders</p>}
                        </div>
                    </div>
                </div>
            )}

            {showLoyalty && (
                <div className="modal-overlay" onClick={() => setShowLoyalty(null)}>
                    <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header"><h2>Loyalty: {showLoyalty.name}</h2><button className="modal-close" onClick={() => setShowLoyalty(null)}><FiX /></button></div>
                        <div className="modal-form">
                            <p>Current: <strong>{showLoyalty.loyaltyPoints} points</strong></p>
                            <div className="form-group"><label>Add Points</label><input type="number" value={loyaltyPoints} onChange={(e) => setLoyaltyPoints(e.target.value)} /></div>
                            <div className="modal-actions"><button className="btn btn-outline" onClick={() => setShowLoyalty(null)}>Cancel</button><button className="btn btn-primary" onClick={handleLoyalty}>Add</button></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customers;
