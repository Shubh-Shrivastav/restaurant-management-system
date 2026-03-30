import React, { useState, useEffect } from 'react';
import { orderAPI, menuAPI, customerAPI } from '../services/api';
import { FiShoppingCart, FiPlus, FiMinus, FiTrash2, FiSearch, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [cart, setCart] = useState([]);
    const [orderType, setOrderType] = useState('Dine In');
    const [tableNumber, setTableNumber] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [menuSearch, setMenuSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [notes, setNotes] = useState('');

    const fetchOrders = async () => {
        try {
            const params = {};
            if (statusFilter) params.status = statusFilter;
            const res = await orderAPI.getAll(params);
            setOrders(res.data);
        } catch (error) {
            toast.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const fetchMenu = async () => {
        try {
            const res = await menuAPI.getAll({ available: true });
            setMenuItems(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => { fetchOrders(); fetchMenu(); }, [statusFilter]);

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

    const removeFromCart = (menuItem) => {
        setCart(cart.filter(c => c.menuItem !== menuItem));
    };

    const cartTotal = cart.reduce((sum, c) => sum + c.itemTotal, 0);
    const tax = Math.round(cartTotal * 0.05 * 100) / 100;

    const handleCreateOrder = async () => {
        if (cart.length === 0) { toast.warn('Add items to cart'); return; }
        try {
            const orderData = {
                orderType,
                items: cart,
                tableNumber,
                customerName: customerName || 'Walk-in',
                customerPhone,
                customer: selectedCustomer?._id,
                subtotal: cartTotal,
                tax,
                total: cartTotal + tax,
                notes
            };
            await orderAPI.create(orderData);
            toast.success('Order created!');
            setCart([]);
            setShowCreate(false);
            setCustomerName('');
            setCustomerPhone('');
            setTableNumber('');
            setNotes('');
            fetchOrders();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create order');
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await orderAPI.updateStatus(id, status);
            toast.success(`Order ${status}`);
            fetchOrders();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const filteredMenu = menuItems.filter(m => m.name.toLowerCase().includes(menuSearch.toLowerCase()));

    if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

    return (
        <div className="orders-page">
            <div className="page-header">
                <h1><FiShoppingCart /> Orders</h1>
                <button className="btn btn-primary" onClick={() => { setShowCreate(true); fetchMenu(); }}>
                    <FiPlus /> New Order
                </button>
            </div>

            <div className="filter-bar">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
                    <option value="">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Ready">Ready</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>

            <div className="orders-list">
                {orders.map(order => (
                    <div key={order._id} className="order-card">
                        <div className="order-card-header">
                            <div>
                                <span className="order-number">{order.orderNumber}</span>
                                <span className={`badge badge-${order.orderType === 'Dine In' ? 'primary' : order.orderType === 'Takeaway' ? 'warning' : 'success'}`}>
                                    {order.orderType}
                                </span>
                            </div>
                            <span className={`badge badge-${order.status === 'Completed' ? 'success' : order.status === 'Cancelled' ? 'danger' : order.status === 'Ready' ? 'info' : 'warning'}`}>
                                {order.status}
                            </span>
                        </div>
                        <div className="order-card-body">
                            <div className="order-items-list">
                                {order.items?.map((item, i) => (
                                    <span key={i}>{item.quantity}x {item.name}</span>
                                ))}
                            </div>
                            <div className="order-meta">
                                <span>{order.customerName}</span>
                                {order.tableNumber && <span>Table: {order.tableNumber}</span>}
                                <span className="order-total">₹{order.total}</span>
                            </div>
                        </div>
                        <div className="order-card-actions">
                            {order.status === 'Pending' && (
                                <>
                                    <button className="btn btn-sm btn-primary" onClick={() => handleStatusUpdate(order._id, 'Preparing')}>Start Preparing</button>
                                    <button className="btn btn-sm btn-danger" onClick={() => handleStatusUpdate(order._id, 'Cancelled')}>Cancel</button>
                                </>
                            )}
                            {order.status === 'Preparing' && (
                                <button className="btn btn-sm btn-success" onClick={() => handleStatusUpdate(order._id, 'Ready')}>Mark Ready</button>
                            )}
                            {order.status === 'Ready' && (
                                <button className="btn btn-sm btn-success" onClick={() => handleStatusUpdate(order._id, 'Completed')}>Complete</button>
                            )}
                        </div>
                        <div className="order-time">{new Date(order.createdAt).toLocaleString()}</div>
                    </div>
                ))}
                {orders.length === 0 && <p className="no-data">No orders found</p>}
            </div>

            {showCreate && (
                <div className="modal-overlay" onClick={() => setShowCreate(false)}>
                    <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Create New Order</h2>
                            <button className="modal-close" onClick={() => setShowCreate(false)}><FiX /></button>
                        </div>
                        <div className="order-create-layout">
                            <div className="order-menu-section">
                                <div className="order-type-selector">
                                    {['Dine In', 'Takeaway', 'Delivery'].map(type => (
                                        <button key={type} className={`btn btn-sm ${orderType === type ? 'btn-primary' : 'btn-outline'}`} onClick={() => setOrderType(type)}>{type}</button>
                                    ))}
                                </div>
                                {orderType === 'Dine In' && (
                                    <input placeholder="Table Number" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} className="form-input" />
                                )}
                                <div className="form-row">
                                    <input placeholder="Customer Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="form-input" />
                                    <input placeholder="Phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="form-input" />
                                </div>
                                <div className="search-box">
                                    <FiSearch />
                                    <input placeholder="Search menu..." value={menuSearch} onChange={(e) => setMenuSearch(e.target.value)} />
                                </div>
                                <div className="order-menu-grid">
                                    {filteredMenu.map(item => (
                                        <div key={item._id} className="order-menu-item" onClick={() => addToCart(item)}>
                                            <span className="item-name">{item.isVeg ? '🟢' : '🔴'} {item.name}</span>
                                            <span className="item-price">₹{item.price}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="order-cart-section">
                                <h3>Cart ({cart.length})</h3>
                                <div className="cart-items">
                                    {cart.map(item => (
                                        <div key={item.menuItem} className="cart-item">
                                            <span className="cart-item-name">{item.name}</span>
                                            <div className="cart-item-controls">
                                                <button className="btn-icon" onClick={() => updateQty(item.menuItem, -1)}><FiMinus /></button>
                                                <span>{item.quantity}</span>
                                                <button className="btn-icon" onClick={() => updateQty(item.menuItem, 1)}><FiPlus /></button>
                                                <span className="cart-item-total">₹{item.itemTotal}</span>
                                                <button className="btn-icon text-danger" onClick={() => removeFromCart(item.menuItem)}><FiTrash2 /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <textarea placeholder="Notes..." value={notes} onChange={(e) => setNotes(e.target.value)} rows="2" className="form-input" />
                                <div className="cart-summary">
                                    <div><span>Subtotal</span><span>₹{cartTotal}</span></div>
                                    <div><span>Tax (5%)</span><span>₹{tax}</span></div>
                                    <div className="cart-total"><span>Total</span><span>₹{cartTotal + tax}</span></div>
                                </div>
                                <button className="btn btn-primary btn-full" onClick={handleCreateOrder} disabled={cart.length === 0}>
                                    Place Order
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;
