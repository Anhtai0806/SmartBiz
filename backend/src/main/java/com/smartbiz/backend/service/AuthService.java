package com.smartbiz.backend.service;

import com.smartbiz.backend.dto.ChangePasswordRequest;
import com.smartbiz.backend.dto.LoginRequest;
import com.smartbiz.backend.dto.LoginResponse;
import com.smartbiz.backend.dto.RegisterOtpResponse;
import com.smartbiz.backend.dto.RegisterOtpVerifyRequest;
import com.smartbiz.backend.dto.RegisterRequest;
import com.smartbiz.backend.dto.ResendRegisterOtpRequest;
import com.smartbiz.backend.dto.UpdateProfileRequest;
import com.smartbiz.backend.dto.UserResponse;
import com.smartbiz.backend.entity.PendingRegistration;
import com.smartbiz.backend.entity.User;
import com.smartbiz.backend.enums.Role;
import com.smartbiz.backend.enums.Status;
import com.smartbiz.backend.exception.EmailOrPhoneAlreadyExistsException;
import com.smartbiz.backend.exception.InvalidOtpException;
import com.smartbiz.backend.repository.PendingRegistrationRepository;
import com.smartbiz.backend.repository.UserRepository;
import com.smartbiz.backend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

        private static final int REGISTER_OTP_EXPIRES_IN_SECONDS = 60;

        private final AuthenticationManager authenticationManager;
        private final JwtUtil jwtUtil;
        private final UserRepository userRepository;
        private final PendingRegistrationRepository pendingRegistrationRepository;
        private final RegisterOtpMailService registerOtpMailService;
        private final PasswordEncoder passwordEncoder;

        public LoginResponse login(LoginRequest loginRequest) throws AuthenticationException {
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                loginRequest.getUsername(),
                                                loginRequest.getPassword()));

                User user = userRepository.findByEmail(loginRequest.getUsername())
                                .or(() -> userRepository.findByPhone(loginRequest.getUsername()))
                                .orElseThrow(() -> new RuntimeException("User not found"));

                String token = jwtUtil.generateToken(user);

                return LoginResponse.builder()
                                .token(token)
                                .type("Bearer")
                                .id(user.getId())
                                .phone(user.getPhone())
                                .email(user.getEmail())
                                .fullName(user.getFullName())
                                .role(user.getRole().name())
                                .status(user.getStatus().name())
                                .storeId(user.getStaffStores().isEmpty() ? null : user.getStaffStores().get(0).getId())
                                .build();
        }

        @Transactional
        public LoginResponse loginWithOAuth2(String email, String fullName) {
                if (email == null || email.isBlank()) {
                        throw new RuntimeException("Google account does not provide email");
                }

                String normalizedEmail = email.trim().toLowerCase();
                User user = userRepository.findByEmail(normalizedEmail)
                                .orElseGet(() -> createOAuth2User(normalizedEmail, fullName));

                user.setLastLoginAt(LocalDateTime.now());
                User savedUser = userRepository.save(user);

                String token = jwtUtil.generateToken(savedUser);
                return buildLoginResponse(savedUser, token);
        }

        @Transactional
        public RegisterOtpResponse register(RegisterRequest registerRequest) {
                if (userRepository.existsByEmail(registerRequest.getEmail())) {
                        throw new EmailOrPhoneAlreadyExistsException("Email already exists");
                }

                if (userRepository.existsByPhone(registerRequest.getPhone())) {
                        throw new EmailOrPhoneAlreadyExistsException("Phone already exists");
                }

                PendingRegistration pendingByEmail = pendingRegistrationRepository
                                .findByEmail(registerRequest.getEmail())
                                .orElse(null);
                PendingRegistration pendingByPhone = pendingRegistrationRepository
                                .findByPhone(registerRequest.getPhone())
                                .orElse(null);

                if (pendingByEmail != null && pendingByPhone != null && !pendingByEmail.getId().equals(pendingByPhone.getId())) {
                        throw new EmailOrPhoneAlreadyExistsException(
                                        "Email and phone are already associated with different pending accounts");
                }

                PendingRegistration pendingRegistration = pendingByEmail != null ? pendingByEmail : pendingByPhone;
                if (pendingRegistration == null) {
                        pendingRegistration = PendingRegistration.builder().build();
                }

                String otpCode = generateSixDigitOtp();
                pendingRegistration.setEmail(registerRequest.getEmail());
                pendingRegistration.setPhone(registerRequest.getPhone());
                pendingRegistration.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
                pendingRegistration.setFullName(registerRequest.getFullName());
                pendingRegistration.setOtpCode(otpCode);
                pendingRegistration.setExpiresAt(LocalDateTime.now().plusSeconds(REGISTER_OTP_EXPIRES_IN_SECONDS));
                pendingRegistrationRepository.save(pendingRegistration);

                registerOtpMailService.sendRegisterOtp(
                                pendingRegistration.getEmail(),
                                otpCode,
                                REGISTER_OTP_EXPIRES_IN_SECONDS);

                return RegisterOtpResponse.builder()
                                .message("OTP has been sent to your email. Please verify to complete registration.")
                                .email(pendingRegistration.getEmail())
                                .expiresAt(pendingRegistration.getExpiresAt())
                                .expiresInSeconds(REGISTER_OTP_EXPIRES_IN_SECONDS)
                                .build();
        }

        @Transactional
        public LoginResponse verifyRegisterOtp(RegisterOtpVerifyRequest request) {
                PendingRegistration pendingRegistration = pendingRegistrationRepository
                                .findByEmail(request.getEmail())
                                .orElseThrow(() -> new InvalidOtpException("Invalid OTP or email"));

                if (pendingRegistration.isExpired()) {
                        throw new InvalidOtpException("OTP has expired. Please request a new OTP.");
                }

                if (!pendingRegistration.getOtpCode().equals(request.getOtpCode())) {
                        throw new InvalidOtpException("Invalid OTP code");
                }

                if (userRepository.existsByEmail(pendingRegistration.getEmail())) {
                        throw new EmailOrPhoneAlreadyExistsException("Email already exists");
                }
                if (userRepository.existsByPhone(pendingRegistration.getPhone())) {
                        throw new EmailOrPhoneAlreadyExistsException("Phone already exists");
                }

                User user = User.builder()
                                .email(pendingRegistration.getEmail())
                                .phone(pendingRegistration.getPhone())
                                .password(pendingRegistration.getPassword())
                                .fullName(pendingRegistration.getFullName())
                                .role(com.smartbiz.backend.enums.Role.BUSINESS_OWNER)
                                .status(Status.ACTIVE)
                                .build();

                User savedUser = userRepository.save(user);
                pendingRegistrationRepository.delete(pendingRegistration);

                String token = jwtUtil.generateToken(savedUser);
                return buildLoginResponse(savedUser, token);
        }

        @Transactional
        public RegisterOtpResponse resendRegisterOtp(ResendRegisterOtpRequest request) {
                if (userRepository.existsByEmail(request.getEmail())) {
                        throw new InvalidOtpException("Account is already verified");
                }

                PendingRegistration pendingRegistration = pendingRegistrationRepository.findByEmail(request.getEmail())
                                .orElseThrow(() -> new InvalidOtpException("No registration found for this email"));

                String otpCode = generateSixDigitOtp();
                pendingRegistration.setOtpCode(otpCode);
                pendingRegistration.setExpiresAt(LocalDateTime.now().plusSeconds(REGISTER_OTP_EXPIRES_IN_SECONDS));
                pendingRegistrationRepository.save(pendingRegistration);
                registerOtpMailService.sendRegisterOtp(
                                pendingRegistration.getEmail(),
                                otpCode,
                                REGISTER_OTP_EXPIRES_IN_SECONDS);

                return RegisterOtpResponse.builder()
                                .message("OTP has been regenerated and sent to your email.")
                                .email(pendingRegistration.getEmail())
                                .expiresAt(pendingRegistration.getExpiresAt())
                                .expiresInSeconds(REGISTER_OTP_EXPIRES_IN_SECONDS)
                                .build();
        }

        public UserResponse updateProfile(java.util.UUID userId, UpdateProfileRequest request) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                // Check if phone is being changed and if it already exists for another user
                if (!user.getPhone().equals(request.getPhone()) &&
                                userRepository.findByPhone(request.getPhone()).isPresent()) {
                        throw new RuntimeException("Phone number already in use");
                }

                user.setFullName(request.getFullName());
                user.setPhone(request.getPhone());

                User updatedUser = userRepository.save(user);

                return UserResponse.builder()
                                .id(updatedUser.getId())
                                .email(updatedUser.getEmail())
                                .fullName(updatedUser.getFullName())
                                .role(updatedUser.getRole().name())
                                .status(updatedUser.getStatus().name())
                                .createdAt(updatedUser.getCreatedAt())
                                .build();
        }

        public void changePassword(java.util.UUID userId, ChangePasswordRequest request) {
                if (!request.getNewPassword().equals(request.getConfirmPassword())) {
                        throw new RuntimeException("Passwords do not match");
                }

                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                        throw new RuntimeException("Incorrect current password");
                }

                user.setPassword(passwordEncoder.encode(request.getNewPassword()));
                userRepository.save(user);
        }

        private LoginResponse buildLoginResponse(User user, String token) {
                return LoginResponse.builder()
                                .token(token)
                                .type("Bearer")
                                .id(user.getId())
                                .phone(user.getPhone())
                                .email(user.getEmail())
                                .fullName(user.getFullName())
                                .role(user.getRole().name())
                                .status(user.getStatus().name())
                                .storeId(user.getStaffStores().isEmpty() ? null : user.getStaffStores().get(0).getId())
                                .build();
        }

        private User createOAuth2User(String email, String fullName) {
                String defaultName = (fullName == null || fullName.isBlank()) ? email : fullName;
                String randomPassword = passwordEncoder.encode("oauth2-" + UUID.randomUUID());

                return User.builder()
                                .email(email)
                                .password(randomPassword)
                                .fullName(defaultName)
                                .role(Role.BUSINESS_OWNER)
                                .status(Status.ACTIVE)
                                .build();
        }

        private String generateSixDigitOtp() {
                int otp = (int) (Math.random() * 900000) + 100000;
                return String.valueOf(otp);
        }
}
