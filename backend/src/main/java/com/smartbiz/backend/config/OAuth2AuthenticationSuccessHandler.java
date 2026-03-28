package com.smartbiz.backend.config;

import com.smartbiz.backend.dto.LoginResponse;
import com.smartbiz.backend.service.AuthService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Map;
import java.util.Objects;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final AuthService authService;

    @Value("${app.oauth2.authorized-redirect-uri:http://localhost:3000/owner/dashboard}")
    private String authorizedRedirectUri;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws IOException, ServletException {
        String redirectUri = Objects.requireNonNull(
                authorizedRedirectUri,
                "app.oauth2.authorized-redirect-uri must not be null");

        if (response.isCommitted()) {
            log.warn("Response has already been committed. Unable to redirect to {}", redirectUri);
            return;
        }

        try {
            OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
            Map<String, Object> attributes = oauth2User.getAttributes();

            String email = extractEmail(oauth2User, attributes);
            String fullName = extractFullName(oauth2User, attributes, email);

            log.info("OAuth2 login success for email: {}", email);

            LoginResponse loginResponse = authService.loginWithOAuth2(email, fullName);

            String targetUrl = UriComponentsBuilder.fromUriString(redirectUri)
                    .queryParam("token", loginResponse.getToken())
                    .queryParam("role", loginResponse.getRole())
                    .queryParam("email", loginResponse.getEmail())
                    .queryParam("userId", loginResponse.getId())
                    .queryParam("fullName", loginResponse.getFullName())
                    .queryParam("storeId", loginResponse.getStoreId())
                    .build()
                    .encode()
                    .toUriString();

            log.info("Redirecting OAuth2 user to: {}", targetUrl);

            clearAuthenticationAttributes(request);
            getRedirectStrategy().sendRedirect(request, response, targetUrl);
        } catch (Exception ex) {
            log.error("OAuth2 login failed", ex);
            clearAuthenticationAttributes(request);
            String targetUrl = UriComponentsBuilder.fromUriString(redirectUri)
                    .queryParam("error", "OAuth2 login failed: " + ex.getMessage())
                    .build()
                    .encode()
                    .toUriString();
            getRedirectStrategy().sendRedirect(request, response, targetUrl);
        }
    }

    private String extractEmail(OAuth2User oauth2User, Map<String, Object> attributes) {
        String email = asString(attributes.get("email"));
        if (isBlank(email) && oauth2User instanceof OidcUser oidcUser) {
            email = oidcUser.getEmail();
        }
        if (isBlank(email)) {
            String sub = asString(attributes.get("sub"));
            if (!isBlank(sub)) {
                email = sub + "@google.oauth.local";
            }
        }
        return email;
    }

    private String extractFullName(OAuth2User oauth2User, Map<String, Object> attributes, String fallbackEmail) {
        String fullName = asString(attributes.get("name"));
        if (isBlank(fullName) && oauth2User instanceof OidcUser oidcUser) {
            fullName = oidcUser.getFullName();
        }
        if (isBlank(fullName)) {
            fullName = fallbackEmail;
        }
        return fullName;
    }

    private String asString(Object value) {
        return value == null ? null : value.toString();
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
