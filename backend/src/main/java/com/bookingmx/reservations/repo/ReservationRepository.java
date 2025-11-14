package com.bookingmx.reservations.repo;

import com.bookingmx.reservations.model.Reservation;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.stereotype.Repository;

/**
 * Repository class for managing Reservation objects.
 * This implementation uses an in-memory ConcurrentHashMap for simplicity,
 * acting as a volatile database replacement.
 */
@Repository
public class ReservationRepository {
    // Stores reservations using ID as the key
    private final Map<Long, Reservation> store = new ConcurrentHashMap<>();
    // Atomically generates sequential IDs for new reservations
    private final AtomicLong seq = new AtomicLong(1L);

    /**
     * Finds all reservations currently stored.
     * @return A list of all reservations, sorted by ID.
     */
    public List<Reservation> findAll() {
        return new ArrayList<>(store.values());
    }

    /**
     * Finds a reservation by its unique ID.
     * @param id The ID of the reservation to find.
     * @return An Optional containing the Reservation if found, otherwise empty.
     */
    public Optional<Reservation> findById(Long id) {
        return Optional.ofNullable(store.get(id));
    }

    /**
     * Saves a new reservation or updates an existing one.
     * If the reservation has no ID, a new one is generated using the atomic counter.
     * @param r The reservation object to save.
     * @return The saved or updated reservation object.
     */
    public Reservation save(Reservation r) {
        if (r.getId() == null) r.setId(seq.getAndIncrement());
        store.put(r.getId(), r);
        return r;
    }

    /**
     * Deletes a reservation by its unique ID (removes it from the in-memory store).
     * @param id The ID of the reservation to delete.
     */
    public void delete(Long id) {
        store.remove(id);
    }
}
