import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { SpinnerService } from 'app/services/spinner.service';
import { Action, Entity } from 'app/types/Authorization';
import { ChargingStation } from 'app/types/ChargingStation';
import { KeyValue } from 'app/types/GlobalType';
import { HTTPError } from 'app/types/HTTPError';
import { Utils } from 'app/utils/Utils';

import { AuthorizationService } from '../../../services/authorization.service';
import { LocaleService } from '../../../services/locale.service';
import { MessageService } from '../../../services/message.service';
import { ChargingStationOcppParametersComponent } from './ocpp-parameters/charging-station-ocpp-parameters.component';
import { ChargingStationParametersComponent } from './parameters/charging-station-parameters.component';

const CHARGERS_PANE_NAME = 'chargers';

@Component({
  selector: 'app-charging-station',
  templateUrl: 'charging-station.component.html',
})
export class ChargingStationComponent implements OnInit, AfterViewInit {
  @Input() public chargingStationID!: string;
  @Input() public inDialog!: boolean;
  @Input() public dialogRef!: MatDialogRef<any>;

  public chargingStation: ChargingStation;
  public userLocales: KeyValue[];
  public isAdmin!: boolean;

  @ViewChild('chargingStationOcppParameters') public chargingStationOcppParametersComponent!: ChargingStationOcppParametersComponent;
  @ViewChild('chargingStationParameters', { static: true }) public chargingStationParametersComponent!: ChargingStationParametersComponent;

  public isSaveButtonDisabled = true; // by default deactivate
  public isSaveButtonHidden!: boolean; // by default deactivate

  public isPropertiesPaneDisabled = false;
  public isChargerPaneDisabled = false;
  public isOCPPParametersPaneDisabled = false;

  private activePane: string = CHARGERS_PANE_NAME; // Default active pane is charging station pane

  constructor(
    private authorizationService: AuthorizationService,
    private spinnerService: SpinnerService,
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private localeService: LocaleService,
    private dialogService: DialogService,
    private dialog: MatDialog,
    private router: Router) {
    // Get Locales
    this.userLocales = this.localeService.getLocales();
  }

  public ngOnInit() {
    // Load
    this.loadChargingStation();
    // Check auth
    if (!this.authorizationService.canAccess(Entity.CHARGING_STATION, Action.UPDATE)
      && !this.authorizationService.isDemo()) {
      // Not authorized
      this.messageService.showErrorMessage(
        this.translateService.instant('chargers.action_error.not_authorize'));
      this.dialog.closeAll();
    }
  }

  public ngAfterViewInit(): void {
    // Admin?
    this.isAdmin = this.authorizationService.isAdmin() ||
      this.authorizationService.isSiteAdmin(this.chargingStation.siteArea ? this.chargingStation.siteArea.siteID : '');
    this.isSaveButtonHidden = !this.isAdmin;
    // check changes to activate or not save button
    this.chargingStationParametersComponent.formGroup.statusChanges.subscribe(() => {
      if (this.activePane === CHARGERS_PANE_NAME) {
        this.isSaveButtonDisabled = this.chargingStationParametersComponent.formGroup.invalid;
      }
    });
    this.chargingStationParametersComponent.formGroup.valueChanges.subscribe(() => {
      if (this.activePane === CHARGERS_PANE_NAME) {
        this.isSaveButtonDisabled = this.chargingStationParametersComponent.formGroup.invalid;
      }
    });
  }

  public loadChargingStation() {
    if (!this.chargingStationID) {
      return;
    }
    this.spinnerService.show();
    this.centralServerService.getChargingStation(this.chargingStationID).subscribe((chargingStation) => {
      this.spinnerService.hide();
      this.chargingStation = chargingStation;
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case HTTPError.OBJECT_DOES_NOT_EXIST_ERROR:
          this.messageService.showErrorMessage('chargers.charger_not_found');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService,
            this.centralServerService, 'chargers.charger_not_found');
      }
    });
  }

  public save() {
    if (this.activePane === CHARGERS_PANE_NAME) {
      this.chargingStationParametersComponent.saveChargingStation();
    }
  }

  public changeActivePane(paneName: string, isDisabled: boolean) {
    if (isDisabled) {
      this.saveChangesMessage();
      return;
    }
    this.activePane = paneName;
  }

  public saveChangesMessage() {
    this.messageService.showErrorMessage(this.translateService.instant('chargers.unsaved_changes'));
  }

  public closeDialog(saved: boolean = false) {
    if (this.inDialog) {
      this.dialogRef.close(saved);
    }
  }

  public close() {
    Utils.checkAndSaveAndCloseDialog(this.chargingStationParametersComponent.formGroup,
      this.dialogService, this.translateService, this.save.bind(this), this.closeDialog.bind(this));
  }
}
