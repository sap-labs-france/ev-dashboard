import { Component, Input, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Charger, ScheduleSlot, ChargingProfile, ChargingProfileKindType, ChargingProfilePurposeType, ChargingRateUnitType, ChargingSchedule, RecurrencyKindType } from 'app/common.types';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { ScheduleSlot } from 'app/types/ChargingProfile';
import { ChargingStation } from 'app/types/ChargingStation';
import { ChargingStations } from 'app/utils/ChargingStations';
import { Constants } from 'app/utils/Constants';
import { Utils } from 'app/utils/Utils';
import { AuthorizationService } from '../../../../services/authorization.service';
import { ChargingStationPowerSliderComponent } from '../component/charging-station-power-slider.component';
import { MatTableModule } from '@angular/material/table';
import { ChargingStationSmartChargingLimitPlannerChartComponent } from './charging-station-charging-profile-limit-chart.component';
import { DataSource } from '@angular/cdk/table';
import { TransactionsHistoryTableDataSource } from 'app/pages/transactions/history/transactions-history-table-data-source';
import { ChargingPeriodListTableDataSource } from './list/charging-period-list-table-data-source';


interface DisplayedSlot extends ScheduleSlot {
  displayedLimitInkW: number;
}
export interface DisplayedScheduleSlot {
  slot: DisplayedSlot;
  id: number;
  displayedStartValue: Date;
  displayedEndValue: Date;
  duration: number;
}

export const PROFILE_TYPE_MAP =
  [
    { key: ChargingProfileKindType.RELATIVE, description: 'chargers.smart_charging.profile_types.relative', stackLevel: 4, id: 4 },
    { key: ChargingProfileKindType.ABSOLUTE, description: 'chargers.smart_charging.profile_types.absolute', stackLevel: 3, id: 3 },
    { key: RecurrencyKindType.DAILY , description: 'chargers.smart_charging.profile_types.recurring_daily', stackLevel: 2, id: 2 },
    { key: RecurrencyKindType.WEEKLY, description: 'chargers.smart_charging.profile_types.recurring_weekly', stackLevel: 1, id: 1 },
  ];

@Component({
  selector: 'app-charging-station-charging-profile-limit',
  templateUrl: 'charging-station-charging-profile-limit.component.html',
  providers: [ChargingPeriodListTableDataSource],
})

export class ChargingStationChargingProfileLimitComponent implements OnInit {
  @Input() charger!: ChargingStation;

  @ViewChildren('powerSliders') powerSliders!: QueryList<ChargingStationPowerSliderComponent>;
  @ViewChild('limitChart', { static: true }) limitChartPlannerComponent!: ChargingStationSmartChargingLimitPlannerChartComponent;

  public profileTypeMap = PROFILE_TYPE_MAP;
  public powerUnit!: ChargingRateUnitType;
  public slotsSchedule!: DisplayedScheduleSlot[];

  public formGroup!: FormGroup;
  public profileTypeControl!: AbstractControl;
  public stackLevelControl!: AbstractControl;
  public profileIdControl!: AbstractControl;
  public durationControl!: AbstractControl;

  private defaultLimit!: number;

  dataSource = this.slotsSchedule;

  constructor(

    public  chargingPeriodListTableDataSource: ChargingPeriodListTableDataSource,
    private authorizationService: AuthorizationService,
    private translateService: TranslateService,
    private dialog: MatDialog,
    private router: Router,
    private dialogService: DialogService,
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
  ) {
  }

  ngOnInit(): void {
    this.slotsSchedule = [];
    // Initialize slider values
    this.powerUnit = (this.charger.powerLimitUnit ? this.charger.powerLimitUnit : ChargingRateUnitType.AMPERE);
    // Calculate default slider value which is maximum Power of the charger
    if (this.powerUnit === Constants.OCPP_UNIT_AMPER) {
      this.defaultLimit = ChargingStations.convertWToAmp(this.charger.numberOfConnectedPhase, this.charger.maximumPower);
    } else {
      this.defaultLimit = this.charger.maximumPower;
    }
    // Init the form
    this.formGroup = new FormGroup({
      profileTypeControl: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      stackLevelControl: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      profileIdControl: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      durationControl: new FormControl(''),
    });
    // Form
    this.profileTypeControl = this.formGroup.controls['profileTypeControl'];
    this.stackLevelControl = this.formGroup.controls['stackLevelControl'];
    this.profileIdControl = this.formGroup.controls['profileIdControl'];
    this.durationControl = this.formGroup.controls['durationControl'];

    this.profileTypeControl.valueChanges.subscribe(() => {
      this.resetSlots();
      // Set default values
      // @ts-ignore
      this.stackLevelControl.setValue(PROFILE_TYPE_MAP.find((mapElement) => mapElement.key === this.profileTypeControl.value).stackLevel);
      // @ts-ignore
      this.profileIdControl.setValue(PROFILE_TYPE_MAP.find((mapElement) => mapElement.key === this.profileTypeControl.value).id);
    });

    this.profileTypeControl.setValue('Absolute');
  }

