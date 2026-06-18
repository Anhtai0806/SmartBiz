package com.smartbiz.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StaffMailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendStaffCredentials(String toEmail, String storeName, String temporaryPassword) {
        String subject = "SmartBiz - Thông Tin Tài Khoản Nhân Viên Mới";
        String body = "Xin chào,\n\n"
                + "Tài khoản nhân viên của bạn đã được tạo thành công trên hệ thống SmartBiz.\n\n"
                + "Thông tin tài khoản:\n"
                + "- Cửa hàng: " + storeName + "\n"
                + "- Tài khoản (Email): " + toEmail + "\n"
                + "- Mật khẩu tạm thời: " + temporaryPassword + "\n\n"
                + "Vui lòng đăng nhập vào hệ thống SmartBiz để thay đổi mật khẩu và cập nhật thông tin cá nhân của bạn.\n\n"
                + "Lưu ý quan trọng: Vui lòng không cung cấp thông tin tài khoản hoặc email này cho bất kỳ ai khác để đảm bảo an toàn bảo mật.\n\n"
                + "Trân trọng,\nHệ thống SmartBiz";

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(body);

        try {
            mailSender.send(message);
        } catch (MailException ex) {
            throw new RuntimeException("Không thể gửi email thông tin tài khoản nhân viên. Vui lòng thử lại.", ex);
        }
    }
}
