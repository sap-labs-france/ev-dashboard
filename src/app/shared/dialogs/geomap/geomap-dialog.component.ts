import { Component, Inject, ViewChild } from '@angular/core';
import { GoogleMap } from '@angular/google-maps';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { GeoMapDialogData, GeoMapDialogResult } from 'types/Dialog';

import { Utils } from '../../../utils/Utils';

@Component({
  templateUrl: 'geomap-dialog.component.html',
  styleUrls: ['./geomap-dialog.scss'],
})
export class GeoMapDialogComponent {
  @ViewChild(GoogleMap, { static: false }) public map!: GoogleMap;
  public labelFormatted: google.maps.MarkerLabel = { text: '', color: 'black', fontWeight: 'bold' };
  public marker: google.maps.LatLngLiteral;
  public center: google.maps.LatLngLiteral;
  public mapOptions: google.maps.MapOptions;
  public zoom = 4;
  public icon: google.maps.Icon = {
    url: '../../../../assets/img/map-pin-18x30.svg',
    labelOrigin: { x: 11, y: -10 } as google.maps.Point,
  };
  public displayOnly = false;
  public dialogTitle = '';

  public constructor(
    protected dialogRef: MatDialogRef<GeoMapDialogComponent, GeoMapDialogResult>,
    @Inject(MAT_DIALOG_DATA) data: GeoMapDialogData
  ) {
    if (data) {
      if (data.label) {
        this.labelFormatted.text = data.label;
      }
      if (data.latitude && data.longitude) {
        this.zoom = 14;
      }
      this.center = {
        lat: data.latitude ? +data.latitude : 51.476852,
        lng: data.longitude ? +data.longitude : -0.0005,
      };
      this.mapOptions = {
        zoomControl: true,
      };
      this.marker = {
        lat: data.latitude ? +data.latitude : 51.476852,
        lng: data.longitude ? +data.longitude : -0.0005,
      };
      this.displayOnly = data.displayOnly ?? false;
      this.dialogTitle = data.dialogTitle ?? '';
    }
    Utils.registerCloseKeyEvents(this.dialogRef);
  }

  public mapClick(event: google.maps.MapMouseEvent) {
    if (!this.displayOnly) {
      if (event.latLng) {
        this.marker = event.latLng.toJSON();
      }
    }
  }

  public mapTypeIdChange(mapTypeId: google.maps.MapTypeId) {
    mapTypeId = mapTypeId ?? (this.map.getMapTypeId() as google.maps.MapTypeId);
    // Change the color of the label
    switch (mapTypeId) {
      case google.maps.MapTypeId.HYBRID:
      case google.maps.MapTypeId.SATELLITE:
        this.labelFormatted = { ...this.labelFormatted, color: 'white' };
        break;
      default:
        this.labelFormatted = { ...this.labelFormatted, color: 'black' };
    }
  }

  public setAddress(address: Address) {
    // Set Marker
    this.marker = address.geometry.location.toJSON();
    // Set center
    this.center = address.geometry.location.toJSON();
  }

  public validate() {
    this.dialogRef.close({
      latitude: this.marker.lat,
      longitude: this.marker.lng,
    });
  }

  public cancel() {
    this.dialogRef.close();
  }

  public maxZoom() {
    if (this.map) {
      this.center = {
        lat: this.marker.lat,
        lng: this.marker.lng,
      };
      this.zoom = 20;
    }
  }

  public minZoom() {
    this.zoom = 4;
  }
}