  addSlot() {
    let slot: DisplayedSlot;

    if (this.slotsSchedule.length === 0) {
      const date = new Date();
      date.setSeconds(0);
      date.setMilliseconds(0);
      slot = { start: date, end: date, limit: this.defaultLimit, displayedLimitInkW: this.getDisplayedLimit(this.defaultLimit) };
    } else {
      // change previous slot
      const previousSlot = this.slotsSchedule[this.slotsSchedule.length - 1];
      if (previousSlot.duration > 0) {
        const start = new Date(previousSlot.slot.start.getTime() + previousSlot.duration * 1000);
        slot = { start, end: start, limit: this.defaultLimit, displayedLimitInkW: this.getDisplayedLimit(this.defaultLimit) };
      } else {
        const start = new Date(this.slotsSchedule[this.slotsSchedule.length - 1].slot.start.getTime() + 3600000);
        slot = { start, end: start, limit: this._defaultLimit, displayedLimitInkW: this._getDisplayedLimit(this._defaultLimit) };
        previousSlot.slot.end = start;
        previousSlot.duration = ((previousSlot.slot.end.getTime() - previousSlot.slot.start.getTime()) / 1000);
      }
    }
    const displayedSlot: DisplayedScheduleSlot = {
      slot,
      id: this.slotsSchedule.length,
      displayedStartValue: this._buildDisplayDateTimePickerValue(slot.start),
      displayedEndValue: this._buildDisplayDateTimePickerValue(slot.end),
      duration: 0 //((slot.end.getTime() - slot.start.getTime()) / 1000),
    };
    this.slotsSchedule.push(displayedSlot);
    this.limitChartPlannerComponent.setLimitPlannerData(this.slotsSchedule);
    this.dataSource = [...this.slotsSchedule]
  }

  removeSlot() {
    let slot: DisplayedSlot;
    if (this.slotsSchedule.length !== 0) {
      // change previous slot
      this.slotsSchedule[this.slotsSchedule.length-1].duration = 0;
      this.slotsSchedule.pop();
     // this.dataSource = [...this.slotsSchedule];
      this.limitChartPlannerComponent.setLimitPlannerData(this.slotsSchedule);

    }
  }

  resetSlots() {
    this.slotsSchedule = [];
    this.addSlot();
    this.addSlot();
    this.limitChartPlannerComponent.setLimitPlannerData(this.slotsSchedule);
    this.dataSource = [...this.slotsSchedule];
  }

  public powerSliderChanged(event: number, slot: DisplayedScheduleSlot) {
    slot.slot.limit = event;
    slot.slot.displayedLimitInkW = this._getDisplayedLimit(event);
    this.limitChartPlannerComponent.setLimitPlannerData(this.slotsSchedule);
  }

  changeStartSlotDate(date: string, slot: DisplayedScheduleSlot) {
    const start = new Date(date);
    slot.slot.start = start;
    // Set end date of previous slot
    if (slot.id > 0) {
      this.slotsSchedule[slot.id - 1].slot.end = start;
      // tslint:disable-next-line:max-line-length
      this.slotsSchedule[slot.id - 1].duration = (this.slotsSchedule[slot.id - 1].slot.end.getTime() - this.slotsSchedule[slot.id - 1].slot.start.getTime()) / 1000;
    }
    // update current slot end date
    if (slot.slot.end) {
      if (slot.slot.end.getTime() < slot.slot.start.getTime()) {
        slot.slot.end = slot.slot.start;
        slot.displayedEndValue = this.buildDisplayDateTimePickerValue(slot.slot.end);
      }
    }
    for(let i = 0 ;i < this.slotsSchedule.length-1; i++){
      if(this.slotsSchedule[i].displayedEndValue > this.slotsSchedule[i+1].displayedStartValue){
        this.slotsSchedule[i+1].displayedStartValue = this.slotsSchedule[i].displayedEndValue
        this.slotsSchedule[i+1].displayedEndValue = this.slotsSchedule[i].displayedEndValue
      }
    }
    console.log(this.slotsSchedule);
    this.limitChartPlannerComponent.setLimitPlannerData(this.slotsSchedule);
    this.dataSource = [...this.slotsSchedule];
  }

  changeEndSlotDate(date: string, slot: DisplayedScheduleSlot) {
    if (date !== '') {
      const end = new Date(date);
      slot.slot.end = end;
      slot.duration = (slot.slot.end.getTime() - slot.slot.start.getTime()) / 1000;
    } else {
      slot.slot.end = slot.slot.start;
    }
    this.limitChartPlannerComponent.setLimitPlannerData(this.slotsSchedule);
  }

