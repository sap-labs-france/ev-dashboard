import { ChargingStation } from './ChargingStation';
import { Transaction } from './Transaction';
import { User } from './User';

export interface ErrorMessage {
  title: string;
  titleParameters: any;
  description: string;
  descriptionParameters: any;
  action: string;
  actionParameters: any;
}

export interface InError {
  errorCode?: string;
  errorMessage?: ErrorMessage;
}

export interface UserInError extends User, InError {
}

export interface ChargingStationInError extends ChargingStation, InError {
}

export interface TransactionInError extends Transaction, InError {
}
