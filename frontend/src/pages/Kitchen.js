import React, { useState, useEffect } from 'react';
import { orderAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { FiMonitor, FiClock, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';

const Kitchen = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { socket } = useSocket();

    const fetchOrders = async () => {
        try {
            const res = await orderAPI.getActive();
            setOrders(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        if (socket) {
            socket.emit('join-kitchen');
            socket.on('new-order', (order) => {
                setOrders(prev => [order, ...prev]);
                toast.info(`🔔 New order: ${order.orderNumber}`);
                try { new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH+Jk5WHdWxtfYmWlYx7b2l1hJKWko2CdW1whI+VlJCKgXVwcH+Mk5KOioR6dHR+ipGOi4eDfHh2e4WLjImGg398eHt/goWFg4F/fXx8fX+AgoKBgH9+fn5+f4CAgIB/fn5+fn9/gICAfn5+fn5/f3+Af35+fn5+fn+Af35+fn5+fn5/f35+fn5+fn5+fn5+fn5+fn5+fnx8').play(); } catch (e) { }
            });
            socket.on('order-updated', (updatedOrder) => {
                setOrders(prev => {
                    if (['Completed', 'Served', 'Cancelled'].includes(updatedOrder.status)) {
                        return prev.filter(o => o._id !== updatedOrder._id);
                    }
                    return prev.map(o => o._id === updatedOrder._id ? updatedOrder : o);
                });
            });
            return () => {
                socket.off('new-order');
                socket.off('order-updated');
            };
        }
    }, [socket]);

    const updateStatus = async (id, status) => {
        try {
            await orderAPI.updateStatus(id, status);
            toast.success(`Order ${status}`);
        } catch (error) {
            toast.error('Update failed');
        }
    };

    const getTimeDiff = (date) => {
        const diff = Math.floor((Date.now() - new Date(date)) / 60000);
        if (diff < 1) return 'Just now';
        if (diff < 60) return `${diff}m ago`;
        return `${Math.floor(diff / 60)}h ${diff % 60}m ago`;
    };

    const getUrgencyClass = (date) => {
        const diff = Math.floor((Date.now() - new Date(date)) / 60000);
        if (diff > 30) return 'urgent';
        if (diff > 15) return 'warning';
        return '';
    };

    if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

    const pending = orders.filter(o => o.status === 'Pending');
    const preparing = orders.filter(o => o.status === 'Preparing');
    const ready = orders.filter(o => o.status === 'Ready');

    return (
        <div className="kitchen-page">
            <div className="page-header">
                <h1><FiMonitor /> Kitchen Display</h1>
                <div className="kitchen-stats">
                    <span className="kstat pending">{pending.length} Pending</span>
                    <span className="kstat preparing">{preparing.length} Preparing</span>
                    <span className="kstat ready">{ready.length} Ready</span>
                </div>
            </div>

            <div className="kitchen-columns">
                <div className="kitchen-column">
                    <h2 className="column-title pending-title"><FiClock /> Pending ({pending.length})</h2>
                    <div className="kitchen-cards">
                        {pending.map(order => (
                            <div key={order._id} className={`kitchen-card ${getUrgencyClass(order.createdAt)}`}>
                                <div className="kitchen-card-header">
                                    <span className="order-num">{order.orderNumber}</span>
                                    <span className={`order-type type-${order.orderType.replace(' ', '-').toLowerCase()}`}>{order.orderType}</span>
                                </div>
                                {order.tableNumber && <span className="table-num">Table {order.tableNumber}</span>}
                                <div className="kitchen-items">
                                    {order.items?.map((item, i) => (
                                        <div key={i} className="kitchen-item">
                                            <span className="qty">{item.quantity}x</span>
                                            <span className="item-name">{item.name}</span>
                                            {item.notes && <span className="item-notes">{item.notes}</span>}
                                        </div>
                                    ))}
                                </div>
                                {order.notes && <p className="order-notes">📝 {order.notes}</p>}
                                <div className="kitchen-card-footer">
                                    <span className="time-elapsed">{getTimeDiff(order.createdAt)}</span>
                                    <button className="btn btn-sm btn-primary" onClick={() => updateStatus(order._id, 'Preparing')}>Start</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="kitchen-column">
                    <h2 className="column-title preparing-title"><FiClock /> Preparing ({preparing.length})</h2>
                    <div className="kitchen-cards">
                        {preparing.map(order => (
                            <div key={order._id} className={`kitchen-card preparing ${getUrgencyClass(order.createdAt)}`}>
                                <div className="kitchen-card-header">
                                    <span className="order-num">{order.orderNumber}</span>
                                    <span className={`order-type type-${order.orderType.replace(' ', '-').toLowerCase()}`}>{order.orderType}</span>
                                </div>
                                {order.tableNumber && <span className="table-num">Table {order.tableNumber}</span>}
                                <div className="kitchen-items">
                                    {order.items?.map((item, i) => (
                                        <div key={i} className="kitchen-item">
                                            <span className="qty">{item.quantity}x</span>
                                            <span className="item-name">{item.name}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="kitchen-card-footer">
                                    <span className="time-elapsed">{getTimeDiff(order.createdAt)}</span>
                                    <button className="btn btn-sm btn-success" onClick={() => updateStatus(order._id, 'Ready')}>Ready</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="kitchen-column">
                    <h2 className="column-title ready-title"><FiCheckCircle /> Ready ({ready.length})</h2>
                    <div className="kitchen-cards">
                        {ready.map(order => (
                            <div key={order._id} className="kitchen-card ready-card">
                                <div className="kitchen-card-header">
                                    <span className="order-num">{order.orderNumber}</span>
                                    <span className={`order-type type-${order.orderType.replace(' ', '-').toLowerCase()}`}>{order.orderType}</span>
                                </div>
                                {order.tableNumber && <span className="table-num">Table {order.tableNumber}</span>}
                                <div className="kitchen-card-footer">
                                    <span className="time-elapsed">{getTimeDiff(order.createdAt)}</span>
                                    <button className="btn btn-sm btn-success" onClick={() => updateStatus(order._id, 'Completed')}>Complete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Kitchen;
