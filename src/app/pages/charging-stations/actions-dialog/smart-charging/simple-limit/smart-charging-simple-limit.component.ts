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
import {ChargingStations} from '../../../../../utils/ChargingStations';
import { CONNECTOR_TYPE_MAP } from '../../../../../shared/formatters/app-connector-type.pipe';
import {Constants} from '../../../../../utils/Constants';
import {MatSlider} from '@angular/material/slider';
import {DialogService} from '../../../../../services/dialog.service';
import {AppUnitPipe} from '../../../../../shared/formatters/app-unit.pipe'

const MIN_POWER = 3000; // Minimum power in W under which we can't go
const LIMIT_FOR_STEP_CHANGE = 10000;  // Limit in W for which we are changing teh step of the slider
const SMALL_SLIDER_STEP = 500;
const LARGE_SLIDER_STEP = 1000;
const DISPLAY_UNIT = 'kW';

interface Slot {
  start: Date;
  end: Date;
  limit: number;
}
interface ConnectorSchedule {
  connectorId: number;
  slots: Slot[];
}

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

  public maxPowerSlider: number;
  public minPowerSlider: number;
  public stepPowerSlider: number;
  public powerSliderValue: number = 0;
  public powerSliderPercent: number = 0;
  public powerUnit;
  public compositeSchedule;
  public hasNoActivePlanning: boolean = true;
  public hasNoCompositeResultAccepted: boolean = true;
  public startScheduleDate: Date;
  public endScheduleDate: Date;
  public minChargingRate: number;
  private internalFormatCurrentLimit: number;
  public currentDisplayedLimit: number;
  public limitPlanning: ConnectorSchedule[] = [];
  displayedColumns: string[] = ['from', 'to', 'limit'];

  private powerDigitPrecision = 2;
  private powerFloatingPrecision = 0;

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
    private dialogService: DialogService,
    private appUnitFormatter: AppUnitPipe) {

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
  }

  ngOnInit(): void {
    // Initialize slider values
    this.powerUnit = (this.charger.powerLimitUnit ? this.charger.powerLimitUnit : Constants.OCPP_UNIT_AMPER)
    if (this.powerUnit === Constants.OCPP_UNIT_WATT) {
      // Value of slider will be expressed in WATT
      this.minPowerSlider = MIN_POWER; 
      this.maxPowerSlider = this.charger.maximumPower;
      this.stepPowerSlider = (this.maxPowerSlider > LIMIT_FOR_STEP_CHANGE ? LARGE_SLIDER_STEP : SMALL_SLIDER_STEP);
    } else if (this.powerUnit === Constants.OCPP_UNIT_AMPER){
      // Value of slider will be expressed in Amper
      this.maxPowerSlider = ChargingStations.convertWToAmp(this.charger.numberOfConnectedPhase, this.charger.maximumPower);
      this.minPowerSlider = 1;
      // Search minimum amper value to be just above MIN_POWER 
      for (let index = 1; index < this.maxPowerSlider; index++) {
        if (Math.round(ChargingStations.convertAmpToW(this.charger.numberOfConnectedPhase, index)) >= MIN_POWER) {
          this.minPowerSlider = index;
          break;
        }
      }
    }
    // For small charger increase display precision
    if (this.charger.maximumPower < 10000) {
      this.powerDigitPrecision = 1;
      this.powerFloatingPrecision = 2;
    }
    // Load actual charger limit
    this.getCompositeSchedule();
  }

  /**
   * refresh
   */
  public refresh() {
    this.getCompositeSchedule();
  }

  public formatPowerPercent(value: number | null) {
    const self = <MatSlider><unknown>this; // To check why we have issue between compile and runtime. At runtime this is a MatSlider
    if (!value) {
      return "0";
    }
    return `${Math.round(value/self.max*100)}`;
  }

  public sliderChanged() {
    this.powerSliderValue = this._getDisplayedFormatValue(this.powerSliderComponent.value, this.powerUnit);
/*    if (this.powerUnit === Constants.OCPP_UNIT_AMPER){
      this.powerSliderValue = ChargingStations.convertAmpTokW(this.charger.numberOfConnectedPhase, this.powerSliderComponent.value);
    } else {
      this.powerSliderValue = this.powerSliderComponent.value;
    }*/
  }

  public sliderInput() {
    this.powerSliderValue = this._getDisplayedFormatValue(this.powerSliderComponent.value, this.powerUnit);
/*    if (this.powerUnit === Constants.OCPP_UNIT_AMPER){
      this.powerSliderValue = ChargingStations.convertAmpTokW(this.charger.numberOfConnectedPhase, this.powerSliderComponent.value);
    } else {
      this.powerSliderValue = this.powerSliderComponent.value;
    }*/
  }

  public applyPowerLimit() {
    //show yes/no dialog
    this.dialogService.createAndShowYesNoDialog(
      this.dialog,
      this.translateService.instant('chargers.smart_charging.power_limit_title'),
      this.translateService.instant('chargers.smart_charging.power_limit_confirm', {'chargeBoxID': this.charger.id, 'power': this.powerSliderValue})//Math.round(this.powerSliderValue/1000)})
    ).subscribe((result) => {
      if (result === Constants.BUTTON_TYPE_YES) {
        //call REST service
        this.centralServerService.chargingStationLimitPower(this.charger, 0, this.powerUnit, this.powerSliderComponent.value, 0).subscribe(response => {
//TEST 2nd schedule          this.centralServerService.chargingStationLimitPower(this.charger, 0, this.powerUnit, this.powerSliderComponent.value, 1).subscribe(response => {
            if (response.status === Constants.OCPP_RESPONSE_ACCEPTED) {
              //success + reload
              this.refresh();
              this.messageService.showSuccessMessage(this.translateService.instant('chargers.smart_charging.power_limit_success'), {'chargeBoxID': this.charger.id, 'power': this.powerSliderValue});
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
//Test 2nd schedule      });
    }
  });
}

  public getCompositeSchedule() {
    this.spinnerService.show();
    this.hasNoActivePlanning = true;
    this.hasNoCompositeResultAccepted = true;
    this.centralServerService.getChargingStationCompositeSchedule(this.charger.id, 0, 86400, this.powerUnit, true).subscribe((result) => {
      console.log(JSON.stringify(result, null, " "));
      this.compositeSchedule = [];
      if (!Array.isArray(result)) {
        this.compositeSchedule = [result];
      } else {
        this.compositeSchedule = result;
      }
      this._parseCompositeSchedule();
      // Update slider values
      this.powerSliderValue = this._getDisplayedFormatValue(this.internalFormatCurrentLimit, 'W'); 
      if (this.powerUnit === Constants.OCPP_UNIT_AMPER){
        this.powerSliderComponent.value = ChargingStations.convertWToAmp(this.charger.numberOfConnectedPhase, this.internalFormatCurrentLimit);
      } else {
        this.powerSliderComponent.value = this.internalFormatCurrentLimit;
      }
      this.currentDisplayedLimit = this.powerSliderValue;
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

    private _parseCompositeSchedule() {
      // Extract data from JSON result
      const nbResultTotal = this.compositeSchedule.length;
      // ignore rejected status
      const compositeScheduleAccepted = this.compositeSchedule.map((element) => {
        if (element.status === Constants.OCPP_RESPONSE_ACCEPTED) return element;
      });
      // Check number of result
      const nbAcceptedResult = compositeScheduleAccepted.length;
      this.hasNoActivePlanning = (nbAcceptedResult === 0 && nbResultTotal === 0);
      this.hasNoCompositeResultAccepted = (nbAcceptedResult === 0 && nbResultTotal !== 0);
//      this.nbRejectedResults = (nbAcceptedResult === 0 && nbResultTotal !== 0);
      // Build results
      this.internalFormatCurrentLimit = 0;
      this.limitPlanning = [];
      for (const compositeSchedule of compositeScheduleAccepted) {
        let connectorSchedule: ConnectorSchedule = {connectorId:0, slots:[]};
        let notValidForCurrentLimit = false;
        connectorSchedule.connectorId = compositeSchedule.connectorId;
        const currentDate = new Date(compositeSchedule.centralSystemTime);
        let scheduleStartDate;
        if (compositeSchedule.scheduleStart) {
          scheduleStartDate = new Date(compositeSchedule.scheduleStart);
          if (scheduleStartDate > currentDate) {
            // Ignore schedule which are in the future for current limit calculation
            notValidForCurrentLimit = true;
          }
        }
        if (compositeSchedule.chargingSchedule) {
          if (compositeSchedule.chargingSchedule.startSchedule) {
            this.startScheduleDate = new Date(compositeSchedule.chargingSchedule.startSchedule);
          } else if (scheduleStartDate) {
            this.startScheduleDate = scheduleStartDate;
          } else {
            this.startScheduleDate = currentDate;
          }
          if (compositeSchedule.chargingSchedule.duration) {
            // Calculate end of schedule
              this.endScheduleDate = new Date(this.startScheduleDate.getTime() + compositeSchedule.chargingSchedule.duration * 1000);
          }
          // Calculate the minimum charging
          this.minChargingRate = (compositeSchedule.chargingSchedule.minChargingRate ? this._getDisplayedFormatValue(compositeSchedule.chargingSchedule.minChargingRate, compositeSchedule.chargingSchedule.chargingRateUnit) : 0);
/*                                    (compositeSchedule.chargingSchedule.chargingRateUnit === Constants.OCPP_UNIT_WATT ? 
                                      compositeSchedule.chargingSchedule.minChargingRate * 1000 : 
                                      ChargingStations.convertAmpTokW(this.charger.numberOfConnectedPhase, compositeSchedule.chargingSchedule.minChargingRate)) : 0);
                                    */
          // find and add limit valid in current period
          for (let index = 0; index < compositeSchedule.chargingSchedule.chargingSchedulePeriod.length; index++) {
            let slot: Slot = {start: new Date(), end: new Date(), limit: 0};
            const chargingPeriod = compositeSchedule.chargingSchedule.chargingSchedulePeriod[index];
            // Calculate beginning of period
            slot.start = new Date(this.startScheduleDate.getTime() + chargingPeriod.startPeriod * 1000);
            // Calculate end of period
            slot.end = undefined;
            if (index < compositeSchedule.chargingSchedule.chargingSchedulePeriod.length - 1) {
              let nextChargingPeriod = compositeSchedule.chargingSchedule.chargingSchedulePeriod[index+1]
              slot.end = new Date(this.startScheduleDate.getTime() + nextChargingPeriod.startPeriod * 1000);
            }
            slot.limit = this._getDisplayedFormatValue(chargingPeriod.limit, compositeSchedule.chargingSchedule.chargingRateUnit); 
//            (compositeSchedule.chargingSchedule.chargingRateUnit === Constants.OCPP_UNIT_WATT ? chargingPeriod.limit * 1000 : ChargingStations.convertAmpTokW(this.charger.numberOfConnectedPhase, chargingPeriod.limit));
            if (!connectorSchedule.hasOwnProperty('slots')) {
              // Initialize
              connectorSchedule.slots = [];
            }
            connectorSchedule.slots.push(slot);
            if (!slot.end && slot.start <= currentDate && !notValidForCurrentLimit) {
              this.internalFormatCurrentLimit += this._getInternalFormatValue(chargingPeriod.limit, compositeSchedule.chargingSchedule.chargingRateUnit);
//              this._getDisplayedFormatValue(chargingPeriod.limit, compositeSchedule.chargingSchedule.chargingRateUnit);
//              (compositeSchedule.chargingSchedule.chargingRateUnit === Constants.OCPP_UNIT_WATT ? chargingPeriod.limit * 1000 : ChargingStations.convertAmpTokW(this.charger.numberOfConnectedPhase, chargingPeriod.limit));
            } else {
              if (slot.start <= currentDate && slot.end > currentDate && !notValidForCurrentLimit) {
                this.internalFormatCurrentLimit += this._getInternalFormatValue(chargingPeriod.limit, compositeSchedule.chargingSchedule.chargingRateUnit);
//                this.currentLimit += (compositeSchedule.chargingSchedule.chargingRateUnit === Constants.OCPP_UNIT_WATT ? chargingPeriod.limit * 1000 : ChargingStations.convertAmpTokW(this.charger.numberOfConnectedPhase, chargingPeriod.limit));
              }
            }
          }
          this.limitPlanning.push(connectorSchedule);
        } else {
          // Empty schedule what does it means => no planning
          this.hasNoActivePlanning = true;
        }
      }
    }

    /**
     *
     * Return the value in th eexpected display format
     * All values are displayed in kW
     * @param {*} value : value to convert 
     * @param {*} valueUnit : unit (W, kW, A) of the value
     * @memberof SmartChargingSimpleLimitComponent
     */
    _getDisplayedFormatValue(value, valueUnit) {
      switch (valueUnit) {
        case 'W':
          return this.appUnitFormatter.transform(value, valueUnit, DISPLAY_UNIT, false, this.powerDigitPrecision, this.powerFloatingPrecision);
          break;
        case 'kW':
          return this.appUnitFormatter.transform(value, valueUnit, DISPLAY_UNIT, false, this.powerDigitPrecision, this.powerFloatingPrecision);
          break;
        case 'A':
          return this.appUnitFormatter.transform(ChargingStations.convertAmpToW(this.charger.numberOfConnectedPhase, this.powerSliderComponent.value), 'W', DISPLAY_UNIT, false, this.powerDigitPrecision, this.powerFloatingPrecision);;
          break;
      }
    }

    /**
     * Return a value formatted to internal format which is W
     *
     * @param {*} value
     * @param {*} valueUnit
     * @returns
     * @memberof SmartChargingSimpleLimitComponent
     */
    _getInternalFormatValue(value, valueUnit) {
      switch (valueUnit) {
        case 'W':
          return value;
          break;
        case 'kW':
          return value * 1000;
          break;
        case 'A':
          return ChargingStations.convertAmpToW(this.charger.numberOfConnectedPhase, value);
          break;
      }
    }
}
