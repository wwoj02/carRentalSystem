package com.carrental.backend.reservation;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {
    private final ReservationService reservationService;

    @PostMapping
    public Reservation createReservation(@RequestBody ReservationRequest request) {
        return reservationService.createReservation(request);
    }

    @GetMapping
    public List<Reservation> getAllReservations() {
        return reservationService.getAllReservations();
    }

    @PatchMapping("/{id}/cancel")
    public Reservation cancelReservation(@PathVariable Integer id) {
        return reservationService.cancelReservation(id);
    }

    @GetMapping("/user/{userId}")
    public List<Reservation> getReservationByUser(@PathVariable Integer userId) {
        return reservationService.getReservationByUser(userId);
    }

    @GetMapping("/{id}/agreement")
    public ResponseEntity<byte[]> downloadAgreement(@PathVariable Integer id) {
        String agreement = reservationService.generateAgreement(id);
        byte[] body = agreement.getBytes(StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"rental-agreement-" + id + ".txt\""
                )
                .contentType(MediaType.TEXT_PLAIN)
                .body(body);
    }
}
