import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import './StaffTab.css';

const ROLE_LABELS = {
    STAFF: 'Nhân viên',
    CASHIER: 'Thu ngân',
    KITCHEN: 'Bếp'
};

const StaffTab = ({ staffMembers }) => {
    return (
        <div className="staff-tab">
            <div className="tab-header">
                <div>
                    <h3>Nhân viên tại cửa hàng</h3>
                    <p>Việc thêm mới và chỉnh sửa nhân viên được quản lý tập trung ở trang Nhân viên.</p>
                </div>
                <Link to="/owner/staff" className="staff-manage-link">
                    Mở trang quản lý nhân viên
                </Link>
            </div>

            {staffMembers && staffMembers.length > 0 ? (
                <div className="staff-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Họ tên</th>
                                <th>Email</th>
                                <th>Vai trò</th>
                                <th>Trạng thái</th>
                                <th>Hồ sơ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staffMembers.map((staff) => (
                                <tr key={staff.id}>
                                    <td className="staff-name">{staff.fullName || 'Chưa cập nhật'}</td>
                                    <td>{staff.email}</td>
                                    <td>{ROLE_LABELS[staff.role] || staff.role}</td>
                                    <td>
                                        <StatusBadge status={staff.status === 'ACTIVE' ? 'active' : 'inactive'}>
                                            {staff.status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm ngưng'}
                                        </StatusBadge>
                                    </td>
                                    <td>
                                        <StatusBadge status={staff.onboardingCompleted ? 'active' : 'pending'}>
                                            {staff.onboardingCompleted ? 'Đã cập nhật' : 'Chưa thay đổi'}
                                        </StatusBadge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="empty-state">
                    <p>Chưa có nhân viên nào được phân vào cửa hàng này.</p>
                    <Link to="/owner/staff" className="staff-manage-link">
                        Thêm nhân viên từ trang quản lý
                    </Link>
                </div>
            )}
        </div>
    );
};

export default StaffTab;
