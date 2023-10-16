import { ReservationStatus, ReservationType } from 'types/Reservation';

export const RESERVATION_STATUSES = [
  { key: ReservationStatus.SCHEDULED, value: 'reservations.state.scheduled' },
  { key: ReservationStatus.DONE, value: 'reservations.state.done' },
  { key: ReservationStatus.INACTIVE, value: 'reservations.state.inactive' },
  { key: ReservationStatus.CANCELLED, value: 'reservations.state.cancelled' },
  { key: ReservationStatus.EXPIRED, value: 'reservations.state.expired' },
  { key: ReservationStatus.IN_PROGRESS, value: 'reservations.state.in_progress' },
  { key: ReservationStatus.UNMET, value: 'reservations.state.unmet' },
];

export const RESERVATION_TYPES = [
  { key: ReservationType.RESERVE_NOW, value: 'reservations.types.reserve_now' },
  { key: ReservationType.PLANNED_RESERVATION, value: 'reservations.types.planned_reservation' },
];
