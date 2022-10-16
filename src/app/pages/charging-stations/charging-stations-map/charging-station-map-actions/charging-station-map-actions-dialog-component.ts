import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MessageService } from 'services/message.service';
import { WindowService } from 'services/window.service';
import { ChargingStation } from 'types/ChargingStation';
import { ChargingStationsMapActionsDialogData } from 'types/Dialog';

import { SpinnerService } from '../../../../services/spinner.service';
import { Utils } from '../../../../utils/Utils';

@Component({
  templateUrl: 'charging-station-map-actions-dialog-component.html',
})
export class ChargingStationsMapActionsDialogComponent {
  public chargingStation: ChargingStation;
  public marker: google.maps.Marker;

  public constructor(
    public spinnerService: SpinnerService,
    private messageService: MessageService,
    private windowService: WindowService,
    private dialogRef: MatDialogRef<ChargingStationsMapActionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: ChargingStationsMapActionsDialogData
  ) {
    this.marker = data.dialogData.marker;
    this.chargingStation = data.dialogData.chargingStation;
    Utils.registerValidateCloseKeyEvents(this.dialogRef,
      null, this.close.bind(this));
  }

  public copyMapURL() {
    this.windowService.copyToClipboard(
      Utils.buildGoogleMapUrlFromCoordinates([this.marker.getPosition().lng(), this.marker.getPosition().lat()])
    );
    this.messageService.showInfoMessage('general.url_copied');
  }

  public navigateToChargingStation() {
    this.windowService.openUrl(
      this.windowService.buildFullUrl(`charging-stations#all?Search=${this.chargingStation.id}`));
  }

  public close() {
    this.dialogRef.close();
  }
}
