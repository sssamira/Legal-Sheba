package io.github.sssamira.legalsheba.controller;

import io.github.sssamira.legalsheba.model.LawyerProfile;
import io.github.sssamira.legalsheba.model.UserEntity;
import io.github.sssamira.legalsheba.repository.LawyerProfileRepository;
import io.github.sssamira.legalsheba.repository.UserRepository;
import io.github.sssamira.legalsheba.repository.SpecialtyRepository;
import io.github.sssamira.legalsheba.service.JwtService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import com.fasterxml.jackson.annotation.JsonAlias;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

	private final UserRepository userRepository;
	private final LawyerProfileRepository lawyerProfileRepository;
	private final SpecialtyRepository specialtyRepository;
	private final PasswordEncoder passwordEncoder;
	private final AuthenticationManager authenticationManager;
	private final JwtService jwtService;

	@PostMapping("/register")
	public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest request) {
		if (userRepository.existsByEmail(request.getEmail())) {
			return ResponseEntity.badRequest().body(Map.of("error", "Email already in use"));
		}
		UserEntity user = UserEntity.builder()
				.fName(request.getFName())
				.email(request.getEmail())
				.password(passwordEncoder.encode(request.getPassword()))
				.role("USER")
				.createdAt(request.getCreatedAt())
				.build();
		userRepository.save(user);
		String token = jwtService.generateToken(org.springframework.security.core.userdetails.User
				.withUsername(user.getEmail())
				.password(user.getPassword())
				.roles(user.getRole())
				.build(), new HashMap<>());
		return ResponseEntity.ok(AuthResponse.of(token, user, null));
	}

	@PostMapping("/register-lawyer")
	public ResponseEntity<?> registerLawyer(@Valid @RequestBody RegisterLawyerRequest request) {
		if (userRepository.existsByEmail(request.getEmail())) {
			return ResponseEntity.badRequest().body(Map.of("error", "Email already in use"));
		}
		UserEntity user = UserEntity.builder()
				.fName(request.getFName())
				.email(request.getEmail())
				.password(passwordEncoder.encode(request.getPassword()))
				.role("LAWYER")
				.createdAt(request.getCreatedAt())
				.build();
		userRepository.save(user);

		LawyerProfile profile = LawyerProfile.builder()
				.user(user)
				.experience(request.getExperience())
				.location(request.getLocation())
				.courtOfPractice(request.getCourtOfPractice())
				.availabilityDetails(request.getAvailabilityDetails())
				.vHour(request.getVHour())
				.build();
		lawyerProfileRepository.save(profile);

		// Optional: save specialties if provided
		if (request.getSpecialties() != null && !request.getSpecialties().isEmpty()) {
			for (String name : request.getSpecialties()) {
				if (name == null || name.isBlank()) continue;
				io.github.sssamira.legalsheba.model.Specialty s = io.github.sssamira.legalsheba.model.Specialty.builder()
						.lawyer(profile)
						.name(name.trim())
						.build();
				specialtyRepository.save(s);
			}
		}

		String token = jwtService.generateToken(org.springframework.security.core.userdetails.User
				.withUsername(user.getEmail())
				.password(user.getPassword())
				.roles(user.getRole())
				.build(), new HashMap<>());
		return ResponseEntity.ok(AuthResponse.of(token, user, profile.getId()));
	}

	@PostMapping("/login")
	public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
		authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
		UserEntity user = userRepository.findByEmail(request.getEmail()).orElseThrow();
		String token = jwtService.generateToken(org.springframework.security.core.userdetails.User
				.withUsername(user.getEmail())
				.password(user.getPassword())
				.roles(user.getRole())
				.build(), new HashMap<>());
		Long lawyerProfileId = lawyerProfileRepository.findByUser(user).map(LawyerProfile::getId).orElse(null);
		return ResponseEntity.ok(AuthResponse.of(token, user, lawyerProfileId));
	}

	@Data
	public static class RegisterRequest {
		@JsonAlias({"firstName", "name"})
		private String fName;
		private String email;
		private String password;
		private String createdAt; // optional
	}

	@Data
	public static class RegisterLawyerRequest {
		@JsonAlias({"firstName", "name"})
		private String fName;
		private String email;
		private String password;
		private String createdAt; // optional
		private Integer experience;
		private String location;
		private String courtOfPractice;
		private String availabilityDetails;
		private String vHour;
		private List<String> specialties;
	}

	@Data
	public static class LoginRequest {
		private String email;
		private String password;
	}

	@Data
	@AllArgsConstructor(staticName = "of")
	public static class AuthResponse {
		private String token;
		private Long id;
		private String email;
		private String role;
		private String fName;
		private Long lawyerProfileId;

		// For frontend compatibility (expects `name` sometimes)
		public String getName() { return fName; }

		public static AuthResponse of(String token, UserEntity user) {
			return of(token, user, null);
		}

		public static AuthResponse of(String token, UserEntity user, Long lawyerProfileId) {
			return new AuthResponse(token, user.getId(), user.getEmail(), user.getRole(), user.getFName(), lawyerProfileId);
		}
	}
}
