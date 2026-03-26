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
import com.smartbiz.backend.repository.StoreRepository;
import com.smartbiz.backend.repository.UserRepository;
import com.smartbiz.backend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.security.SecureRandom;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

        private static final int REGISTER_OTP_EXPIRES_IN_SECONDS = 60;
        private static final SecureRandom OTP_RANDOM = new SecureRandom();

        private final AuthenticationManager authenticationManager;
        private final JwtUtil jwtUtil;
        private final UserRepository userRepository;
        private final StoreRepository storeRepository;
        private final PendingRegistrationRepository pendingRegistrationRepository;
        private final RegisterOtpMailService registerOtpMailService;
        private final PasswordEncoder passwordEncoder;

        public LoginResponse login(@NonNull LoginRequest loginRequest) throws AuthenticationException {
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                loginRequest.getUsername(),
                                                loginRequest.getPassword()));

                User user = userRepository.findByEmail(loginRequest.getUsername())
                                .or(() -> userRepository.findByPhone(loginRequest.getUsername()))
                                .orElseThrow(() -> new RuntimeException("User not found"));

                String token = requireValue(jwtUtil.generateToken(user), "token");

                return buildLoginResponse(requireValue(user, "user"), token);
        }

        @Transactional
        public LoginResponse loginWithOAuth2(String email, String fullName) {
                if (email == null || email.isBlank()) {
                        throw new RuntimeException("Google account does not provide email");
                }

                String normalizedEmail = email.trim().toLowerCase();
                User user = userRepository.findByEmail(normalizedEmail)
                                .orElseGet(() -> createOAuth2User(requireValue(normalizedEmail, "normalizedEmail"), fullName));

                user.setLastLoginAt(LocalDateTime.now());
                User savedUser = userRepository.save(user);

                String token = requireValue(jwtUtil.generateToken(savedUser), "token");
                return buildLoginResponse(requireValue(savedUser, "savedUser"), token);
        }

        @Transactional
        public RegisterOtpResponse register(@NonNull RegisterRequest registerRequest) {
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
        public LoginResponse verifyRegisterOtp(@NonNull RegisterOtpVerifyRequest request) {
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

                User user = requireValue(User.builder()
                                .email(pendingRegistration.getEmail())
                                .phone(pendingRegistration.getPhone())
                                .password(pendingRegistration.getPassword())
                                .fullName(pendingRegistration.getFullName())
                                .role(Role.BUSINESS_OWNER)
                                .status(Status.ACTIVE)
                                .build(), "user");

                User savedUser = userRepository.save(user);
                pendingRegistrationRepository.delete(pendingRegistration);

                String token = requireValue(jwtUtil.generateToken(savedUser), "token");
                return buildLoginResponse(requireValue(savedUser, "savedUser"), token);
        }

        @Transactional
        public RegisterOtpResponse resendRegisterOtp(@NonNull ResendRegisterOtpRequest request) {
                String email = requireValue(request.getEmail(), "email");
                if (userRepository.existsByEmail(email)) {
                        throw new InvalidOtpException("Account is already verified");
                }

                PendingRegistration pendingRegistration = pendingRegistrationRepository.findByEmail(email)
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

        public UserResponse updateProfile(@NonNull UUID userId, @NonNull UpdateProfileRequest request) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                String requestedPhone = request.getPhone();

                // OAuth2-created users may not have a phone number yet, so compare safely.
                if (!Objects.equals(user.getPhone(), requestedPhone) &&
                                userRepository.findByPhone(requestedPhone).isPresent()) {
                        throw new RuntimeException("Phone number already in use");
                }

                user.setFullName(request.getFullName());
                user.setPhone(requestedPhone);

                User updatedUser = userRepository.save(user);

                return UserResponse.builder()
                                .id(updatedUser.getId())
                                .email(updatedUser.getEmail())
                                .phone(updatedUser.getPhone())
                                .fullName(updatedUser.getFullName())
                                .role(updatedUser.getRole().name())
                                .status(updatedUser.getStatus().name())
                                .createdAt(updatedUser.getCreatedAt())
                                .build();
        }

        public void changePassword(@NonNull UUID userId, @NonNull ChangePasswordRequest request) {
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

        private LoginResponse buildLoginResponse(@NonNull User user, @NonNull String token) {
                UUID userId = requireValue(user.getId(), "user.id");
                Long storeId = storeRepository.findFirstByStaffMembersId(userId)
                                .map(com.smartbiz.backend.entity.Store::getId)
                                .orElse(null);

                return LoginResponse.builder()
                                .token(token)
                                .type("Bearer")
                                .id(user.getId())
                                .phone(user.getPhone())
                                .email(user.getEmail())
                                .fullName(user.getFullName())
                                .role(user.getRole().name())
                                .status(user.getStatus().name())
                                .storeId(storeId)
                                .build();
        }

        private User createOAuth2User(@NonNull String email, String fullName) {
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
                int otp = OTP_RANDOM.nextInt(900000) + 100000;
                return String.valueOf(otp);
        }

        @NonNull
        private <T> T requireValue(T value, String fieldName) {
                return Objects.requireNonNull(value, fieldName + " must not be null");
        }
}
