import React, { useState, useEffect } from 'react';
import { inventoryAPI } from '../services/api';
import { FiBox, FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';

const CATEGORIES = ['Vegetables', 'Dairy', 'Spices', 'Grains', 'Meat', 'Beverages', 'Packaging', 'Other'];

const Inventory = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showRestock, setShowRestock] = useState(null);
    const [editItem, setEditItem] = useState(null);
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [showLowStock, setShowLowStock] = useState(false);
    const [restockQty, setRestockQty] = useState('');
    const [form, setForm] = useState({
        name: '', category: 'Other', quantity: '', unit: 'kg', costPerUnit: '', lowStockThreshold: 10, supplier: ''
    });

    const fetchItems = async () => {
        try {
            const params = {};
            if (search) params.search = search;
            if (filterCategory) params.category = filterCategory;
            if (showLowStock) params.lowStock = true;
            const res = await inventoryAPI.getAll(params);
            setItems(res.data);
        } catch (error) {
            toast.error('Failed to fetch inventory');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchItems(); }, [search, filterCategory, showLowStock]);

    const openModal = (item = null) => {
        if (item) {
            setEditItem(item);
            setForm({ name: item.name, category: item.category, quantity: item.quantity, unit: item.unit, costPerUnit: item.costPerUnit, lowStockThreshold: item.lowStockThreshold, supplier: item.supplier });
        } else {
            setEditItem(null);
            setForm({ name: '', category: 'Other', quantity: '', unit: 'kg', costPerUnit: '', lowStockThreshold: 10, supplier: '' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editItem) {
                await inventoryAPI.update(editItem._id, form);
                toast.success('Item updated');
            } else {
                await inventoryAPI.create(form);
                toast.success('Item created');
            }
            setShowModal(false);
            fetchItems();
        } catch (error) {
            toast.error('Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete?')) return;
        try { await inventoryAPI.delete(id); toast.success('Deleted'); fetchItems(); } catch { toast.error('Failed'); }
    };

    const handleRestock = async () => {
        try {
            await inventoryAPI.restock(showRestock._id, Number(restockQty));
            toast.success('Restocked!');
            setShowRestock(null);
            setRestockQty('');
            fetchItems();
        } catch { toast.error('Failed'); }
    };

    if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

    return (
        <div className="inventory-page">
            <div className="page-header">
                <h1><FiBox /> Inventory</h1>
                <button className="btn btn-primary" onClick={() => openModal()}><FiPlus /> Add Item</button>
            </div>

            <div className="filter-bar">
                <div className="search-box"><FiSearch /><input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="filter-select">
                    <option value="">All Categories</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button className={`btn btn-sm ${showLowStock ? 'btn-danger' : 'btn-outline'}`} onClick={() => setShowLowStock(!showLowStock)}>
                    Low Stock Only
                </button>
            </div>

            <div className="table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr><th>Name</th><th>Category</th><th>Quantity</th><th>Unit</th><th>Cost/Unit</th><th>Threshold</th><th>Supplier</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item._id} className={item.isLowStock ? 'low-stock-row' : ''}>
                                <td>{item.name}</td>
                                <td>{item.category}</td>
                                <td className={item.isLowStock ? 'text-danger' : ''}>{item.quantity}</td>
                                <td>{item.unit}</td>
                                <td>₹{item.costPerUnit}</td>
                                <td>{item.lowStockThreshold}</td>
                                <td>{item.supplier || '-'}</td>
                                <td>{item.isLowStock ? <span className="badge badge-danger">Low</span> : <span className="badge badge-success">OK</span>}</td>
                                <td className="action-cell">
                                    <button className="btn btn-sm btn-outline" onClick={() => setShowRestock(item)} title="Restock"><FiRefreshCw /></button>
                                    <button className="btn btn-sm btn-outline" onClick={() => openModal(item)}><FiEdit2 /></button>
                                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item._id)}><FiTrash2 /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header"><h2>{editItem ? 'Edit' : 'Add'} Inventory Item</h2><button className="modal-close" onClick={() => setShowModal(false)}><FiX /></button></div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-row">
                                <div className="form-group"><label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
                                <div className="form-group"><label>Category</label><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label>Quantity</label><input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required /></div>
                                <div className="form-group"><label>Unit</label><select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>{['kg', 'g', 'l', 'ml', 'pcs', 'dozen', 'box'].map(u => <option key={u}>{u}</option>)}</select></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label>Cost/Unit (₹)</label><input type="number" value={form.costPerUnit} onChange={(e) => setForm({ ...form, costPerUnit: e.target.value })} /></div>
                                <div className="form-group"><label>Low Stock Threshold</label><input type="number" value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })} /></div>
                            </div>
                            <div className="form-group"><label>Supplier</label><input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} /></div>
                            <div className="modal-actions"><button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">{editItem ? 'Update' : 'Create'}</button></div>
                        </form>
                    </div>
                </div>
            )}

            {showRestock && (
                <div className="modal-overlay" onClick={() => setShowRestock(null)}>
                    <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header"><h2>Restock: {showRestock.name}</h2><button className="modal-close" onClick={() => setShowRestock(null)}><FiX /></button></div>
                        <div className="modal-form">
                            <p>Current: {showRestock.quantity} {showRestock.unit}</p>
                            <div className="form-group"><label>Add Quantity</label><input type="number" value={restockQty} onChange={(e) => setRestockQty(e.target.value)} placeholder="Quantity to add" /></div>
                            <div className="modal-actions"><button className="btn btn-outline" onClick={() => setShowRestock(null)}>Cancel</button><button className="btn btn-primary" onClick={handleRestock}>Restock</button></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
