import { MapTypeId, MouseEvent } from '@agm/core';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Address } from 'ngx-google-places-autocomplete/objects/address';

import { Utils } from '../../../utils/Utils';

@Component({
  templateUrl: './geomap-dialog.component.html',
})
export class GeoMapDialogComponent {
  public mapLatitude: number;
  public mapLongitude: number;
  public markerLatitude: number;
  public markerLongitude: number;
  public markers: [];
  public labelFormatted: any;
  public label = '';
  public zoom = 4;
  public icon = {
    url: '../../../../assets/img/map-pin-18x30.svg', scale: 0.2, labelOrigin: { x: 11, y: -10 },
  };
  public displayOnly = false;
  public dialogTitle: string;
  private map: any;

  constructor(
    protected dialogRef: MatDialogRef<GeoMapDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {
    if (data) {
      if (data.label) {
        this.label = data.label;
      }
      if (data.latitude && data.longitude) { this.zoom = 14; }
      this.mapLatitude = data.latitude ? +data.latitude : 51.476852;
      this.mapLongitude = data.longitude ? +data.longitude : -0.000500;
      this.markerLatitude = data.latitude ? +data.latitude : 51.476852;
      this.markerLongitude = data.longitude ? +data.longitude : -0.000500;
      this.displayOnly = data.displayOnly ? data.displayOnly : false;
      this.dialogTitle = data.dialogTitle ? data.dialogTitle : '';
      this.markers = data.markers ? data.markers : [];
    }
    Utils.registerCloseKeyEvents(this.dialogRef);
  }

  public mapClick(event: MouseEvent) {
    if (event && event.coords) {
      if (event.coords.lat) {
        this.markerLatitude = event.coords.lat;
      }
      if (event.coords.lng) {
        this.markerLongitude = event.coords.lng;
      }
    }
  }

  public mapTypeIdChange(mapTypeId: MapTypeId) {
    switch (mapTypeId) {
      case MapTypeId.HYBRID:
      case MapTypeId.SATELLITE:
        this.labelFormatted = this.label ? { text: this.label, color: 'white', fontWeight: 'bold' } : '';
        break;
      default:
        this.labelFormatted = this.label ? { text: this.label, color: 'black', fontWeight: 'bold' } : '';
    }
  }

  public setAddress(address: Address) {
    // Latitude
    this.markerLatitude = address.geometry.location.lat();
    this.mapLatitude = address.geometry.location.lat();
    // Longitude
    this.markerLongitude = address.geometry.location.lng();
    this.mapLongitude = address.geometry.location.lng();
  }

  public validate() {
    this.dialogRef.close({ latitude: this.markerLatitude, longitude: this.markerLongitude });
  }

  public cancel() {
    this.dialogRef.close();
  }

  public maxZoom() {
    if (this.map) {
      this.map.setCenter({ lat: this.markerLatitude, lng: this.markerLongitude });
      this.map.setZoom(20);
    }
  }

  public minZoom() {
    this.map.setZoom(4);
  }

  public mapReady(map) {
    this.map = map;
    this.map.setTilt(0);
    this.mapTypeIdChange(map.getMapTypeId());
  }

}
