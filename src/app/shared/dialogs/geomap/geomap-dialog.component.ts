import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { GoogleMap } from '@angular/google-maps';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Address } from 'ngx-google-places-autocomplete/objects/address';

import { Utils } from '../../../utils/Utils';

@Component({
  templateUrl: 'geomap-dialog.component.html',
})

export class GeoMapDialogComponent {
  @ViewChild(GoogleMap, { static: false }) public map!: GoogleMap;
  public markerPosition: { markerLatitude: number; markerLongitude: number };
  public markers: [];
  public labelFormatted = {};
  public label = '';
  public center;
  public mapOptions: google.maps.MapOptions;
  public marker: google.maps.Marker = new google.maps.Marker();
  public zoom = 4;
  public icon = {
    url: '../../../../assets/img/map-pin-18x30.svg', scale: 0.2, labelOrigin: { x: 11, y: -10 },
  };
  public displayOnly = false;
  public dialogTitle: string;


  public constructor(
    protected dialogRef: MatDialogRef<GeoMapDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {
    if (data) {
      if (data.label) {
        this.label = data.label;
        this.labelFormatted = { text: this.label, color: 'black', fontWeight: 'bold' };
      }
      if (data.latitude && data.longitude) {
        this.zoom = 14;
      }
      this.center = { lat: data.latitude ? +data.latitude : 51.476852, lng: data.longitude ? +data.longitude : -0.000500 };
      this.mapOptions = {
        zoomControl: false
      };
      this.marker.setPosition({ lat: data.latitude ? +data.latitude : 51.476852, lng: data.longitude ? +data.longitude : -0.000500 });
      this.displayOnly = data.displayOnly ? data.displayOnly : false;
      this.dialogTitle = data.dialogTitle ? data.dialogTitle : '';
      this.markers = data.markers ? data.markers : [];
    }
    Utils.registerCloseKeyEvents(this.dialogRef);
  }

  public mapClick(event: google.maps.MapMouseEvent) {
    if (!this.displayOnly) {
      if (event.latLng) {
        this.marker.setPosition(event.latLng);
      }
    }
  }

  public mapTypeIdChange(mapTypeId: google.maps.MapTypeId) {
    mapTypeId = mapTypeId ?? this.map.getMapTypeId() as google.maps.MapTypeId;
    switch (mapTypeId) {
      case google.maps.MapTypeId.HYBRID:
      case google.maps.MapTypeId.SATELLITE:
        this.labelFormatted = this.label ? { text: this.label, color: 'white', fontWeight: 'bold' } : '';
        break;
      default:
        this.labelFormatted = this.label ? { text: this.label, color: 'black', fontWeight: 'bold' } : '';
    }
  }

  public setAddress(address: Address) {
    // Set Marker
    this.marker.setPosition(address.geometry.location);
    // Set center
    this.center = address.geometry.location;
  }

  public validate() {
    this.dialogRef.close({ latitude: this.marker.getPosition().toJSON().lat, longitude: this.marker.getPosition().toJSON().lng });
  }

  public cancel() {
    this.dialogRef.close();
  }

  public maxZoom() {
    if (this.map) {
      this.center = Utils.cloneObject(this.marker.getPosition());
      this.zoom = 20;
    }
  }

  public minZoom() {
    this.zoom = 4;
  }
}
