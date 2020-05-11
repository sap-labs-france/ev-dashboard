import { Action, Entity } from 'app/types/Authorization';
import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerNotificationService } from '../../../services/central-server-notification.service';
import { CentralServerService } from 'app/services/central-server.service';
import { ChargingStation } from 'app/types/ChargingStation';
import { ChargingStationOcppParametersComponent } from './ocpp-parameters/charging-station-ocpp-parameters.component';
import { ChargingStationParametersComponent } from './parameters/charging-station-parameters.component';
import { ConfigService } from '../../../services/config.service';
import { HTTPError } from 'app/types/HTTPError';
import { KeyValue } from 'app/types/GlobalType';
import { LocaleService } from '../../../services/locale.service';
import { MessageService } from '../../../services/message.service';
import { Router } from '@angular/router';
import { SpinnerService } from 'app/services/spinner.service';
import { TranslateService } from '@ngx-translate/core';
import { Utils } from 'app/utils/Utils';
import { debounceTime } from 'rxjs/operators';

const CHARGERS_PANE_NAME = 'chargers';
const OCPP_PARAMETERS_PANE_NAME = 'ocppParameters';

@Component({
  selector: 'app-charging-station',
  templateUrl: 'charging-station.component.html',
})
export class ChargingStationComponent implements OnInit, AfterViewInit {
  @Input() public chargingStationID!: string;
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
    private centralServerNotificationService: CentralServerNotificationService,
    private spinnerService: SpinnerService,
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private localeService: LocaleService,
    private configService: ConfigService,
    private dialog: MatDialog,
    private router: Router,
    public dialogRef: MatDialogRef<ChargingStationComponent>) {
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
      this.messageService.showErrorMessage(this.translateService.instant('chargers.action_error.not_authorize'));
      this.dialog.closeAll();
    }
    // listen to escape key
    this.dialogRef.keydownEvents().subscribe((keydownEvents) => {
      // check if escape
      if (keydownEvents && keydownEvents.code === 'Escape') {
        this.onClose();
      }
    });
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
        // When we have changes to save we can't navigate to other panes
        // this.isPropertiesPaneDisabled = !this.isSaveButtonDisabled;
        // When we have changes to save we can't navigate to other panes
        // this.isOCPPParametersPaneDisabled = !this.isSaveButtonDisabled;
      }
    });
    this.chargingStationParametersComponent.formGroup.valueChanges.subscribe(() => {
      if (this.activePane === CHARGERS_PANE_NAME) {
        this.isSaveButtonDisabled = this.chargingStationParametersComponent.formGroup.invalid;
        // When we have changes to save we can't navigate to other panes
        // this.isPropertiesPaneDisabled = !this.isSaveButtonDisabled;
        // When we have changes to save we can't navigate to other panes
        // this.isOCPPParametersPaneDisabled = !this.isSaveButtonDisabled;
      }
    });
    this.centralServerNotificationService.getSubjectChargingStation().pipe(debounceTime(
      this.configService.getAdvanced().debounceTimeNotifMillis)).subscribe((singleChangeNotification) => {
      // Update user?
      if (this.chargingStation && singleChangeNotification && singleChangeNotification.data &&
          singleChangeNotification.data.id === this.chargingStation.id) {
        this.dialog.closeAll();
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

  public onClose() {
    this.chargingStationParametersComponent.onClose();
  }
}
