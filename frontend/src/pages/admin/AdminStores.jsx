import React, { useState, useEffect } from 'react';
import { getAllStores } from '../../api/adminApi';
import Modal from '../../components/Modal';
import './AdminStores.css';

const AdminStores = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStore, setSelectedStore] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async () => {
        try {
            setLoading(true);
            const data = await getAllStores();
            setStores(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (store) => {
        setSelectedStore(store);
        setShowModal(true);
    };

    const filteredStores = stores.filter(store =>
        store.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.ownerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="loading">Loading stores...</div>;
    }

    if (error) {
        return <div className="error">Error: {error}</div>;
    }

    return (
        <div className="admin-stores">
            <div className="stores-header">
                <h1>Store Management</h1>
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search by store name, owner name, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="stores-table-container">
                <table className="stores-table">
                    <thead>
                        <tr>
                            <th>Store Name</th>
                            <th>Address</th>
                            <th>Owner Name</th>
                            <th>Owner Email</th>
                            <th>Staff Count</th>
                            <th>Tables</th>
                            <th>Created At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStores.map(store => (
                            <tr key={store.id}>
                                <td className="store-name">{store.name}</td>
                                <td>{store.address || 'N/A'}</td>
                                <td>{store.ownerName}</td>
                                <td>{store.ownerEmail}</td>
                                <td>
                                    <span className="count-badge">{store.staffCount || 0}</span>
                                </td>
                                <td>
                                    <span className="count-badge">{store.tableCount || 0}</span>
                                </td>
                                <td>{new Date(store.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <button
                                        className="btn-view"
                                        onClick={() => handleViewDetails(store)}
                                    >
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Store Details"
            >
                {selectedStore && (
                    <div className="store-details">
                        <div className="detail-row">
                            <span className="detail-label">Store Name:</span>
                            <span className="detail-value">{selectedStore.name}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Address:</span>
                            <span className="detail-value">{selectedStore.address || 'N/A'}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Owner Name:</span>
                            <span className="detail-value">{selectedStore.ownerName}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Owner Email:</span>
                            <span className="detail-value">{selectedStore.ownerEmail}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Staff Count:</span>
                            <span className="detail-value">
                                <span className="count-badge">{selectedStore.staffCount || 0}</span>
                            </span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Table Count:</span>
                            <span className="detail-value">
                                <span className="count-badge">{selectedStore.tableCount || 0}</span>
                            </span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Created At:</span>
                            <span className="detail-value">
                                {new Date(selectedStore.createdAt).toLocaleString()}
                            </span>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminStores;
