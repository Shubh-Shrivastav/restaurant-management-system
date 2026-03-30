import React, { useState, useEffect } from 'react';
import { menuAPI } from '../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiImage, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';

const CATEGORIES = ['Starters', 'Main Course', 'Desserts', 'Beverages', 'Snacks', 'Breads', 'Rice', 'Combo'];

const MenuManagement = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [form, setForm] = useState({
        name: '', description: '', category: 'Starters', price: '',
        isVeg: true, preparationTime: 15, variants: [], toppings: [], image: null
    });
    const [variantInput, setVariantInput] = useState({ name: '', price: '' });
    const [toppingInput, setToppingInput] = useState({ name: '', price: '' });

    const fetchItems = async () => {
        try {
            const params = {};
            if (search) params.search = search;
            if (filterCategory) params.category = filterCategory;
            const res = await menuAPI.getAll(params);
            setItems(res.data);
        } catch (error) {
            toast.error('Failed to fetch menu items');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchItems(); }, [search, filterCategory]);

    const openModal = (item = null) => {
        if (item) {
            setEditItem(item);
            setForm({
                name: item.name, description: item.description, category: item.category,
                price: item.price, isVeg: item.isVeg, preparationTime: item.preparationTime,
                variants: item.variants || [], toppings: item.toppings || [], image: null
            });
        } else {
            setEditItem(null);
            setForm({
                name: '', description: '', category: 'Starters', price: '',
                isVeg: true, preparationTime: 15, variants: [], toppings: [], image: null
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', form.name);
            formData.append('description', form.description);
            formData.append('category', form.category);
            formData.append('price', form.price);
            formData.append('isVeg', form.isVeg);
            formData.append('preparationTime', form.preparationTime);
            formData.append('variants', JSON.stringify(form.variants));
            formData.append('toppings', JSON.stringify(form.toppings));
            if (form.image) formData.append('image', form.image);
            if (editItem) {
                await menuAPI.update(editItem._id, formData);
                toast.success('Menu item updated');
            } else {
                await menuAPI.create(formData);
                toast.success('Menu item created');
            }
            setShowModal(false);
            fetchItems();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this item?')) return;
        try {
            await menuAPI.delete(id);
            toast.success('Item deleted');
            fetchItems();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const addVariant = () => {
        if (variantInput.name && variantInput.price) {
            setForm({ ...form, variants: [...form.variants, { name: variantInput.name, price: Number(variantInput.price) }] });
            setVariantInput({ name: '', price: '' });
        }
    };

    const addTopping = () => {
        if (toppingInput.name && toppingInput.price) {
            setForm({ ...form, toppings: [...form.toppings, { name: toppingInput.name, price: Number(toppingInput.price) }] });
            setToppingInput({ name: '', price: '' });
        }
    };

    if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

    return (
        <div className="menu-page">
            <div className="page-header">
                <h1><FiImage /> Menu Management</h1>
                <button className="btn btn-primary" onClick={() => openModal()}>
                    <FiPlus /> Add Item
                </button>
            </div>

            <div className="filter-bar">
                <div className="search-box">
                    <FiSearch />
                    <input placeholder="Search menu..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="filter-select">
                    <option value="">All Categories</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            <div className="menu-grid">
                {items.map(item => (
                    <div key={item._id} className="menu-card">
                        <div className="menu-card-image">
                            {item.image ? (
                                <img src={`http://localhost:5000${item.image}`} alt={item.name} />
                            ) : (
                                <div className="menu-placeholder"><FiImage /></div>
                            )}
                            <span className={`veg-badge ${item.isVeg ? 'veg' : 'non-veg'}`}>
                                {item.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}
                            </span>
                        </div>
                        <div className="menu-card-body">
                            <h3>{item.name}</h3>
                            <p className="menu-desc">{item.description}</p>
                            <div className="menu-meta">
                                <span className="menu-category">{item.category}</span>
                                <span className="menu-price">₹{item.price}</span>
                            </div>
                            {item.variants?.length > 0 && (
                                <div className="menu-variants">
                                    {item.variants.map((v, i) => (
                                        <span key={i} className="variant-tag">{v.name}: ₹{v.price}</span>
                                    ))}
                                </div>
                            )}
                            <div className="menu-actions">
                                <button className="btn btn-sm btn-outline" onClick={() => openModal(item)}><FiEdit2 /></button>
                                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item._id)}><FiTrash2 /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editItem ? 'Edit Item' : 'Add Item'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}><FiX /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Name</label>
                                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows="2" />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Price (₹)</label>
                                    <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Prep Time (min)</label>
                                    <input type="number" value={form.preparationTime} onChange={(e) => setForm({ ...form, preparationTime: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Type</label>
                                    <select value={form.isVeg} onChange={(e) => setForm({ ...form, isVeg: e.target.value === 'true' })}>
                                        <option value="true">Veg</option>
                                        <option value="false">Non-Veg</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Image</label>
                                <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, image: e.target.files[0] })} />
                            </div>

                            <div className="form-section">
                                <label>Variants</label>
                                <div className="inline-add">
                                    <input placeholder="Name" value={variantInput.name} onChange={(e) => setVariantInput({ ...variantInput, name: e.target.value })} />
                                    <input placeholder="Price" type="number" value={variantInput.price} onChange={(e) => setVariantInput({ ...variantInput, price: e.target.value })} />
                                    <button type="button" className="btn btn-sm btn-outline" onClick={addVariant}><FiPlus /></button>
                                </div>
                                <div className="tags-list">
                                    {form.variants.map((v, i) => (
                                        <span key={i} className="tag">{v.name}: ₹{v.price} <FiX onClick={() => setForm({ ...form, variants: form.variants.filter((_, idx) => idx !== i) })} /></span>
                                    ))}
                                </div>
                            </div>

                            <div className="form-section">
                                <label>Toppings</label>
                                <div className="inline-add">
                                    <input placeholder="Name" value={toppingInput.name} onChange={(e) => setToppingInput({ ...toppingInput, name: e.target.value })} />
                                    <input placeholder="Price" type="number" value={toppingInput.price} onChange={(e) => setToppingInput({ ...toppingInput, price: e.target.value })} />
                                    <button type="button" className="btn btn-sm btn-outline" onClick={addTopping}><FiPlus /></button>
                                </div>
                                <div className="tags-list">
                                    {form.toppings.map((t, i) => (
                                        <span key={i} className="tag">{t.name}: ₹{t.price} <FiX onClick={() => setForm({ ...form, toppings: form.toppings.filter((_, idx) => idx !== i) })} /></span>
                                    ))}
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{editItem ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MenuManagement;
