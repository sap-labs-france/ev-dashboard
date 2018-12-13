import {Component,Input,OnInit,ViewChild,AfterViewInit} from '@angular/core';
import {Router} from '@angular/router';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {LocaleService} from '../../../services/locale.service';
import {AuthorizationService} from '../../../services/authorization-service';
import {MessageService} from '../../../services/message.service';
import {ParentErrorStateMatcher} from '../../../utils/ParentStateMatcher';
import {DialogService} from '../../../services/dialog.service';
import {Constants} from '../../../utils/Constants';
import {Charger} from '../../../common.types';
import {ChargingStationOCPPConfigurationComponent} from "./ocpp-parameters/charging-station-ocpp-parameters.component";
import {ChargingStationParametersComponent} from './charger-parameters/charging-station-parameters.component';

const CHARGERS_PANE_NAME = 'chargers';
const PROPERTIES_PANE_NAME = 'properties';
const OCPPPARAMETERS_PANE_NAME = 'ocppParameters';

@Component({
  selector: 'app-charging-station-cmp',
  templateUrl: 'charging-station.component.html',
  styleUrls: ['../charging-stations-data-source-table.scss']
})
export class ChargingStationComponent implements OnInit, AfterViewInit {
  public parentErrorStateMatcher = new ParentErrorStateMatcher();
  @Input() currentCharger: Charger;
  public userLocales;
  public isAdmin;

  private activePane: string = CHARGERS_PANE_NAME; //default active pane is charging station pane

  @ViewChild('occpParameters') occpParametersComponent: ChargingStationOCPPConfigurationComponent;
  @ViewChild('chargerParameters') chargerParametersComponent: ChargingStationParametersComponent;

  public isSaveButtonDisabled: boolean = true; // by default deactivate
  public isSaveButtonHidden: boolean; // by default deactivate

  public isPropertiesPaneDisabled: boolean = false;
  public isChargerPaneDisabled: boolean = false;
  public isOCPPParametersPaneDisabled: boolean = false;

  constructor(
    private authorizationService: AuthorizationService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private localeService: LocaleService,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private router: Router) {

    // Check auth
    if (!authorizationService.canUpdateChargingStation({
        'id': 'currentCharger.id'
      })) {
      // Not authorized
      this.router.navigate(['/']);
    }
    // Get Locales
    this.userLocales = this.localeService.getLocales();
    // Admin?
    this.isAdmin = this.authorizationService.isAdmin() || this.authorizationService.isSuperAdmin();
    this.isSaveButtonHidden = !this.isAdmin;
  }

  ngOnInit() {
    // Scroll up
    jQuery('html, body').animate({
      scrollTop: 0
    }, {
      duration: 500
    });
  }

  ngAfterViewInit(): void {

    // check changes to activate or not save button
    this.chargerParametersComponent.formGroup.statusChanges.subscribe(() => {
      if (this.activePane === CHARGERS_PANE_NAME) {
        this.isSaveButtonDisabled = this.chargerParametersComponent.formGroup.pristine || this.chargerParametersComponent.formGroup.invalid;
        this.isPropertiesPaneDisabled = !this.isSaveButtonDisabled; // When we have changes to save we can't navigate to other panes
        this.isOCPPParametersPaneDisabled = !this.isSaveButtonDisabled; // When we have changes to save we can't navigate to other panes
      }
    });
    this.chargerParametersComponent.formGroup.valueChanges.subscribe(() => {
      if (this.activePane === CHARGERS_PANE_NAME) {
        this.isSaveButtonDisabled = this.chargerParametersComponent.formGroup.pristine || this.chargerParametersComponent.formGroup.invalid;
        this.isPropertiesPaneDisabled = !this.isSaveButtonDisabled; // When we have changes to save we can't navigate to other panes
        this.isOCPPParametersPaneDisabled = !this.isSaveButtonDisabled; // When we have changes to save we can't navigate to other panes
      }
    });
    this.occpParametersComponent.formGroup.statusChanges.subscribe(() => {
      if (this.activePane === OCPPPARAMETERS_PANE_NAME) {
        this.isPropertiesPaneDisabled = this.occpParametersComponent.formGroup.dirty; // When we have changes to save we can't navigate to other panes
        this.isChargerPaneDisabled = this.occpParametersComponent.formGroup.dirty; // When we have changes to save we can't navigate to other panes
      }
    });
    this.occpParametersComponent.formGroup.valueChanges.subscribe(() => {
      if (this.activePane === OCPPPARAMETERS_PANE_NAME) {
        this.isPropertiesPaneDisabled = this.occpParametersComponent.formGroup.dirty; // When we have changes to save we can't navigate to other panes
        this.isChargerPaneDisabled = this.occpParametersComponent.formGroup.dirty; // When we have changes to save we can't navigate to other panes
      }
    });
  }

  public refresh() {
    if (this.activePane === CHARGERS_PANE_NAME) {
      this.chargerParametersComponent.refresh();
    } else if (this.activePane === OCPPPARAMETERS_PANE_NAME) {
      this.occpParametersComponent.refresh();
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
      default:
        break;
    }
  }

  changeActivePane(paneName: string, isDisabled: boolean) {
    if (isDisabled) {
      this.saveChangesMessage();
      return;
    }
    this.activePane = paneName;
    this.isSaveButtonHidden = this.activePane !== CHARGERS_PANE_NAME && this.isSaveButtonDisabled;
  }

  public saveChangesMessage() {
    this.messageService.showErrorMessage(this.translateService.instant('chargers.unsaved_changes'))
  }

}