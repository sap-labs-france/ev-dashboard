import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { CentralServerService } from '../../../services/central-server.service';
import { MessageService } from '../../../services/message.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { LocaleService } from '../../../services/locale.service';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import {} from '@agm/core'

@Component({
  templateUrl: './geomap.dialog.component.html'
})
export class GeoMapDialogComponent {
  private map: any;
  public mapLatitude: number;
  public mapLongitude: number;
  public markerLatitude: number;
  public markerLongitude: number;
  public markers: [];
  public labelFormatted: any;
  public label = '';
  public zoom = 4;
  public icon = {
    url: '../../../../assets/img/map-pin-18x30.svg', scale: 0.2, labelOrigin: { x: 11, y: -10 }
  };
  public displayOnly = false;
  public dialogTitle: string;

  constructor(
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private localeService: LocaleService,
    private translateService: TranslateService,
    private router: Router,
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
    // listen to keystroke
    this.dialogRef.keydownEvents().subscribe((keydownEvents) => {
      // check if escape
      if (keydownEvents && keydownEvents.code === 'Escape') {
        this.cancel();
      }
    });
  }

  mapClick(event) {
    if (event && event.coords) {
      if (event.coords.lat) {
        this.markerLatitude = event.coords.lat;
      }
      if (event.coords.lng) {
        this.markerLongitude = event.coords.lng;
      }
    }
  }

  mapTypeIdChange(event) {
    switch (event) {
      case 'hybrid':
        this.labelFormatted = { text: this.label, color: 'white', fontWeight: 'bold' };
        break;
      case 'satellite':
        this.labelFormatted = { text: this.label, color: 'white', fontWeight: 'bold' };
        break;
      default:
        this.labelFormatted = { text: this.label, color: 'black', fontWeight: 'bold' };
    }
  }

  setAddress(address: Address) {
    // Latitude
    this.markerLatitude = address.geometry.location.lat();
    this.mapLatitude = address.geometry.location.lat();
    // Longitude
    this.markerLongitude = address.geometry.location.lng();
    this.mapLongitude = address.geometry.location.lng();
  }

  validate() {
    this.dialogRef.close({ latitude: this.markerLatitude, longitude: this.markerLongitude });
  }

  cancel() {
    this.dialogRef.close();
  }

  maxZoom() {
    if (this.map) {
      this.map.setCenter({ lat: this.markerLatitude, lng: this.markerLongitude });
      this.map.setZoom(20);
    }
  }

  minZoom() {
    this.map.setZoom(4);
  }

  mapReady(map) {
    this.map = map;
    this.map.setTilt(0);
    this.mapTypeIdChange(map.getMapTypeId());
  }

}
