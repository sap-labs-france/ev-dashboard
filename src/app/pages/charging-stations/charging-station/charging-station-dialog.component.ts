import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Action, Entity } from 'app/types/Authorization';
import { ChargingStation } from 'app/types/ChargingStation';
import { KeyValue } from 'app/types/GlobalType';
import { debounceTime } from 'rxjs/operators';
import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerNotificationService } from '../../../services/central-server-notification.service';
import { ConfigService } from '../../../services/config.service';
import { LocaleService } from '../../../services/locale.service';
import { MessageService } from '../../../services/message.service';
import { ChargingStationOcppParametersComponent } from './ocpp-parameters/charging-station-ocpp-parameters.component';
import { ChargingStationParametersComponent } from './parameters/charging-station-parameters.component';

const CHARGERS_PANE_NAME = 'chargers';
const OCPP_PARAMETERS_PANE_NAME = 'ocppParameters';

@Component({
  selector: 'app-charging-station',
  templateUrl: 'charging-station-dialog.component.html',
})
export class ChargingStationDialogComponent implements OnInit, AfterViewInit {
  @Input() public currentCharger!: ChargingStation;
  public userLocales: KeyValue[];
  public isAdmin!: boolean;

  @ViewChild('ocppParameters') public ocppParametersComponent!: ChargingStationOcppParametersComponent;
  @ViewChild('chargerParameters', { static: true }) public chargerParametersComponent!: ChargingStationParametersComponent;

  public isSaveButtonDisabled = true; // by default deactivate
  public isSaveButtonHidden!: boolean; // by default deactivate

  public isPropertiesPaneDisabled = false;
  public isChargerPaneDisabled = false;
  public isOCPPParametersPaneDisabled = false;

  private activePane: string = CHARGERS_PANE_NAME; // Default active pane is charging station pane

  constructor(
    private authorizationService: AuthorizationService,
    private centralServerNotificationService: CentralServerNotificationService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private localeService: LocaleService,
    private configService: ConfigService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<ChargingStationDialogComponent>) {

    // Get Locales
    this.userLocales = this.localeService.getLocales();
  }

  public ngOnInit() {
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
      this.authorizationService.isSiteAdmin(this.currentCharger.siteArea ? this.currentCharger.siteArea.siteID : '');
    this.isSaveButtonHidden = !this.isAdmin;
    // check changes to activate or not save button
    this.chargerParametersComponent.formGroup.statusChanges.subscribe(() => {
      if (this.activePane === CHARGERS_PANE_NAME) {
        this.isSaveButtonDisabled = this.chargerParametersComponent.formGroup.invalid;
        // When we have changes to save we can't navigate to other panes
        // this.isPropertiesPaneDisabled = !this.isSaveButtonDisabled;
        // When we have changes to save we can't navigate to other panes
        // this.isOCPPParametersPaneDisabled = !this.isSaveButtonDisabled;
      }
    });
    this.chargerParametersComponent.formGroup.valueChanges.subscribe(() => {
      if (this.activePane === CHARGERS_PANE_NAME) {
        this.isSaveButtonDisabled = this.chargerParametersComponent.formGroup.invalid;
        // When we have changes to save we can't navigate to other panes
        // this.isPropertiesPaneDisabled = !this.isSaveButtonDisabled;
        // When we have changes to save we can't navigate to other panes
        // this.isOCPPParametersPaneDisabled = !this.isSaveButtonDisabled;
      }
    });
    this.centralServerNotificationService.getSubjectChargingStation().pipe(debounceTime(
      this.configService.getAdvanced().debounceTimeNotifMillis)).subscribe((singleChangeNotification) => {
      // Update user?
      if (this.currentCharger && singleChangeNotification && singleChangeNotification.data
        && singleChangeNotification.data.id === this.currentCharger.id) {
        this.refresh();
      }
    });
  }

  public refresh() {
    if (this.activePane === CHARGERS_PANE_NAME) {
      this.chargerParametersComponent.refresh();
    } else if (this.activePane === OCPP_PARAMETERS_PANE_NAME) {
      this.ocppParametersComponent.refresh();
    }
  }

  public save() {
    if (this.activePane === CHARGERS_PANE_NAME) {
      this.chargerParametersComponent.saveChargeBox();
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
    this.chargerParametersComponent.onClose();
  }
}
