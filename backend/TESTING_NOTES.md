# Testing Notes (Backend)
- Focus JUnit tests on service validations and behaviors (create/update/cancel).
- Coverage report: target/site/jacoco/index.html


### Errors found on initial testing:

1. Mockito Interaction Failures (Wanted but not invoked):\
    Tests like list_ShouldReturnEmptyListWhenNoReservations, \
    create_ShouldReturnNewReservation, \
    and update_ShouldThrowNotFoundException_WhenIdDoesNotExist \
    all failed with this message.
2. Unexpected Behavior Failures (e.g., NotFoundException): \
   Tests like update_ShouldReturnUpdatedReservation and
cancel_ShouldChangeStatusToCanceled failed by throwing a NotFoundException.


Causes:

- Mockito verifies that methods on the mock object (mockRepo) were called. 
  Since the ReservationService is using a real ReservationRepository object instead of the mock, 
  the mock object had zero interactions, 
  causing the verification to fail.
- In the tests made, mock was set up to return a reservation (when(mockRepo.findById(ID)).thenReturn(Optional.of(reservation))). 
  However, since the real repository instance is used, and it starts empty, findById(ID) always returns Optional.empty(), 
  which correctly triggers the orElseThrow(() -> new NotFoundException("Reservation not found")) line in the service code.

### Solutions made because of the testing

- Changed line 17 on ReservationService to have the "= new ReservationRepository()" removed
- Added a constructor for ReservationService calling "ReservationRepository repo"
- Changed ReservationRepository.java to have the @Repository annotation

### Results

Made testing again and no new errors have appeared on the testing made.