import {Component, Input, OnInit, Injectable, ViewChildren, QueryList, ElementRef, ViewChild, AfterViewInit, Output, EventEmitter} from '@angular/core';
import {Charger, ConnectorSchedule, ScheduleSlot} from '../../../../../common.types';
import {LocaleService} from '../../../../../services/locale.service';
import {Router} from '@angular/router';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {CentralServerService} from '../../../../../services/central-server.service';
import {SpinnerService} from '../../../../../services/spinner.service';
import {AuthorizationService} from '../../../../../services/authorization-service';
import {MessageService} from '../../../../../services/message.service';
import {Utils} from '../../../../../utils/Utils';
import {ChargingStations} from '../../../../../utils/ChargingStations';
import {Constants} from '../../../../../utils/Constants';
import {MatSlider} from '@angular/material/slider';
import {DialogService} from '../../../../../services/dialog.service';
import {AppUnitPipe} from '../../../../../shared/formatters/app-unit.pipe'
import {SmartChargingPowerSliderComponent} from '../smart-charging-power-slider.component';
import {SmartChargingUtils} from '../smart-charging-utils';
import { SmartChargingLimitChartComponent } from './smart-charging-limit-chart.component';

const MIN_POWER = 3000; // Minimum power in W under which we can't go
const LIMIT_FOR_STEP_CHANGE = 10000;  // Limit in W for which we are changing teh step of the slider
const SMALL_SLIDER_STEP = 500;
const LARGE_SLIDER_STEP = 1000;
const DISPLAY_UNIT = 'kW';

@Component({
  selector: 'app-smart-charging-limit-planning',
  templateUrl: './smart-charging-limit-planning.html'
})
@Injectable()
export class SmartChargingLimitPlanningComponent implements OnInit, AfterViewInit {
  @Input() charger: Charger;
  @Output() onLimitChange: EventEmitter<number> = new EventEmitter<number>();;
  private messages;
  public userLocales;
  public isAdmin;

  public powerUnit;
  public compositeSchedule;
  public hasNoActivePlanning: boolean = true;
  public hasNoCompositeResultAccepted: boolean = true;
  public startScheduleDate: Date;
  public endScheduleDate: Date;
  public minChargingRate: number;
  public internalFormatCurrentLimit: number;
  public currentDisplayedLimit: number;
  public limitPlanning: ConnectorSchedule[] = [];
  displayedColumns: string[] = ['from', 'to', 'limit'];

  @ViewChild('limitChart') limitChartPlanningComponnent: SmartChargingLimitChartComponent;

  private powerDigitPrecision = 2;
  private powerFloatingPrecision = 0;

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
    // For small charger increase display precision
    if (this.charger.maximumPower < 10000) {
      this.powerDigitPrecision = 1;
      this.powerFloatingPrecision = 2;
    }
    // Load actual charger limit
    this.getCompositeSchedule();
  }

  ngAfterViewInit(): void {
    this.limitChartPlanningComponnent.refresh(this.limitPlanning);
  }

  /**
   * refresh
   */
  public refresh() {
    this.getCompositeSchedule();
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
      // Inform that new limit value was calculated 
      this.onLimitChange.emit(this.internalFormatCurrentLimit);
      this.currentDisplayedLimit = SmartChargingUtils.getDisplayedFormatValue(this.internalFormatCurrentLimit, 'W', DISPLAY_UNIT, this.powerDigitPrecision, this.powerFloatingPrecision, this.charger.numberOfConnectedPhase, this.appUnitFormatter);
      this.limitChartPlanningComponnent.refresh(this.limitPlanning);
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
          this.minChargingRate = (compositeSchedule.chargingSchedule.minChargingRate ? 
                  SmartChargingUtils.getDisplayedFormatValue(compositeSchedule.chargingSchedule.minChargingRate, compositeSchedule.chargingSchedule.chargingRateUnit, DISPLAY_UNIT, this.powerDigitPrecision, this.powerFloatingPrecision, this.charger.numberOfConnectedPhase, this.appUnitFormatter)
                   : 0);
          // find and add limit valid in current period
          for (let index = 0; index < compositeSchedule.chargingSchedule.chargingSchedulePeriod.length; index++) {
            let slot: ScheduleSlot = {start: new Date(), end: new Date(), limit: 0};
            const chargingPeriod = compositeSchedule.chargingSchedule.chargingSchedulePeriod[index];
            // Calculate beginning of period
            slot.start = new Date(this.startScheduleDate.getTime() + chargingPeriod.startPeriod * 1000);
            // Calculate end of period
            slot.end = undefined;
            if (index < compositeSchedule.chargingSchedule.chargingSchedulePeriod.length - 1) {
              let nextChargingPeriod = compositeSchedule.chargingSchedule.chargingSchedulePeriod[index+1]
              slot.end = new Date(this.startScheduleDate.getTime() + nextChargingPeriod.startPeriod * 1000);
            }
            slot.limit = SmartChargingUtils.getDisplayedFormatValue(chargingPeriod.limit, compositeSchedule.chargingSchedule.chargingRateUnit, DISPLAY_UNIT, this.powerDigitPrecision, this.powerFloatingPrecision, this.charger.numberOfConnectedPhase, this.appUnitFormatter)
            if (!connectorSchedule.hasOwnProperty('slots')) {
              // Initialize
              connectorSchedule.slots = [];
            }
            connectorSchedule.slots.push(slot);
            // Add limits in case schedule is in current time
            if (!slot.end && slot.start <= currentDate && !notValidForCurrentLimit) {
              this.internalFormatCurrentLimit += SmartChargingUtils.getInternalFormatValue(chargingPeriod.limit, compositeSchedule.chargingSchedule.chargingRateUnit, this.charger.numberOfConnectedPhase);
            } else {
              if (slot.start <= currentDate && slot.end > currentDate && !notValidForCurrentLimit) {
                this.internalFormatCurrentLimit += SmartChargingUtils.getInternalFormatValue(chargingPeriod.limit, compositeSchedule.chargingSchedule.chargingRateUnit, this.charger.numberOfConnectedPhase);
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
}
