import {Component, Input, OnInit, QueryList} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import 'rxjs/add/operator/mergeMap';
import {LocaleService} from '../../../services/locale.service';
import {CentralServerService} from '../../../services/central-server.service';
import {SpinnerService} from '../../../services/spinner.service';
import {AuthorizationService} from '../../../services/authorization-service';
import {MessageService} from '../../../services/message.service';
import {ParentErrorStateMatcher} from '../../../utils/ParentStateMatcher';
import {DialogService} from '../../../services/dialog.service';
import {Constants} from '../../../utils/Constants';
import {Utils} from '../../../utils/Utils';
import { Charger, Connector } from "../../../common.types";

@Component({
  selector: 'app-charging-station-cmp',
  templateUrl: 'charging-station.component.html'
})
export class ChargingStationComponent implements OnInit {
  public parentErrorStateMatcher = new ParentErrorStateMatcher();
  public currentCharger: Charger;
  @Input() currentChargeBoxID: string;
  @Input() inDialog: boolean;
  private messages;
  public userLocales;
  public isAdmin;
  
  public formGroup: FormGroup;
  public chargeBoxID: AbstractControl;
  public inputURL: AbstractControl;
  public numberOfConnectedPhase: AbstractControl;
  public canChargeInParallel: AbstractControl;
  public connectors: FormGroup;
  public connector: QueryList<AbstractControl>;

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
    if (this.activatedRoute.snapshot.params['currentChargeBoxID'] &&
      !authorizationService.canUpdateChargingStation({'id': this.activatedRoute.snapshot.params['currentChargeBoxID']})) {
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
      'chargeBoxID': new FormControl(''),
      'inputURL': new FormControl('',
        Validators.compose([
          Validators.required
        ])),
      'numberOfConnectedPhase': new FormControl('',
        Validators.compose([
          Validators.required
        ])),
      'canChargeInParallel': new FormControl('',
        Validators.compose([
          Validators.required
        ]))
    });
    // Form
    this.chargeBoxID = this.formGroup.controls['chargeBoxID'];
    this.inputURL = this.formGroup.controls['inputURL'];
    this.numberOfConnectedPhase = this.formGroup.controls['numberOfConnectedPhase'];
    this.canChargeInParallel = this.formGroup.controls['canChargeInParallel'];

    if (this.currentChargeBoxID) {
      this.loadChargeBoxID();
    } else if (this.activatedRoute && this.activatedRoute.params) {
      this.activatedRoute.params.subscribe((params: Params) => {
        this.currentChargeBoxID = params['id'];
        this.loadChargeBoxID();
      });
    }
    // Scroll up
    jQuery('html, body').animate({scrollTop: 0}, {duration: 500});
  }

  public isOpenInDialog(): boolean {
    return this.inDialog;
  }

  public setCurrentChargeBoxID(currentChargeBoxID) {
    this.currentChargeBoxID = currentChargeBoxID;
  }

  public refresh() {
    // Load User
    this.loadChargeBoxID();
  }

  public loadChargeBoxID() {
    if (!this.currentChargeBoxID) {
      return;
    }
    // Show spinner
    this.spinnerService.show();
    // Yes, get it
    this.centralServerService.getChargers({ChargeBoxID: this.currentChargeBoxID}).subscribe((chargerResult) => {
      this.currentCharger = chargerResult.result[0];
      this.formGroup.markAsPristine();
      // Init form
      if (this.currentCharger.id) {
        this.formGroup.controls.chargeBoxID.setValue(this.currentCharger.id);
      }
      if (this.currentCharger.chargingStationURL) {
        this.formGroup.controls.inputURL.setValue(this.currentCharger.chargingStationURL);
      }
      if (this.currentCharger.numberOfConnectedPhase) {
        this.formGroup.controls.numberOfConnectedPhase.setValue(this.currentCharger.numberOfConnectedPhase);
      }
/*      if (this.currentCharger.canChargeInParallel) {
        this.formGroup.controls.canChargeInParallel.setValue(this.currentCharger.canChargeInParallel);
      }*/
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

  public saveChargeBoxID(chargeBoxID) {
    if (this.currentChargeBoxID) {
      this._updateChargeBoxID(chargeBoxID);
    }
  }

  private _updateChargeBoxID(chargeBoxID) {
    // Show
    this.spinnerService.show();
    // Yes: Update
    this.centralServerService.updateChargingStationParams(this.currentChargeBoxID).subscribe(response => {
      // Hide
      this.spinnerService.hide();
      // Ok?
      if (response.status === Constants.REST_RESPONSE_SUCCESS) {
        // Ok
        this.messageService.showSuccessMessage(this.translateService.instant('chargers.update_success'));
        this.refresh();
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, this.messages['update_error']);
      }
    }, (error) => {
      // Hide
      this.spinnerService.hide();
      // Check status
      switch (error.status) {
        // Email already exists
        case 510:
          // Show error
          this.messageService.showErrorMessage(
            this.translateService.instant('authentication.email_already_exists'));
          break;
        // User deleted
        case 550:
          // Show error
          this.messageService.showErrorMessage(this.messages['user_do_not_exist']);
          break;
        default:
          // No longer exists!
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            this.messages['update_error']);
      }
    });
  }

}
