import {Component, Input, OnInit, QueryList} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {AbstractControl, FormControl, FormArray, FormGroup, Validators} from '@angular/forms';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {LocaleService} from '../../../services/locale.service';
import {CentralServerService} from '../../../services/central-server.service';
import {SpinnerService} from '../../../services/spinner.service';
import {AuthorizationService} from '../../../services/authorization-service';
import {MessageService} from '../../../services/message.service';
import {ParentErrorStateMatcher} from '../../../utils/ParentStateMatcher';
import {DialogService} from '../../../services/dialog.service';
import {Constants} from '../../../utils/Constants';
import {Utils} from '../../../utils/Utils';
import { Charger, SiteArea } from '../../../common.types';
import { CONNECTOR_TYPE_MAP } from '../../../shared/formatters/app-connector-type.pipe';
import { SiteAreaDialogComponent } from './site-area.dialog.component';
 
export const CONNECTED_PHASE_MAP =
  [
    {key: 1, description: 'chargers.single_phase'},
    {key: 3, description: 'chargers.tri_phases'}
  ]
@Component({
  selector: 'app-charging-station-cmp',
  templateUrl: 'charging-station.component.html',
  styleUrls: ['../charging-stations-data-source-table.scss']
})
export class ChargingStationComponent implements OnInit {
  public parentErrorStateMatcher = new ParentErrorStateMatcher();
  @Input() currentCharger: Charger;
  private messages;
  public userLocales;
  public isAdmin;
  public connectorTypeMap = CONNECTOR_TYPE_MAP;
  public connectedPhaseMap = CONNECTED_PHASE_MAP;
  
  public formGroup: FormGroup;
  public chargingStationURL: AbstractControl;
  public numberOfConnectedPhase: AbstractControl;
  public cannotChargeInParallel: AbstractControl;
  public maximumPower: AbstractControl;
  public siteArea: AbstractControl;
  public siteAreaID: AbstractControl;

  constructor(
    private authorizationService: AuthorizationService,
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private translateService: TranslateService,
    private localeService: LocaleService,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private router: Router) {

    // Check auth
    if (!authorizationService.canUpdateChargingStation({'id': 'currentCharger.id'})) {
      // Not authorized
      this.router.navigate(['/']);
    }
    // Get translated messages
    this.translateService.get('chargers', {}).subscribe((messages) => {
      this.messages = messages;
    });
    // Get Locales
    this.userLocales = this.localeService.getLocales();
    // Admin?
    this.isAdmin = this.authorizationService.isAdmin() || this.authorizationService.isSuperAdmin();
  }

