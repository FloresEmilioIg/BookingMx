package com.bookingmx.reservations.service;

import com.bookingmx.reservations.dto.ReservationRequest;
import com.bookingmx.reservations.model.Reservation;
import com.bookingmx.reservations.model.ReservationStatus;
import com.bookingmx.reservations.repo.ReservationRepository;
import com.bookingmx.reservations.exception.BadRequestException;
import com.bookingmx.reservations.exception.NotFoundException;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

/**
 * Service layer for handling business logic related to reservations.
 * Manages creation, listing, updating, and cancellation, including validation checks.
 * This class uses constructor injection for its dependencies.
 */
@Service
public class ReservationService {
    private final ReservationRepository repo;

    /**
     * Constructor for Dependency Injection. Spring automatically provides
     * the ReservationRepository bean here (since it's annotated with @Repository).
     * @param repo The ReservationRepository instance.
     */
    public ReservationService(ReservationRepository repo) {
        this.repo = repo;
    }

    /**
     * Retrieves all available reservations.
     * @return A list of all Reservation objects.
     */
    public List<Reservation> list() {
        return repo.findAll();
    }

    /**
     * Creates a new reservation.
     * Performs date validation: check-out after check-in, and both dates must be in the future.
     * The new reservation is saved with its generated ID.
     * @param req The reservation details (guest name, hotel name, check-in, check-out).
     * @return The saved reservation object.
     * @throws BadRequestException if date validation fails.
     */
    public Reservation create(ReservationRequest req) {
        validateDates(req.getCheckIn(), req.getCheckOut());
        Reservation r = new Reservation(null, req.getGuestName(), req.getHotelName(), req.getCheckIn(), req.getCheckOut());
        return repo.save(r);
    }

    /**
     * Updates an existing reservation.
     * Performs date validation and checks if the existing reservation is active.
     * @param id The ID of the reservation to update.
     * @param req The new details for the reservation.
     * @return The updated Reservation object.
     * @throws NotFoundException if the reservation ID does not exist.
     * @throws BadRequestException if the reservation is already canceled or if date validation fails.
     */
    public Reservation update(Long id, ReservationRequest req) {
        Reservation existing = repo.findById(id).orElseThrow(() -> new NotFoundException("Reservation not found"));

        // Business logic: Cannot update a canceled reservation
        if (!existing.isActive()) throw new BadRequestException("Cannot update a canceled reservation");

        validateDates(req.getCheckIn(), req.getCheckOut());

        existing.setGuestName(req.getGuestName());
        existing.setHotelName(req.getHotelName());
        existing.setCheckIn(req.getCheckIn());
        existing.setCheckOut(req.getCheckOut());

        return repo.save(existing);
    }

    /**
     * Cancels a reservation by setting its status to {@link ReservationStatus#CANCELED}.
     * This is a soft-delete operation.
     * * @param id The ID of the reservation to cancel.
     * @return The updated Reservation object with CANCELED status.
     * @throws NotFoundException if the reservation ID does not exist.
     */
    public Reservation cancel(Long id) {
        Reservation existing = repo.findById(id)
                .orElseThrow(() -> new NotFoundException("Reservation not found"));

        existing.setStatus(ReservationStatus.CANCELED);

        return repo.save(existing);
    }

    /**
     * Internal method to validate check-in and check-out dates.
     * @param in The check-in date.
     * @param out The check-out date.
     * @throws BadRequestException if dates are null, check-out is not after check-in, or dates are in the past.
     */
    private void validateDates(LocalDate in, LocalDate out) {
        if (in == null || out == null) throw new BadRequestException("Dates cannot be null");
        if (!out.isAfter(in)) throw new BadRequestException("Check-out must be after check-in");
        if (in.isBefore(LocalDate.now())) throw new BadRequestException("Check-in must be in the future");
        if (out.isBefore(LocalDate.now())) throw new BadRequestException("Check-out must be in the future");
    }
}
