import React, { useState, useEffect } from 'react';
import { getQRPaymentCode, createQRPaymentCode, updateQRPaymentCode, deleteQRPaymentCode } from '../../api/businessOwnerApi';
import './OwnerQRPayment.css';

const OwnerQRPayment = () => {
    const [qrCode, setQrCode] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchQRCode();
    }, []);

    const fetchQRCode = async () => {
        try {
            setLoading(true);
            const response = await getQRPaymentCode();
            setQrCode(response);
            if (response && response.imageData) {
                setPreviewImage(`data:${response.imageType};base64,${response.imageData}`);
            }
        } catch (err) {
            console.error('Error fetching QR code:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Vui lòng chọn file ảnh hợp lệ');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Kích thước file không được vượt quá 5MB');
            return;
        }

        setSelectedFile(file);
        setError('');

        // Preview image
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        if (!selectedFile && !qrCode) {
            setError('Vui lòng chọn ảnh QR code');
            return;
        }

        try {
            setUploading(true);
            setError('');
            setSuccess('');

            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = reader.result.split(',')[1];
                const qrData = {
                    imageData: base64String,
                    imageName: selectedFile.name,
                    imageType: selectedFile.type
                };

                try {
                    let response;
                    if (qrCode) {
                        // Update existing QR code
                        response = await updateQRPaymentCode(qrData);
                        setSuccess('Cập nhật mã QR thành công!');
                    } else {
                        // Create new QR code
                        response = await createQRPaymentCode(qrData);
                        setSuccess('Tải lên mã QR thành công!');
                    }
                    setQrCode(response);
                    setSelectedFile(null);
                    await fetchQRCode();
                } catch (err) {
                    setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu mã QR');
                }
            };

            reader.readAsDataURL(selectedFile);
        } catch (err) {
            setError('Có lỗi xảy ra khi đọc file');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa mã QR này?')) {
            return;
        }

        try {
            setUploading(true);
            await deleteQRPaymentCode();
            setQrCode(null);
            setPreviewImage(null);
            setSelectedFile(null);
            setSuccess('Xóa mã QR thành công!');
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi xóa mã QR');
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="qr-payment-container">
                <div className="loading">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="qr-payment-container">
            <div className="qr-payment-header">
                <h2>Quản lý mã QR thanh toán</h2>
                <p>Tải lên mã QR để khách hàng có thể thanh toán trực tiếp</p>
            </div>

            {error && (
                <div className="alert alert-error">
                    <span className="alert-icon">⚠️</span>
                    {error}
                </div>
            )}

            {success && (
                <div className="alert alert-success">
                    <span className="alert-icon">✓</span>
                    {success}
                </div>
            )}

            <div className="qr-payment-content">
                <div className="qr-preview-card">
                    <h3>Mã QR hiện tại</h3>
                    {previewImage ? (
                        <div className="qr-image-container">
                            <img src={previewImage} alt="QR Code" className="qr-image" />
                            {qrCode && (
                                <div className="qr-info">
                                    <p><strong>Tên file:</strong> {qrCode.imageName}</p>
                                    <p><strong>Ngày tạo:</strong> {new Date(qrCode.createdAt).toLocaleString('vi-VN')}</p>
                                    {qrCode.updatedAt && qrCode.updatedAt !== qrCode.createdAt && (
                                        <p><strong>Cập nhật:</strong> {new Date(qrCode.updatedAt).toLocaleString('vi-VN')}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="qr-placeholder">
                            <span className="qr-placeholder-icon">📱</span>
                            <p>Chưa có mã QR</p>
                            <p className="qr-placeholder-hint">Tải lên ảnh mã QR của bạn</p>
                        </div>
                    )}
                </div>

                <div className="qr-upload-card">
                    <h3>{qrCode ? 'Cập nhật mã QR' : 'Tải lên mã QR'}</h3>

                    <div className="upload-area">
                        <input
                            type="file"
                            id="qr-file-input"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="file-input"
                        />
                        <label htmlFor="qr-file-input" className="upload-label">
                            <span className="upload-icon">📤</span>
                            <span className="upload-text">
                                {selectedFile ? selectedFile.name : 'Chọn ảnh QR code'}
                            </span>
                            <span className="upload-hint">PNG, JPG, JPEG (tối đa 5MB)</span>
                        </label>
                    </div>

                    <div className="qr-actions">
                        <button
                            className="btn btn-primary"
                            onClick={handleUpload}
                            disabled={!selectedFile || uploading}
                        >
                            {uploading ? 'Đang xử lý...' : (qrCode ? 'Cập nhật' : 'Tải lên')}
                        </button>

                        {qrCode && (
                            <button
                                className="btn btn-danger"
                                onClick={handleDelete}
                                disabled={uploading}
                            >
                                Xóa mã QR
                            </button>
                        )}
                    </div>

                    <div className="qr-note">
                        <p><strong>Lưu ý:</strong></p>
                        <ul>
                            <li>Chỉ được tải lên 1 mã QR duy nhất</li>
                            <li>Mã QR sẽ được hiển thị cho khách hàng khi thanh toán</li>
                            <li>Hỗ trợ định dạng: PNG, JPG, JPEG</li>
                            <li>Kích thước tối đa: 5MB</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OwnerQRPayment;
