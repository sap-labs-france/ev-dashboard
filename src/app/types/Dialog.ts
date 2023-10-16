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