  changeSlotDuration(value: number, slot: DisplayedScheduleSlot) {
    // update current slot end date
    slot.slot.end = new Date(slot.slot.start.getTime() + value * 1000);
    slot.displayedEndValue = this.buildDisplayDateTimePickerValue(slot.slot.end);
    slot.duration = value;
    // update next slots start date
    for (let index = slot.id + 1; index < this.slotsSchedule.length; index++) {
      const slotSchedule = this.slotsSchedule[index];
      slotSchedule.slot.start = this.slotsSchedule[index - 1].slot.end;
      slotSchedule.slot.end = new Date(this.slotsSchedule[index - 1].slot.end.getTime() + slotSchedule.duration * 1000);
      slotSchedule.displayedStartValue = this.buildDisplayDateTimePickerValue(slotSchedule.slot.start);
      slotSchedule.displayedEndValue = this.buildDisplayDateTimePickerValue(slotSchedule.slot.end);
    }
    this.limitChartPlannerComponent.setLimitPlannerData(this.slotsSchedule);
  }

  applyPowerLimit() {
    // show yes/no dialog
    const self = this;
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('chargers.smart_charging.power_limit_plan_title'),
      this.translateService.instant('chargers.smart_charging.power_limit_plan_confirm', { chargeBoxID: this.charger.id }),
    ).subscribe((result) => {
      if (result === Constants.BUTTON_TYPE_YES) {
        try {
          // Build OCPP planning
          const chargingProfile = this.buildProfile();
          // call REST service
          this.centralServerService.chargingStationSetChargingProfile(this.charger, 0, chargingProfile).subscribe((response) => {
            if (response.status === Constants.OCPP_RESPONSE_ACCEPTED) {
              // success + reload
              this.messageService.showSuccessMessage(this.translateService.instant('chargers.smart_charging.power_limit_plan_success',
                { chargeBoxID: self.charger.id, power: 'plan' }));
            } else {
              Utils.handleError(JSON.stringify(response),
                this.messageService, this.translateService.instant('chargers.smart_charging.power_limit_plan_error'));
            }
          }, (error) => {
            this.spinnerService.hide();
            this.dialog.closeAll();
            Utils.handleHttpError(
              error, this.router, this.messageService, this.centralServerService, 'chargers.smart_charging.power_limit_error');
          });
        } catch (error) {
          Utils.handleError(JSON.stringify(error),
            this.messageService, this.translateService.instant('chargers.smart_charging.power_limit_error'));
        }
      }
    });
  }


  public _buildProfile() {
    const profile = {} as ChargingProfile;
    if (this.profileIdControl.value > 0 && this.profileIdControl.value <= 10) {
      profile.chargingProfileId = this.profileIdControl.value;
    } else {
      throw new Error('Invalid profile Id');
    }
    if (this.stackLevelControl.value > 0 && this.stackLevelControl.value <= 10) {
      profile.stackLevel = this.stackLevelControl.value;
    } else {
      throw new Error('Invalid stack level');
    }
    profile.chargingProfilePurpose = ChargingProfilePurposeType.TX_DEFAULT_PROFILE;
    // set profile type
    if (this.profileTypeControl.value === PROFILE_TYPE_MAP[2].key || this.profileTypeControl.value === PROFILE_TYPE_MAP[3].key) {
      profile.chargingProfileKind = ChargingProfileKindType.RECURRING;
      profile.recurrencyKind = this.profileTypeControl.value;
    } else {
      if (this.profileTypeControl.value) {
        profile.chargingProfileKind = this.profileTypeControl.value;
      } else {
        throw new Error('Invalid profile type');
      }
    }
    // build charging schedule header
    profile.chargingSchedule = {} as ChargingSchedule;
    if (this.durationControl.value > 0) {
      profile.chargingSchedule.duration = this.durationControl.value;
    }
    if (profile.chargingProfileKind !== PROFILE_TYPE_MAP[0].key) {
      profile.chargingSchedule.startSchedule = this.slotsSchedule[0].slot.start;
      if (!profile.chargingSchedule.startSchedule || profile.chargingSchedule.startSchedule.toString().length === 0) {
        throw new Error('Invalid start date for non relative profile');
      }
    }
    profile.chargingSchedule.chargingRateUnit = this.powerUnit;
    // build schedule
    const startOfSchedule = this.slotsSchedule[0].slot.start.getTime();
    profile.chargingSchedule.chargingSchedulePeriod = [];
    for (const slot of this.slotsSchedule) {
      const period: any = {};
      period.startPeriod = (slot.slot.start.getTime() - startOfSchedule) / 1000;
      if (period.startPeriod >= 0) {
        period.limit = ChargingStations.provideLimit(this.charger, slot.slot.limit);
        profile.chargingSchedule.chargingSchedulePeriod.push(period);
      } else {
        throw new Error('Invalid schedule');
      }
    }
    return profile;
  }

  private buildDisplayDateTimePickerValue(date: Date) {
    // tslint:disable-next-line:max-line-length
    const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1)}-${(date.getDate() < 10 ? '0' + date.getDate() : date.getDate())}T${(date.getHours() < 10 ? '0' + date.getHours() : date.getHours())}:${(date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())}`;
    return date;
  }

  private getDisplayedLimit(value: number) {
    if (this.powerUnit === Constants.OCPP_UNIT_AMPER) {
      return ChargingStations.convertAmpToW(this.charger.numberOfConnectedPhase, value);
    } else {
      return value;
    }
  }

}
