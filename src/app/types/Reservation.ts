import { ReservationsAuthorizationActions } from './Authorization';
import { Car } from './Car';
import { ChargingStation, Connector } from './ChargingStation';
import CreatedUpdatedProps from './CreatedUpdatedProps';
import { TableData } from './Table';
import { Tag } from './Tag';
import { User } from './User';

export interface Reservation
  extends TableData,
  CreatedUpdatedProps,
  ReservationsAuthorizationActions {
  id: number;
  chargingStationID: string;
  chargingStation?: ChargingStation;
  connectorID: number;
  connector?: Connector;
  expiryDate: Date;
  fromDate?: Date;
  toDate?: Date;
  arrivalTime?: Date;
  departureTime?: Date;
  idTag?: string;
  visualTagID?: string;
  tag?: Tag;
  carID?: string;
  car?: Car;
  parentIdTag?: string;
  parentTag?: Tag;
  userID?: string;
  status?: ReservationStatusEnum;
  type?: ReservationType;
}

export interface ReserveNow {
  reservationId?: number;
  connectorId: number;
  expiryDate: Date;
  idTag?: string;
  visualTagID?: string;
  parentIdTag?: string;
}

export enum ReservationButtonAction {
  VIEW_RESERVATION = 'view_reservation',
  EDIT_RESERVATION = 'edit_reservation',
  CREATE_RESERVATION = 'create_reservation',
  CANCEL_RESERVATION = 'cancel_reservation',
  EXPORT_RESERVATIONS = 'export_reservations',
  DELETE_RESERVATION = 'delete_reservation',
  DELETE_RESERVATIONS = 'delete_reservations',
}

export interface ReserveNowDialogData extends TableData {
  chargingStation: ChargingStation;
  connector: Connector;
  expiryDate: Date;
  reservationId?: number;
}

export interface CancelReservationDialogData extends TableData {
  chargingStation: ChargingStation;
  connector: Connector;
  user: User;
}

export enum ReservationStatus {
  DONE = 'reservation_done',
  SCHEDULED = 'reservation_scheduled',
  IN_PROGRESS = 'reservation_in_progress',
  CANCELLED = 'reservation_cancelled',
  INACTIVE = 'reservation_inactive',
  EXPIRED = 'reservation_expired',
  UNMET = 'reservation_unmet',
}

export enum ReservationType {
  PLANNED_RESERVATION = 'planned_reservation',
  RESERVE_NOW = 'reserve_now',
}

// export const ReservationStatusEnum = { ...ReservationStatus };
export type ReservationStatusEnum = ReservationStatus;

export type ReservationStatusTransition = Readonly<{
  from?: ReservationStatusEnum;
  to: ReservationStatusEnum;
}>;

export interface CreateReservationDialogData extends TableData {
  chargingStation: ChargingStation;
  connector: Connector;
}
