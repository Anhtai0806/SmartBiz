package com.smartbiz.backend.service;

import com.smartbiz.backend.dto.ChangePasswordRequest;
import com.smartbiz.backend.dto.LoginRequest;
import com.smartbiz.backend.dto.LoginResponse;
import com.smartbiz.backend.dto.RegisterRequest;
import com.smartbiz.backend.dto.UpdateProfileRequest;
import com.smartbiz.backend.dto.UserResponse;
import com.smartbiz.backend.entity.User;
import com.smartbiz.backend.enums.Status;
import com.smartbiz.backend.repository.UserRepository;
import com.smartbiz.backend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

        private final AuthenticationManager authenticationManager;
        private final JwtUtil jwtUtil;
        private final UserRepository userRepository;
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

        public LoginResponse register(RegisterRequest registerRequest) {
                // Check if email or phonealready exists
                if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
                        throw new com.smartbiz.backend.exception.EmailOrPhoneAlreadyExistsException(
                                        "Email already exists");
                }

                if (userRepository.findByPhone(registerRequest.getPhone()).isPresent()) {
                        throw new com.smartbiz.backend.exception.EmailOrPhoneAlreadyExistsException(
                                        "Phone already exists");
                }

                // Create new user with default role BUSINESS_OWNER
                User user = User.builder()
                                .email(registerRequest.getEmail())
                                .phone(registerRequest.getPhone())
                                .password(passwordEncoder.encode(registerRequest.getPassword()))
                                .fullName(registerRequest.getFullName())
                                .role(com.smartbiz.backend.enums.Role.BUSINESS_OWNER) // Default role
                                .status(Status.ACTIVE)
                                .build();

                // Save user to database
                User savedUser = userRepository.save(user);

                // Generate JWT token
                String token = jwtUtil.generateToken(savedUser);

                // Return login response
                return LoginResponse.builder()
                                .token(token)
                                .type("Bearer")
                                .id(savedUser.getId())
                                .email(savedUser.getEmail())
                                .phone(savedUser.getPhone())
                                .fullName(savedUser.getFullName())
                                .role(savedUser.getRole().name())
                                .status(savedUser.getStatus().name())
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
}