  ngOnInit() {
    // Init the form
    this.formGroup = new FormGroup({
      'chargingStationURL': new FormControl('',
        Validators.compose([
          Validators.required
        ])),
      'numberOfConnectedPhase': new FormControl('',
        Validators.compose([
          Validators.required
        ])),
      'cannotChargeInParallel': new FormControl(''),
      'maximumPower': new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.min(0),
          Validators.pattern('^[+]?[0-9]*$')
        ])),
        'siteArea': new FormControl(''),
        'siteAreaID': new FormControl('')
    });
    // Form
    this.chargingStationURL = this.formGroup.controls['chargingStationURL'];
    this.numberOfConnectedPhase = this.formGroup.controls['numberOfConnectedPhase'];
    this.cannotChargeInParallel = this.formGroup.controls['cannotChargeInParallel'];
    this.maximumPower = this.formGroup.controls['maximumPower'];
    this.siteArea = this.formGroup.controls['siteArea'];
    this.siteAreaID = this.formGroup.controls['siteAreaID'];

    // add connectors formcontrol
    for (const connector of this.currentCharger.connectors) {
      const connectorTypeId = `connectorType${connector.connectorId}`;
      const connectorMaxPowerId = `connectorMaxPower${connector.connectorId}`;
      this.formGroup.addControl(connectorTypeId, new FormControl(''));
      this.formGroup.addControl(connectorMaxPowerId, new FormControl('',
      Validators.compose([
        Validators.required,
        Validators.min(0),
        Validators.pattern('^[+]?[0-9]*$')
      ])));
    }
    if (this.currentCharger.id) {
      this.loadChargeBoxID();
    }
    // Scroll up
    jQuery('html, body').animate({scrollTop: 0}, {duration: 500});
  }

  public setCurrentChargeBoxID(currentChargeBoxID) {
    this.currentCharger.id = currentChargeBoxID;
  }

  public refresh() {
    // Load User
    this.loadChargeBoxID();
  }

  public loadChargeBoxID() {
    if (!this.currentCharger.id) {
      return;
    }
    // Show spinner
    this.spinnerService.show();
    // Yes, get it
    this.centralServerService.getChargers({ChargeBoxID: this.currentCharger.id, 'WithSite': true}).subscribe((chargerResult) => {
      this.currentCharger = chargerResult.result[0];
      this.formGroup.markAsPristine();
      // Init form
      if (this.currentCharger.chargingStationURL) {
        this.formGroup.controls.chargingStationURL.setValue(this.currentCharger.chargingStationURL);
      }
      if (this.currentCharger.numberOfConnectedPhase) {
        this.formGroup.controls.numberOfConnectedPhase.setValue(this.currentCharger.numberOfConnectedPhase);
      }
      if (this.currentCharger.cannotChargeInParallel) {
        this.formGroup.controls.cannotChargeInParallel.setValue(this.currentCharger.cannotChargeInParallel);
      }
      if (this.currentCharger.maximumPower) {
        this.formGroup.controls.maximumPower.setValue(this.currentCharger.maximumPower);
      }
      if (this.currentCharger.siteArea && this.currentCharger.siteArea.name) {
        this.formGroup.controls.siteArea.setValue(`${(this.currentCharger.siteArea.site ? this.currentCharger.siteArea.site.name + ' - ' : '')}${this.currentCharger.siteArea.name}`);
      } else {
        this.formGroup.controls.siteAreaID.setValue(0);
        this.formGroup.controls.siteArea.setValue(this.translateService.instant('site_areas.unassigned'))
      }
      //update connectors formcontrol
      for (const connector of this.currentCharger.connectors) {
        const connectorTypeId = `connectorType${connector.connectorId}`;
        const connectorMaxPowerId = `connectorMaxPower${connector.connectorId}`;
        this.formGroup.controls[connectorTypeId].setValue(connector.type);
        this.formGroup.controls[connectorMaxPowerId].setValue(connector.power);
      }
      
      this.spinnerService.hide();
    }, (error) => {
      // Hide
      this.spinnerService.hide();
      // Handle error
      switch (error.status) {
        // Not found
        case 550:
          // Transaction not found`
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            this.messages['charger_not_found']);
          break;
        default:
          // Unexpected error`
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            this.translateService.instant('general.unexpected_error_backend'));
      }
    });
  }

  public saveChargeBox(chargeBox) {
    if (this.currentCharger.id) {
// Map dialog inputs to object model
      this.currentCharger.chargingStationURL = chargeBox.chargingStationURL;
      this.currentCharger.maximumPower = chargeBox.maximumPower;
      this.currentCharger.numberOfConnectedPhase = chargeBox.numberOfConnectedPhase;
      this.currentCharger.cannotChargeInParallel = chargeBox.cannotChargeInParallel;
      for (const connector of this.currentCharger.connectors) {
        connector.type = chargeBox[`connectorType${connector.connectorId}`];
        connector.power = chargeBox[`connectorMaxPower${connector.connectorId}`];
      }
      this._updateChargeBoxID(this.currentCharger);
    }
  }

  public assignSiteArea(){
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    if (this.currentCharger) {
      dialogConfig.data = this.currentCharger;
    }
    // Open
    this.dialog.open(SiteAreaDialogComponent, dialogConfig)
            .afterClosed().subscribe((result) => {
      this.currentCharger.siteArea = <SiteArea>result[0];
      this.formGroup.controls.siteArea.setValue(`${(this.currentCharger.siteArea.site ? this.currentCharger.siteArea.site.name + ' - ' : '')}${this.currentCharger.siteArea.name}`);
      this.formGroup.controls.siteArea.markAsDirty();
    });
  }

  private _updateChargeBoxID(chargeBoxID) {
    // Show
    this.spinnerService.show();
    // Yes: Update
    this.centralServerService.updateChargingStationParams(this.currentCharger).subscribe(response => {
      // Hide
      this.spinnerService.hide();
      // Ok?
      if (response.status === Constants.REST_RESPONSE_SUCCESS) {
        // Ok
        this.messageService.showSuccessMessage(this.translateService.instant('chargers.change_config_success', {chargeBoxID: this.currentCharger.id}));
        this.refresh();
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, this.messages['change_config_error']);
      }
    }, (error) => {
      // Hide
      this.spinnerService.hide();
      // Check status
      switch (error.status) {
        case 560:
          // Not Authorized
          this.messageService.showErrorMessage(
            this.translateService.instant('chargers.change_config_error'));
          break;
        case 550:
          // Does not exist
          this.messageService.showErrorMessage(this.messages['change_config_error']);
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            this.messages['change_config_error']);
      }
    });
  }

}
