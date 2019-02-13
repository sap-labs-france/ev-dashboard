import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { CentralServerService } from '../../../services/central-server.service';
import { MessageService } from '../../../services/message.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Constants } from '../../../utils/Constants';
import { LocaleService } from '../../../services/locale.service';
import { Address } from 'ngx-google-places-autocomplete/objects/address';


@Component({
  templateUrl: './geomap.dialog.component.html',
  styleUrls: ['./geomap.dialog.component.scss'],
})
export class GeoMapDialogComponent implements OnInit {
  private map: any;
  private mapLatitude: number;
  private mapLongitude: number;
  private markerLatitude: number;
  private markerLongitude: number;
  private zoom = 14;
  private icon = {
    url: '../../../../assets/img/ev_station.svg', scaledSize: { height: 25, width: 25 },
    strokeColor: 'red', scale: 3
  };

  constructor(
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private localeService: LocaleService,
    private translateService: TranslateService,
    private router: Router,
    protected dialogRef: MatDialogRef<GeoMapDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {
    if (data) {
      this.mapLatitude = data.latitude ? +data.latitude : 51.476852;
      this.mapLongitude = data.longitude ? +data.longitude : -0.000500;
      this.markerLatitude = data.latitude ? +data.latitude : 51.476852;
      this.markerLongitude = data.longitude ? +data.longitude : -0.000500;
    }
  }

  ngOnInit(): void {

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
    this.map.setZoom(20);
  }

  minZoom() {
    this.map.setZoom(4);
  }

  mapReady(map) {
    this.map = map;
    this.map.setTilt(0);
  }

}
