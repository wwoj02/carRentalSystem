package com.carrental.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final TokenAuthenticationFilter tokenAuthenticationFilter;

    public SecurityConfig(TokenAuthenticationFilter tokenAuthenticationFilter) {
        this.tokenAuthenticationFilter = tokenAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.sameOrigin()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/register", "/api/auth/login").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/auth/me").authenticated()
                        .requestMatchers("/h2-console/**", "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/vehicles/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/vehicles").hasAnyRole("EMPLOYEE", "ADMIN")
                        .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/vehicles/**").hasAnyRole("EMPLOYEE", "ADMIN")
                        .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/vehicles/**").hasAnyRole("EMPLOYEE", "ADMIN")
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/reservations").hasAnyRole("EMPLOYEE", "ADMIN")
                        .requestMatchers(
                                "/api/reservations/*/pickup",
                                "/api/reservations/*/return",
                                "/api/reservations/*/staff-cancel"
                        ).hasAnyRole("EMPLOYEE", "ADMIN")
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/users").hasAnyRole("EMPLOYEE", "ADMIN")
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/users").hasAnyRole("EMPLOYEE", "ADMIN")
                        .requestMatchers("/api/reports/**").hasAnyRole("EMPLOYEE", "ADMIN")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(tokenAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
//temp cors
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of(
                "http://localhost:*",
                "http://127.0.0.1:*"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
