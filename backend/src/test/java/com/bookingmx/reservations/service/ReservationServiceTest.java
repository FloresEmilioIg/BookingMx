package com.bookingmx.reservations.service;

import com.bookingmx.reservations.dto.ReservationRequest;
import com.bookingmx.reservations.exception.BadRequestException;
import com.bookingmx.reservations.exception.NotFoundException;
import com.bookingmx.reservations.model.Reservation;
import com.bookingmx.reservations.model.ReservationStatus;
import com.bookingmx.reservations.repo.ReservationRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ReservationServiceTest {

    // Mock the dependency (the repository)
    @Mock
    private ReservationRepository mockRepo;

    // Inject the mock into the service being tested
    @InjectMocks
    private ReservationService service;

    private ReservationRequest validRequest;
    private Reservation activeReservation;
    private final LocalDate today = LocalDate.now();
    private final LocalDate futureCheckIn = today.plusDays(5);
    private final LocalDate futureCheckOut = today.plusDays(10);
    private final Long RESERVATION_ID = 1L;

    @BeforeEach
    void setUp() {
        // Setup a common valid request DTO
        validRequest = new ReservationRequest();
        validRequest.setGuestName("John Doe");
        validRequest.setHotelName("Grand Plaza");
        validRequest.setCheckIn(futureCheckIn);
        validRequest.setCheckOut(futureCheckOut);

        // Setup a common active Reservation model object
        activeReservation = new Reservation(
                RESERVATION_ID,
                validRequest.getGuestName(),
                validRequest.getHotelName(),
                validRequest.getCheckIn(),
                validRequest.getCheckOut()
        );
        activeReservation.setStatus(ReservationStatus.ACTIVE);
    }

    // --- POSITIVE SCENARIOS ---

    @Test
    void list_ShouldReturnAllReservations() {
        // Arrange
        List<Reservation> expectedList = List.of(activeReservation);
        when(mockRepo.findAll()).thenReturn(expectedList);

        // Act
        List<Reservation> actualList = service.list();

        // Assert
        assertEquals(1, actualList.size());
        assertEquals(expectedList.get(0).getId(), actualList.get(0).getId());
        verify(mockRepo, times(1)).findAll();
    }

    @Test
    void list_ShouldReturnEmptyListWhenNoReservations() {
        // Arrange
        when(mockRepo.findAll()).thenReturn(Collections.emptyList());

        // Act
        List<Reservation> actualList = service.list();

        // Assert
        assertTrue(actualList.isEmpty());
        verify(mockRepo, times(1)).findAll();
    }

    @Test
    void create_ShouldReturnNewReservation() {
        // Arrange
        // The repository's save method should return the reservation object with an ID
        // Note: The actual ID generation is handled in the real repo, but for the mock, we simulate the return.
        when(mockRepo.save(any(Reservation.class))).thenReturn(activeReservation);

        // Act
        Reservation result = service.create(validRequest);

        // Assert
        assertNotNull(result.getId());
        assertEquals("John Doe", result.getGuestName());
        assertEquals(ReservationStatus.ACTIVE, result.getStatus());
        verify(mockRepo, times(1)).save(any(Reservation.class));
    }

    @Test
    void update_ShouldReturnUpdatedReservation() {
        // Arrange
        ReservationRequest updateRequest = new ReservationRequest();
        updateRequest.setGuestName("Jane Smith"); // New name
        updateRequest.setHotelName("New Hotel");
        updateRequest.setCheckIn(futureCheckIn.plusDays(1)); // New dates
        updateRequest.setCheckOut(futureCheckOut.plusDays(1));

        Reservation updatedReservation = new Reservation(
                RESERVATION_ID, updateRequest.getGuestName(), updateRequest.getHotelName(),
                updateRequest.getCheckIn(), updateRequest.getCheckOut()
        );

        when(mockRepo.findById(RESERVATION_ID)).thenReturn(Optional.of(activeReservation));
        when(mockRepo.save(any(Reservation.class))).thenReturn(updatedReservation);

        // Act
        Reservation result = service.update(RESERVATION_ID, updateRequest);

        // Assert
        assertEquals(RESERVATION_ID, result.getId());
        assertEquals("Jane Smith", result.getGuestName());
        assertEquals(futureCheckIn.plusDays(1), result.getCheckIn());
        verify(mockRepo, times(1)).findById(RESERVATION_ID);
        verify(mockRepo, times(1)).save(any(Reservation.class));
    }

    @Test
    void cancel_ShouldChangeStatusToCanceled() {
        // Arrange
        Reservation canceledReservation = new Reservation(
                RESERVATION_ID, activeReservation.getGuestName(), activeReservation.getHotelName(),
                activeReservation.getCheckIn(), activeReservation.getCheckOut()
        );
        canceledReservation.setStatus(ReservationStatus.CANCELED);

        when(mockRepo.findById(RESERVATION_ID)).thenReturn(Optional.of(activeReservation));
        when(mockRepo.save(any(Reservation.class))).thenReturn(canceledReservation);

        // Act
        Reservation result = service.cancel(RESERVATION_ID);

        // Assert
        assertEquals(RESERVATION_ID, result.getId());
        assertEquals(ReservationStatus.CANCELED, result.getStatus());
        verify(mockRepo, times(1)).findById(RESERVATION_ID);
        verify(mockRepo, times(1)).save(any(Reservation.class));
    }

    // --- NEGATIVE SCENARIOS (Exceptions & Errors) ---

    // Cancellation & Update not found
    @Test
    void update_ShouldThrowNotFoundException_WhenIdDoesNotExist() {
        // Arrange
        when(mockRepo.findById(RESERVATION_ID)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(NotFoundException.class, () -> service.update(RESERVATION_ID, validRequest));
        verify(mockRepo, times(1)).findById(RESERVATION_ID);
        verify(mockRepo, never()).save(any(Reservation.class));
    }

    @Test
    void cancel_ShouldThrowNotFoundException_WhenIdDoesNotExist() {
        // Arrange
        when(mockRepo.findById(RESERVATION_ID)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(NotFoundException.class, () -> service.cancel(RESERVATION_ID));
        verify(mockRepo, times(1)).findById(RESERVATION_ID);
        verify(mockRepo, never()).save(any(Reservation.class));
    }

    // Update canceled reservation
    @Test
    void update_ShouldThrowBadRequestException_WhenReservationIsCanceled() {
        // Arrange
        Reservation canceledReservation = new Reservation(
                RESERVATION_ID, validRequest.getGuestName(), validRequest.getHotelName(),
                validRequest.getCheckIn(), validRequest.getCheckOut()
        );
        canceledReservation.setStatus(ReservationStatus.CANCELED); // Set to CANCELED

        when(mockRepo.findById(RESERVATION_ID)).thenReturn(Optional.of(canceledReservation));

        // Act & Assert
        assertThrows(BadRequestException.class, () -> service.update(RESERVATION_ID, validRequest),
                "Cannot update a canceled reservation");
        verify(mockRepo, times(1)).findById(RESERVATION_ID);
        verify(mockRepo, never()).save(any(Reservation.class));
    }

    // Date validation errors (In ReservationService: validateDates private method)

    @Test
    void create_ShouldThrowBadRequestException_WhenCheckInIsNull() {
        // Arrange
        validRequest.setCheckIn(null);

        // Act & Assert
        assertThrows(BadRequestException.class, () -> service.create(validRequest),
                "Dates cannot be null");
    }

    @Test
    void create_ShouldThrowBadRequestException_WhenCheckOutIsBeforeCheckIn() {
        // Arrange
        LocalDate in = today.plusDays(10);
        LocalDate out = today.plusDays(5); // Out is before In
        validRequest.setCheckIn(in);
        validRequest.setCheckOut(out);

        // Act & Assert
        assertThrows(BadRequestException.class, () -> service.create(validRequest),
                "Check-out must be after check-in");
    }

    @Test
    void create_ShouldThrowBadRequestException_WhenCheckOutIsSameAsCheckIn() {
        // Arrange
        LocalDate date = today.plusDays(5);
        validRequest.setCheckIn(date);
        validRequest.setCheckOut(date); // Out is same as In

        // Act & Assert
        assertThrows(BadRequestException.class, () -> service.create(validRequest),
                "Check-out must be after check-in");
    }

    @Test
    void create_ShouldThrowBadRequestException_WhenCheckInIsInThePast() {
        // Arrange
        LocalDate pastDate = today.minusDays(1);
        validRequest.setCheckIn(pastDate);
        validRequest.setCheckOut(pastDate.plusDays(5));

        // Act & Assert
        assertThrows(BadRequestException.class, () -> service.create(validRequest),
                "Check-in must be in the future");
    }

    @Test
    void create_ShouldThrowBadRequestException_WhenCheckOutIsInThePast() {
        // Arrange
        LocalDate futureIn = today.plusDays(1);
        LocalDate pastOut = today.minusDays(1); // Check-out in the past
        validRequest.setCheckIn(futureIn);
        validRequest.setCheckOut(pastOut);

        // Act & Assert
        assertThrows(BadRequestException.class, () -> service.create(validRequest),
                "Check-out must be in the future");
    }
}
