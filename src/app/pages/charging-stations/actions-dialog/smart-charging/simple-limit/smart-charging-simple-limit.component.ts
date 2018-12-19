import {Component, Input, OnInit, Injectable, ViewChildren, QueryList, ElementRef, ViewChild} from '@angular/core';
import {Charger, SiteArea} from '../../../../../common.types';
import {LocaleService} from '../../../../../services/locale.service';
import {Router} from '@angular/router';
import {FormGroup, FormControl, AbstractControl, Validators} from '@angular/forms';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {CentralServerService} from '../../../../../services/central-server.service';
import {SpinnerService} from '../../../../../services/spinner.service';
import {AuthorizationService} from '../../../../../services/authorization-service';
import {MessageService} from '../../../../../services/message.service';
import {Utils} from '../../../../../utils/Utils';
import { CONNECTOR_TYPE_MAP } from '../../../../../shared/formatters/app-connector-type.pipe';
import {Constants} from '../../../../../utils/Constants';
import {MatSlider} from '@angular/material/slider';
import {DialogService} from '../../../../../services/dialog.service';

const MIN_POWER = 3000; // Minimum power in W under which we can't go
const LIMIT_FOR_STEP_CHANGE = 10000;  // Limit in W for which we are changing teh step of the slider
const SMALL_SLIDER_STEP = 500;
const LARGE_SLIDER_STEP = 1000;

@Component({
  selector: 'app-smart-charging-simple-limit',
  styleUrls: ['../../../charging-stations-data-source-table.scss', '../../../../../shared/table/table.component.scss'],
  templateUrl: './smart-charging-simple-limit.html'
})
@Injectable()
export class SmartChargingSimpleLimitComponent implements OnInit {
  @Input() charger: Charger;
  private messages;
  public userLocales;
  public isAdmin;

  public formGroup: FormGroup;
  public powerSliderControl: AbstractControl;
  public maxPowerSlider: number;
  public minPowerSlider: number;
  public stepPowerSlider: number;
  public powerSliderValue: number = 0;
  public powerSliderPercent: number = 0;
  public powerUnit = "W";
  public compositeSchedule = "W";

  @ViewChild('powerSlider') powerSliderComponent: MatSlider;

  constructor(
    private authorizationService: AuthorizationService, 
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private translateService: TranslateService,
    private localeService: LocaleService,
    private dialog: MatDialog,
    private router: Router,
    private dialogService: DialogService) {

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
          'powerSliderControl': new FormControl('')
        });
        // Form
        this.powerSliderControl = this.formGroup.controls['powerSliderControl'];
        this.minPowerSlider = MIN_POWER; // Minimu is 3kW
        this.maxPowerSlider = this.charger.maximumPower;
        this.stepPowerSlider = (this.maxPowerSlider > LIMIT_FOR_STEP_CHANGE ? LARGE_SLIDER_STEP : SMALL_SLIDER_STEP);
    
        if (!this.isAdmin) {
          this.powerSliderControl.disable();
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

  public formatPowerPercent(value: number | null) {
    const self = <MatSlider><unknown>this; // To check why we have issue between compile and runtime. At runtime this is a MatSlider
    if (!value) {
      return "0";
    }
    return `${Math.round(value/self.max*100)}`;
  }

  public sliderChanged() {
//    this.temporarySliderValue = this.powerSliderControl.value;
    this.powerSliderValue = this.powerSliderComponent.value;
//    this.powerSliderPercent = Math.round(this.powerSliderComponent.percent*100);
  }

  public sliderInput() {
//    this.temporarySliderValue = this.powerSliderComponent.value;
    this.powerSliderValue = this.powerSliderComponent.value;
//    this.powerSliderPercent = Math.round(this.powerSliderComponent.percent*100);
  }

  public applyPowerLimit() {
    //show yes/no dialog
    this.dialogService.createAndShowYesNoDialog(
      this.dialog,
      this.translateService.instant('chargers.smart_charging.power_limit_title'),
      this.translateService.instant('chargers.smart_charging.power_limit_confirm', {'chargeBoxID': this.charger.id, 'power': Math.round(this.powerSliderValue/1000)})
    ).subscribe((result) => {
      if (result === Constants.BUTTON_TYPE_YES) {
        //call REST service
        this.centralServerService.chargingStationLimitPower(this.charger, 0, this.powerUnit, this.powerSliderValue).subscribe(response => {
          if (response.status === Constants.REST_RESPONSE_SUCCESS) {
            //success + reload
            this.messageService.showSuccessMessage(this.translateService.instant('chargers.smart_charging.power_limit_success'));
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, this.translateService.instant('chargers.smart_charging.power_limit_error'));
          }
        }, (error) => {
          this.spinnerService.hide();
          this.dialog.closeAll();
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            this.translateService.instant('chargers.smart_charging.power_limit_error'));
        });
      }
    });
  }

  public getCompositeSchedule() {
    this.centralServerService.getChargingStationCompositeSchedule(this.charger.id, 1, 86400, "W").subscribe((result) => {
      this.compositeSchedule = JSON.stringify(result, null, " ");
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
}
