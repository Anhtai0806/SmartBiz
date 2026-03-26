package com.smartbiz.backend.controller;

import com.smartbiz.backend.dto.ChangePasswordRequest;
import com.smartbiz.backend.dto.LoginRequest;
import com.smartbiz.backend.dto.LoginResponse;
import com.smartbiz.backend.dto.LogoutResponse;
import com.smartbiz.backend.dto.RegisterOtpResponse;
import com.smartbiz.backend.dto.RegisterOtpVerifyRequest;
import com.smartbiz.backend.dto.RegisterRequest;
import com.smartbiz.backend.dto.ResendRegisterOtpRequest;
import com.smartbiz.backend.dto.UpdateProfileRequest;
import com.smartbiz.backend.dto.UserResponse;
import com.smartbiz.backend.entity.User;
import com.smartbiz.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody @NonNull LoginRequest loginRequest) {
        LoginResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * Register new user
     * Public endpoint - anyone can register
     */
    @PostMapping("/register")
    public ResponseEntity<RegisterOtpResponse> register(
            @Valid @RequestBody @NonNull RegisterRequest registerRequest) {
        RegisterOtpResponse response = authService.register(registerRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/register/verify")
    public ResponseEntity<LoginResponse> verifyRegisterOtp(
            @Valid @RequestBody @NonNull RegisterOtpVerifyRequest request) {
        LoginResponse response = authService.verifyRegisterOtp(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register/resend")
    public ResponseEntity<RegisterOtpResponse> resendRegisterOtp(
            @Valid @RequestBody @NonNull ResendRegisterOtpRequest request) {
        RegisterOtpResponse response = authService.resendRegisterOtp(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<LogoutResponse> logout() {
        LogoutResponse response = LogoutResponse.builder()
                .message("Logout successful. Please remove the token from client storage.")
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser() {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        UserResponse response = UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .phone(user.getPhone())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .status(user.getStatus().name())
                .createdAt(user.getCreatedAt())
                .build();

        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        UserResponse response = authService.updateProfile(getAuthenticatedUserId(user), requireValue(request, "request"));
        return ResponseEntity.ok(response);
    }

    @PutMapping("/change-password")
    public ResponseEntity<LogoutResponse> changePassword(@Valid @RequestBody @NonNull ChangePasswordRequest request) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        authService.changePassword(getAuthenticatedUserId(user), request);
        LogoutResponse response = LogoutResponse.builder()
                .message("Password changed successfully")
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(response);
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        Object principal = authentication.getPrincipal();
        if (!(principal instanceof User user)) {
            return null;
        }
        return user;
    }

    @NonNull
    private UUID getAuthenticatedUserId(@NonNull User user) {
        return requireValue(user.getId(), "authenticatedUser.id");
    }

    @NonNull
    private <T> T requireValue(T value, String fieldName) {
        return Objects.requireNonNull(value, fieldName + " must not be null");
    }

}
