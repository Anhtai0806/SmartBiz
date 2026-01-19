package com.smartbiz.backend.entity;

/**
 * Trạng thái của bàn trong cửa hàng
 */
public enum TableStatus {
    EMPTY, // Bàn trống
    SERVING, // Đang phục vụ
    WAITING_PAYMENT, // Chờ thanh toán
    PAID // Đã thanh toán
}
