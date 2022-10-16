import { ChargingStation } from "./ChargingStation";

export interface GeoMapDialogData {
  label: string;
  longitude: number;
  latitude: number;
  displayOnly?: boolean;
  dialogTitle: string;
}

export interface GeoMapDialogResult {
  latitude: number;
  longitude: number;
}

export interface ChargingStationsMapActionsDialogData {
  dialogData: {
    marker: google.maps.Marker;
    chargingStation: ChargingStation;
  };
}

export interface ChargingStationsMapActionsDialogResult {
}
