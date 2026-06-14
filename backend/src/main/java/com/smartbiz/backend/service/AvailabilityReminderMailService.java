package com.smartbiz.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class AvailabilityReminderMailService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendInitialReminder(String toEmail, String employeeName, String storeName, LocalDate weekStart,
            LocalDate weekEnd) {
        sendReminder(toEmail, "SmartBiz - Nhắc gửi lịch rảnh tuần kế tiếp",
                buildBody(employeeName, storeName, weekStart, weekEnd,
                        "Hôm nay là thứ Sáu. Vui lòng gửi lịch rảnh của bạn trong ngày hôm nay."));
    }

    public void sendMissingReminder(String toEmail, String employeeName, String storeName, LocalDate weekStart,
            LocalDate weekEnd) {
        sendReminder(toEmail, "SmartBiz - Yêu cầu bổ sung lịch rảnh",
                buildBody(employeeName, storeName, weekStart, weekEnd,
                        "SmartBiz chưa ghi nhận lịch rảnh của bạn trong ngày thứ Sáu. Vui lòng gửi lịch bổ sung sớm nhất có thể."));
    }

    private String buildBody(String employeeName, String storeName, LocalDate weekStart, LocalDate weekEnd,
            String message) {
        return "Xin chào " + employeeName + ",\n\n"
                + message + "\n\n"
                + "Cửa hàng: " + storeName + "\n"
                + "Tuần đăng ký: " + weekStart.format(DATE_FORMATTER) + " - " + weekEnd.format(DATE_FORMATTER)
                + "\n\n"
                + "Bạn có thể đăng nhập SmartBiz và chọn các ca bạn có thể đi làm từ thứ Hai đến Chủ nhật của tuần kế tiếp.\n\n"
                + "Trân trọng,\nSmartBiz";
    }

    private void sendReminder(String toEmail, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(body);

        try {
            mailSender.send(message);
        } catch (MailException ex) {
            throw new RuntimeException("Không thể gửi email nhắc lịch rảnh. Vui lòng thử lại.", ex);
        }
    }
}
