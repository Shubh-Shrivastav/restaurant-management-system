import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { menuAPI, orderAPI } from '../services/api';
import { FiShoppingCart, FiPlus, FiMinus, FiTrash2, FiSend } from 'react-icons/fi';
import { toast } from 'react-toastify';

const QrMenu = () => {
    const { tableId, adminId } = useParams();
    const [searchParams] = useSearchParams();
    const table = tableId || searchParams.get('table') || '';
    const resolvedAdminId = adminId || searchParams.get('adminId') || '';
    const [items, setItems] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [filterCategory, setFilterCategory] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const params = { available: true };
                if (resolvedAdminId) {
                    params.adminId = resolvedAdminId;
                }
                const res = await menuAPI.getAll(params);
                setItems(res.data);
            } catch (error) {
                toast.error('Failed to load menu');
            } finally {
                setLoading(false);
            }
        };
        fetchMenu();
    }, [resolvedAdminId]);

    const categories = [...new Set(items.map(i => i.category))];

    const addToCart = (item) => {
        const existing = cart.find(c => c.menuItem === item._id);
        if (existing) {
            setCart(cart.map(c => c.menuItem === item._id ? { ...c, quantity: c.quantity + 1, itemTotal: (c.quantity + 1) * c.price } : c));
        } else {
            setCart([...cart, { menuItem: item._id, name: item.name, price: item.price, quantity: 1, itemTotal: item.price, variant: '', toppings: [] }]);
        }
    };

    const updateQty = (menuItem, delta) => {
        setCart(cart.map(c => {
            if (c.menuItem === menuItem) {
                const newQty = c.quantity + delta;
                if (newQty <= 0) return null;
                return { ...c, quantity: newQty, itemTotal: newQty * c.price };
            }
            return c;
        }).filter(Boolean));
    };

    const total = cart.reduce((sum, c) => sum + c.itemTotal, 0);
    const tax = Math.round(total * 0.05 * 100) / 100;

    const placeOrder = async () => {
        if (cart.length === 0) return;
        if (!resolvedAdminId) {
            toast.error('Invalid QR code - missing restaurant ID');
            return;
        }
        try {
            await orderAPI.create({
                orderType: table ? 'Dine In' : 'Takeaway',
                items: cart,
                tableNumber: table,
                customerName: customerName || 'QR Customer',
                customerPhone,
                subtotal: total,
                tax,
                total: total + tax,
                isQrOrder: true,
                adminId: resolvedAdminId
            });
            setOrderPlaced(true);
            setCart([]);
            toast.success('Order placed successfully!');
        } catch (error) {
            toast.error('Failed to place order');
        }
    };

    if (loading) return <div className="qr-loading"><div className="spinner"></div><p>Loading menu...</p></div>;

    if (orderPlaced) {
        return (
            <div className="qr-page">
                <div className="qr-success">
                    <div className="success-icon">✅</div>
                    <h2>Order Placed!</h2>
                    <p>Your order has been sent to the kitchen. Please wait while we prepare it.</p>
                    {table && <p>Table: {table}</p>}
                    <button className="btn btn-primary" onClick={() => setOrderPlaced(false)}>Order More</button>
                </div>
            </div>
        );
    }

    const filteredItems = filterCategory ? items.filter(i => i.category === filterCategory) : items;

    return (
        <div className="qr-page">
            <div className="qr-header">
                <h1>🍽️ PetPooja<span className="logo-plus">+</span></h1>
                {table && <span className="qr-table">Table {table}</span>}
            </div>

            <div className="qr-categories">
                <button className={`qr-cat-btn ${!filterCategory ? 'active' : ''}`} onClick={() => setFilterCategory('')}>All</button>
                {categories.map(c => (
                    <button key={c} className={`qr-cat-btn ${filterCategory === c ? 'active' : ''}`} onClick={() => setFilterCategory(c)}>{c}</button>
                ))}
            </div>

            <div className="qr-menu-list">
                {filteredItems.map(item => (
                    <div key={item._id} className="qr-menu-item">
                        <div className="qr-item-info">
                            <span className={`veg-dot ${item.isVeg ? 'veg' : 'non-veg'}`}></span>
                            <div>
                                <h3>{item.name}</h3>
                                <p>{item.description}</p>
                                <span className="qr-price">₹{item.price}</span>
                            </div>
                        </div>
                        <button className="btn btn-sm btn-primary" onClick={() => addToCart(item)}><FiPlus /> Add</button>
                    </div>
                ))}
            </div>

            {cart.length > 0 && (
                <div className="qr-cart">
                    <h3><FiShoppingCart /> Cart ({cart.length})</h3>
                    <div className="qr-cart-items">
                        {cart.map(item => (
                            <div key={item.menuItem} className="qr-cart-item">
                                <span>{item.name}</span>
                                <div className="qr-cart-controls">
                                    <button onClick={() => updateQty(item.menuItem, -1)}><FiMinus /></button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => updateQty(item.menuItem, 1)}><FiPlus /></button>
                                    <span>₹{item.itemTotal}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="qr-customer-info">
                        <input placeholder="Your Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                        <input placeholder="Phone (optional)" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
                    </div>
                    <div className="qr-cart-summary">
                        <span>Subtotal: ₹{total}</span>
                        <span>Tax: ₹{tax}</span>
                        <span className="qr-total">Total: ₹{total + tax}</span>
                    </div>
                    <button className="btn btn-primary btn-full" onClick={placeOrder}>
                        <FiSend /> Place Order
                    </button>
                </div>
            )}
        </div>
    );
};

export default QrMenu;
