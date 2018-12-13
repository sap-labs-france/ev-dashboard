import {Component, Input, OnInit, Injectable, ViewChildren, QueryList, ElementRef} from '@angular/core';
import {Charger, SiteArea} from '../../../../common.types';
import {LocaleService} from '../../../../services/locale.service';
import {Router} from '@angular/router';
import {FormGroup, FormControl, AbstractControl, Validators} from '@angular/forms';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {CentralServerService} from '../../../../services/central-server.service';
import {SpinnerService} from '../../../../services/spinner.service';
import {AuthorizationService} from '../../../../services/authorization-service';
import {MessageService} from '../../../../services/message.service';
import {Utils} from '../../../../utils/Utils';
import { CONNECTOR_TYPE_MAP } from '../../../../shared/formatters/app-connector-type.pipe';
import { SiteAreaDialogComponent } from '../site-area/site-area.dialog.component';
import {Constants} from '../../../../utils/Constants';

export const CONNECTED_PHASE_MAP =
  [
    {key: 1, description: 'chargers.single_phase'},
    {key: 3, description: 'chargers.tri_phases'}
  ]

@Component({
  selector: 'app-charging-station-parameters',
  styleUrls: ['../../charging-stations-data-source-table.scss', '../../../../shared/table/table.component.scss'],
  templateUrl: './charging-station-parameters.html'
})
@Injectable()
export class ChargingStationParametersComponent implements OnInit {
  @Input() charger: Charger;
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
    private dialog: MatDialog,
    private router: Router) {

    // Check auth
    if (!authorizationService.canUpdateChargingStation({'id': 'charger.id'})) {
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
    this.formGroup = new FormGroup({});
  }

  ngOnInit(): void {
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
    
        if (!this.isAdmin) {
          this.cannotChargeInParallel.disable();
          this.cannotChargeInParallel.disable();
          this.chargingStationURL.disable();
          this.numberOfConnectedPhase.disable();
          this.maximumPower.disable();
        }
    
        // add connectors formcontrol
        for (const connector of this.charger.connectors) {
          const connectorTypeId = `connectorType${connector.connectorId}`;
          const connectorMaxPowerId = `connectorMaxPower${connector.connectorId}`;
          this.formGroup.addControl(connectorTypeId, new FormControl(''));
          this.formGroup.addControl(connectorMaxPowerId, new FormControl('',
          Validators.compose([
            Validators.required,
            Validators.min(0),
            Validators.pattern('^[+]?[0-9]*$')
          ])));
          if (!this.isAdmin) {
            this.formGroup.controls[connectorTypeId].disable();
            this.formGroup.controls[connectorMaxPowerId].disable();
          }
        }
        if (this.charger.id) {
          this.loadChargeBoxID();
        }
  }

  /**
   * refresh
   */
  public refresh() {
    this.loadChargeBoxID();
  }

  public loadChargeBoxID() {
    if (!this.charger.id) {
      return;
    }
    // Show spinner
    this.spinnerService.show();
    // Yes, get it
    this.centralServerService.getChargers({ChargeBoxID: this.charger.id, 'WithSite': true}).subscribe((chargerResult) => {
      this.charger = chargerResult.result[0];
      this.formGroup.markAsPristine();
      // Init form
      if (this.charger.chargingStationURL) {
        this.formGroup.controls.chargingStationURL.setValue(this.charger.chargingStationURL);
      }
      if (this.charger.numberOfConnectedPhase) {
        this.formGroup.controls.numberOfConnectedPhase.setValue(this.charger.numberOfConnectedPhase);
      }
      if (this.charger.cannotChargeInParallel) {
        this.formGroup.controls.cannotChargeInParallel.setValue(this.charger.cannotChargeInParallel);
      }
      if (this.charger.maximumPower) {
        this.formGroup.controls.maximumPower.setValue(this.charger.maximumPower);
      }
      if (this.charger.siteArea && this.charger.siteArea.name) {
        this.formGroup.controls.siteArea.setValue(`${(this.charger.siteArea.site ? this.charger.siteArea.site.name + ' - ' : '')}${this.charger.siteArea.name}`);
      } else {
        this.formGroup.controls.siteAreaID.setValue(0);
        this.formGroup.controls.siteArea.setValue(this.translateService.instant('site_areas.unassigned'))
      }
      //update connectors formcontrol
      for (const connector of this.charger.connectors) {
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

  public saveChargeBox() {
    if (this.charger.id) {
// Map dialog inputs to object model
      this.charger.chargingStationURL = this.chargingStationURL.value;
      this.charger.maximumPower = this.maximumPower.value;
      this.charger.numberOfConnectedPhase = this.numberOfConnectedPhase.value;
      this.charger.cannotChargeInParallel = this.cannotChargeInParallel.value;
      for (const connector of this.charger.connectors) {
        connector.type = this.formGroup.controls[`connectorType${connector.connectorId}`].value;
        connector.power = this.formGroup.controls[`connectorMaxPower${connector.connectorId}`].value;
      }
      this._updateChargeBoxID();
    }
  }

  public assignSiteArea(){
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    if (this.charger) {
      dialogConfig.data = this.charger;
    }
    // Open
    this.dialog.open(SiteAreaDialogComponent, dialogConfig)
            .afterClosed().subscribe((result) => {
      this.charger.siteArea = <SiteArea>result[0];
      this.formGroup.controls.siteArea.setValue(`${(this.charger.siteArea.site ? this.charger.siteArea.site.name + ' - ' : '')}${this.charger.siteArea.name}`);
      this.formGroup.controls.siteArea.markAsDirty();
    });
  }

  private _updateChargeBoxID() {
    // Show
    this.spinnerService.show();
    // Yes: Update
    this.centralServerService.updateChargingStationParams(this.charger).subscribe(response => {
      // Hide
      this.spinnerService.hide();
      // Ok?
      if (response.status === Constants.REST_RESPONSE_SUCCESS) {
        // Ok
        this.messageService.showSuccessMessage(this.translateService.instant('chargers.change_config_success', {chargeBoxID: this.charger.id}));
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
