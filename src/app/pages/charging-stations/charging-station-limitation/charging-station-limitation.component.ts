import { Component, Input, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { StatusCodes } from 'http-status-codes';
import { ChargingStationsAuthorizations } from 'types/Authorization';

import { CentralServerService } from '../../../services/central-server.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { ChargingStation } from '../../../types/ChargingStation';
import { Utils } from '../../../utils/Utils';

@Component({
  selector: 'app-charging-station-limitation',
  templateUrl: 'charging-station-limitation.component.html',
  styleUrls: ['charging-station-limitation.component.scss'],
})
export class ChargingStationLimitationComponent implements OnInit {
  @Input() public chargingStationID!: string;
  @Input() public chargingStationsAuthorizations!: ChargingStationsAuthorizations;
  @Input() public inDialog!: boolean;
  @Input() public dialogRef!: MatDialogRef<any>;

  public chargingStation: ChargingStation;

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    private spinnerService: SpinnerService,
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private router: Router
  ) {}

  public ngOnInit() {
    this.loadChargingStation();
  }

  public close(saved: boolean = false) {
    if (this.inDialog) {
      this.dialogRef.close(saved);
    }
  }

  public loadChargingStation() {
    if (this.chargingStationID) {
      this.spinnerService.show();
      this.centralServerService.getChargingStation(this.chargingStationID).subscribe({
        next: (chargingStation) => {
          this.spinnerService.hide();
          this.chargingStation = chargingStation;
        },
        error: (error) => {
          this.spinnerService.hide();
          switch (error.status) {
            case StatusCodes.NOT_FOUND:
              this.messageService.showErrorMessage('chargers.charger_not_found');
              break;
            default:
              Utils.handleHttpError(
                error,
                this.router,
                this.messageService,
                this.centralServerService,
                'chargers.charger_not_found'
              );
          }
        },
      });
    }
  }
}
