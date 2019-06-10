import { Component, Input, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { LocaleService } from '../../../services/locale.service';
import { AuthorizationService } from '../../../services/authorization-service';
import { MessageService } from '../../../services/message.service';
import { ParentErrorStateMatcher } from '../../../utils/ParentStateMatcher';
import { Charger } from '../../../common.types';
import { ChargingStationOCPPConfigurationComponent } from './ocpp-parameters/charging-station-ocpp-parameters.component';
import { ChargingStationParametersComponent } from './charger-parameters/charging-station-parameters.component';

const CHARGERS_PANE_NAME = 'chargers';
const OCPP_PARAMETERS_PANE_NAME = 'ocppParameters';

@Component({
  selector: 'app-charging-station-cmp',
  templateUrl: 'charging-station.component.html'
})
export class ChargingStationComponent implements OnInit, AfterViewInit {
  public parentErrorStateMatcher = new ParentErrorStateMatcher();
  @Input() currentCharger: Charger;
  public userLocales;
  public isAdmin;

  private activePane: string = CHARGERS_PANE_NAME; // Default active pane is charging station pane

  @ViewChild('ocppParameters', { static: false }) ocppParametersComponent: ChargingStationOCPPConfigurationComponent;
  @ViewChild('chargerParameters', { static: true }) chargerParametersComponent: ChargingStationParametersComponent;

  public isSaveButtonDisabled = true; // by default deactivate
  public isSaveButtonHidden: boolean; // by default deactivate

  public isPropertiesPaneDisabled = false;
  public isChargerPaneDisabled = false;
  public isOCPPParametersPaneDisabled = false;

  constructor(
    private authorizationService: AuthorizationService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private localeService: LocaleService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<ChargingStationComponent>,
    private router: Router) {

    // Get Locales
    this.userLocales = this.localeService.getLocales();
    // Admin?
    this.isAdmin = this.authorizationService.isAdmin();
    this.isSaveButtonHidden = !this.isAdmin;
  }

  ngOnInit() {
      // Check auth
    if (!this.authorizationService.canUpdateChargingStation({
      'id': 'currentCharger.id'
    }) && !this.authorizationService.isDemo()) {
      // Not authorized
      this.messageService.showErrorMessage(this.translateService.instant('chargers.action_error.not_authorize'));
      this.dialog.closeAll();
      setTimeout(() => this.router.navigate(['/']), 1000);
    }

    // listen to escape key
    this.dialogRef.keydownEvents().subscribe((keydownEvents) => {
      // check if escape
      if (keydownEvents && keydownEvents.code === 'Escape') {
        this.onClose();
      }
    });
  }

  ngAfterViewInit(): void {

    // check changes to activate or not save button
    this.chargerParametersComponent.formGroup.statusChanges.subscribe(() => {
      if (this.activePane === CHARGERS_PANE_NAME) {
        this.isSaveButtonDisabled = this.chargerParametersComponent.formGroup.pristine || this.chargerParametersComponent.formGroup.invalid;
        // When we have changes to save we can't navigate to other panes
        // this.isPropertiesPaneDisabled = !this.isSaveButtonDisabled;
        // When we have changes to save we can't navigate to other panes
        // this.isOCPPParametersPaneDisabled = !this.isSaveButtonDisabled;
      }
    });
    this.chargerParametersComponent.formGroup.valueChanges.subscribe(() => {
      if (this.activePane === CHARGERS_PANE_NAME) {
        this.isSaveButtonDisabled = this.chargerParametersComponent.formGroup.pristine || this.chargerParametersComponent.formGroup.invalid;
        // When we have changes to save we can't navigate to other panes
        // this.isPropertiesPaneDisabled = !this.isSaveButtonDisabled;
        // When we have changes to save we can't navigate to other panes
        // this.isOCPPParametersPaneDisabled = !this.isSaveButtonDisabled;
      }
    });
    if (this.ocppParametersComponent) {
      this.ocppParametersComponent.formGroup.statusChanges.subscribe(() => {
        if (this.activePane === OCPP_PARAMETERS_PANE_NAME) {
          // When we have changes to save we can't navigate to other panes
          // this.isPropertiesPaneDisabled = this.ocppParametersComponent.formGroup.dirty;
          // When we have changes to save we can't navigate to other panes
          // this.isChargerPaneDisabled = this.ocppParametersComponent.formGroup.dirty;
        }
      });
      this.ocppParametersComponent.formGroup.valueChanges.subscribe(() => {
        if (this.activePane === OCPP_PARAMETERS_PANE_NAME) {
          // When we have changes to save we can't navigate to other panes
          // this.isPropertiesPaneDisabled = this.ocppParametersComponent.formGroup.dirty;
          // When we have changes to save we can't navigate to other panes
          // this.isChargerPaneDisabled = this.ocppParametersComponent.formGroup.dirty;
        }
      });
    }
  }

  public refresh() {
    if (this.activePane === CHARGERS_PANE_NAME) {
      this.chargerParametersComponent.refresh();
    } else if (this.activePane === OCPP_PARAMETERS_PANE_NAME) {
      this.ocppParametersComponent.refresh();
    }
  }

  /**
   * save
   */
  public save() {
    switch (this.activePane) {
      case CHARGERS_PANE_NAME:
        this.chargerParametersComponent.saveChargeBox();
        break;
    }
  }

  changeActivePane(paneName: string, isDisabled: boolean) {
    if (isDisabled) {
      this.saveChangesMessage();
      return;
    }
    this.activePane = paneName;
    // this.isSaveButtonHidden = /*this.activePane !== CHARGERS_PANE_NAME &&*/ this.isSaveButtonDisabled;
  }

  public saveChangesMessage() {
    this.messageService.showErrorMessage(this.translateService.instant('chargers.unsaved_changes'))
  }

  public onClose() {
    this.chargerParametersComponent.onClose();
  }

}
