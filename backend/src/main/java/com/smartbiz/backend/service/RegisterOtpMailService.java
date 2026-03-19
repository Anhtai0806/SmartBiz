package com.smartbiz.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RegisterOtpMailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendRegisterOtp(String toEmail, String otpCode, int expiresInSeconds) {
        String subject = "SmartBiz - Mã Xác Nhận Đăng Ký Tài Khoản";
        String body = "Mã OTP đăng ký tài khoản của bạn là: " + otpCode
                + "\nMã có hiệu lực trong " + (expiresInSeconds / 60) + " giây."
                + "\nếu bạn không yêu cầu đăng ký, vui lòng bỏ qua email này.";

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(body);

        try {
            mailSender.send(message);
        } catch (MailException ex) {
            throw new RuntimeException("Unable to send verification email. Please try again.", ex);
        }
    }
}
