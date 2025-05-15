package com.springboot.pos.controller;

import com.springboot.pos.model.Role;
import com.springboot.pos.model.User;
import com.springboot.pos.payload.JwtResponse;
import com.springboot.pos.payload.LoginDto;
import com.springboot.pos.payload.SignUpDto;
import com.springboot.pos.payload.UserDto;
import com.springboot.pos.repository.RoleRepository;
import com.springboot.pos.repository.UserRepository;
import com.springboot.pos.service.NotificationService;
import com.springboot.pos.utils.JwtUtil;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final NotificationService notificationService;

    public AuthController(AuthenticationManager authenticationManager,
                          UserRepository userRepository,
                          RoleRepository roleRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil,
                          NotificationService notificationService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.notificationService = notificationService;
    }

    @PostMapping("/sign_in")
    public ResponseEntity<?> authenticate(@Valid @RequestBody LoginDto loginDto) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginDto.getUsernameOrEmail(),
                            loginDto.getPassword()
                    )
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtil.generateToken(authentication);
            logger.info("User {} signed in successfully", loginDto.getUsernameOrEmail());
            return ResponseEntity.ok(new JwtResponse(jwt));
        } catch (BadCredentialsException | UsernameNotFoundException e) {
            logger.warn("Failed sign-in attempt for {}: {}", loginDto.getUsernameOrEmail(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid credentials or unverified email");
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignUpDto signUpDto) {
        if (userRepository.existsByUsername(signUpDto.getUsername())) {
            logger.warn("Signup failed: Username {} already exists", signUpDto.getUsername());
            return ResponseEntity.badRequest().body("Username already exists");
        }

        if (userRepository.existsByEmail(signUpDto.getEmail())) {
            logger.warn("Signup failed: Email {} already exists", signUpDto.getEmail());
            return ResponseEntity.badRequest().body("Email already exists");
        }

        User user = new User();
        user.setName(signUpDto.getName());
        user.setUsername(signUpDto.getUsername());
        user.setEmail(signUpDto.getEmail());
        user.setPassword(passwordEncoder.encode(signUpDto.getPassword()));
        user.setVerificationToken(UUID.randomUUID().toString());

        Role role = roleRepository.findByName("ROLE_ADMIN")
                .orElseThrow(() -> {
                    logger.error("Role ROLE_ADMIN not found");
                    return new RuntimeException("Role ROLE_ADMIN not found");
                });
        user.setRoles(Collections.singleton(role));

        userRepository.save(user);

        notificationService.sendVerificationEmail(user.getEmail(), user.getVerificationToken());
        logger.info("User {} registered successfully, verification email sent", signUpDto.getEmail());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body("User registered successfully. Please verify your email.");
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verifyEmail(@RequestParam("token") String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> {
                    logger.warn("Invalid verification token: {}", token);
                    return new RuntimeException("Invalid verification token");
                });

        if (user.isVerified()) {
            logger.info("Email already verified for user {}", user.getEmail());
            return ResponseEntity.ok("Email already verified");
        }

        user.setVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);
        logger.info("Email verified successfully for user {}", user.getEmail());

        return ResponseEntity.ok("Email verified successfully");
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        try {

            String username = userDetails.getUsername();

            User user = userRepository.findByUsernameOrEmail(username, username)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));

            UserDto userDto = new UserDto();
            userDto.setId(user.getId());
            userDto.setName(user.getName());
            userDto.setUsername(user.getUsername());
            userDto.setEmail(user.getEmail());
            userDto.setRoles(user.getRoles().stream()
                    .map(Role::getName)
                    .collect(Collectors.toSet()));

            logger.info("Fetched current user details for {}", username);
            return ResponseEntity.ok(userDto);
        } catch (UsernameNotFoundException e) {
            logger.error("Failed to fetch current user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        } catch (Exception e) {
            logger.error("Error fetching current user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching user data");
        }
    }
}