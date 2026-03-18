package com.smartbiz.backend.enums;

/**
 * Trạng thái của đơn hàng
 */
public enum OrderStatus {
    NEW, // Đơn hàng mới
    PROCESSING, // Đang xử lý
    DONE, // Hoàn thành
    CANCELLED // Đã hủy
}
