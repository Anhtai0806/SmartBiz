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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        LoginResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * Register new user
     * Public endpoint - anyone can register
     */
    @PostMapping("/register")
    public ResponseEntity<RegisterOtpResponse> register(@Valid @RequestBody RegisterRequest registerRequest) {
        RegisterOtpResponse response = authService.register(registerRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/register/verify")
    public ResponseEntity<LoginResponse> verifyRegisterOtp(@Valid @RequestBody RegisterOtpVerifyRequest request) {
        LoginResponse response = authService.verifyRegisterOtp(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register/resend")
    public ResponseEntity<RegisterOtpResponse> resendRegisterOtp(@Valid @RequestBody ResendRegisterOtpRequest request) {
        RegisterOtpResponse response = authService.resendRegisterOtp(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Logout endpoint for stateless JWT authentication
     * Note: Since we're using stateless JWT, the client should remove the token
     * from storage
     * This endpoint simply returns a success message
     * lz toan ngu
     */
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

        UserResponse response = authService.updateProfile(user.getId(), request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        authService.changePassword(user.getId(), request);
        return ResponseEntity.ok().build();
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

}
