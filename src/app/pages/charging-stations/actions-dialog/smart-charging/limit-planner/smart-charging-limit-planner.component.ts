import { Component, OnInit, Input, ViewChildren, QueryList, Output, DoCheck, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthorizationService } from '../../../../../services/authorization-service';
import { Charger, ScheduleSlot } from 'app/common.types';
import {SmartChargingPowerSliderComponent} from '../smart-charging-power-slider.component';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { CentralServerService } from 'app/services/central-server.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { Constants } from 'app/utils/Constants';
import { Utils } from 'app/utils/Utils';

interface DisplayedScheduleSlot {
  slot: ScheduleSlot,
  id: number,
  displayedStartValue: string,
  displayedEndValue: string,
  duration: number
}

export const PROFILE_TYPE_MAP =
  [
    {key: 'Relative', description: 'chargers.smart_charging.profile_types.relative'},
    {key: 'Absolute', description: 'chargers.smart_charging.profile_types.absolute'},
    {key: 'Daily', description: 'chargers.smart_charging.profile_types.recurring_daily'},
    {key: 'Weekly', description: 'chargers.smart_charging.profile_types.recurring_weekly'}
  ]

@Component({
  selector: 'app-smart-charging-limit-planner',
  templateUrl: 'smart-charging-limit-planner.html'
})
export class SmartChargingLimitPlannerComponent implements OnInit {
  @Input() charger: Charger;
  @Output() onApplyPlanning = new EventEmitter<any>();

  @ViewChildren('powerSliders') powerSliders: QueryList<SmartChargingPowerSliderComponent>; 

  public profileTypeMap = PROFILE_TYPE_MAP;
  public profileTypeSelected: string;
  public stackLevel: number;
  public profileId: number;
  public duration: number;
  public powerUnit: string;

  public slotsSchedule: DisplayedScheduleSlot[];
  constructor(
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
    this.powerUnit = (this.charger.powerLimitUnit ? this.charger.powerLimitUnit : Constants.OCPP_UNIT_AMPER)
  }

  addSlot() {
    let slot: ScheduleSlot;
    if (this.slotsSchedule.length === 0) {
      slot = {start: new Date(), end: new Date(), limit: this.charger.maximumPower};
      slot.start.setSeconds(0);
      slot.start.setMilliseconds(0);
    } else {
      const start = new Date( this.slotsSchedule[this.slotsSchedule.length-1].slot.start.getTime() +60000)
      slot = {start: start, end: start, limit: this.charger.maximumPower};
    }
    const displayedSlot:DisplayedScheduleSlot = {
      slot: slot,
      id: this.slotsSchedule.length,
      displayedStartValue: this._buildDisplayDateTimePickerValue(slot.start),
      displayedEndValue: slot.end.toISOString().slice(0,16),
      duration: 0
    }; 
    this.slotsSchedule.push(displayedSlot);
  }

  public sliderChanged(slot, value) {
    slot.slot.limit = value;
  }

  changeStartSlotDate(event, slot: DisplayedScheduleSlot) {
    let start = new Date(event.target.value);
    slot.slot.start = start;
//    slot.displayedStartValue = slot.slot.start.toISOString().slice(0, 16);
    // Set end date of previous slot
    if (slot.id > 0) {
      this.slotsSchedule[slot.id-1].slot.end = start;
      this.slotsSchedule[slot.id-1].duration = (this.slotsSchedule[slot.id-1].slot.end.getTime() - this.slotsSchedule[slot.id-1].slot.start.getTime())/1000;
    }
    // update current slot end date
    if (slot.slot.end) {
      console.log(`edn ${slot.slot.end.getTime()} start ${slot.slot.start.getTime()}`);
      if (slot.slot.end.getTime() < slot.slot.start.getTime()) {
        slot.slot.end = slot.slot.start;
        slot.displayedEndValue = slot.slot.end.toISOString().slice(0,16);
      }
    }
  }

  changeEndSlotDate(event, slot: DisplayedScheduleSlot) {
    if (event.target.value !== "") {
      let end = new Date(event.target.value);
      slot.slot.end = end;
//      slot.displayedEndValue = slot.slot.end.toISOString().slice(0, 16);
      slot.duration = (slot.slot.end.getTime() - slot.slot.start.getTime()) / 1000;
    } else {
      slot.slot.end = null;
    }
  }

  applyPowerLimit() {
    //show yes/no dialog
    this.dialogService.createAndShowYesNoDialog(
      this.dialog,
      this.translateService.instant('chargers.smart_charging.power_limit_title'),
      this.translateService.instant('chargers.smart_charging.power_limit_confirm', {'chargeBoxID': this.charger.id, 'power': 0})//Math.round(this.powerSliderValue/1000)})
    ).subscribe((result) => {
      if (result === Constants.BUTTON_TYPE_YES) {
        try {
          
        
        //Build OCPP planning
        const chargingProfile = this._buildProfile();
        console.log("Profile "+ JSON.stringify(chargingProfile, null, " "));
        //call REST service
        this.centralServerService.chargingStationSetChargingProfile(this.charger, 0, chargingProfile).subscribe(response => {
            if (response.status === Constants.OCPP_RESPONSE_ACCEPTED) {
              //success + reload
              this.messageService.showSuccessMessage(this.translateService.instant('chargers.smart_charging.power_limit_success'), {'chargeBoxID': this.charger.id, 'power': 'plan'});
              this.onApplyPlanning.emit();
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
        } catch (error) {
          Utils.handleError(JSON.stringify(error),
                this.messageService, this.translateService.instant('chargers.smart_charging.power_limit_error'));
        }
      }
    });
  }

  public _buildProfile() {
    const profile: any = {};
    if (this.profileId > 0 && this.profileId <= 10) {
      profile.chargingProfileId = this.profileId;
    } else {
      throw "Invalid profile Id";
    }
    if (this.stackLevel > 0 && this.stackLevel <= 10) {
      profile.stackLevel = this.stackLevel;
    } else {
      throw "Invalid stack level";
    }
    profile.chargingProfilePurpose = 'TxDefaultProfile';
    // set profile type
    if (this.profileTypeSelected === PROFILE_TYPE_MAP[2].key || this.profileTypeSelected === PROFILE_TYPE_MAP[3].key) {
      profile.chargingProfileKind = 'Recurring';
      profile.recurrencyKind = this.profileTypeSelected;
    } else {
      if (this.profileTypeSelected) {
        profile.chargingProfileKind = this.profileTypeSelected;
      } else {
        throw "Invalid profile type";
      }
    }
    // build charging schedule header
    profile.chargingSchedule = {};
    if (this.duration > 0) {
      profile.chargingSchedule.duration = this.duration;
    }
    if (profile.chargingProfileKind !== PROFILE_TYPE_MAP[0].key) {
      profile.chargingSchedule.startSchedule = this.slotsSchedule[0].slot.start.toISOString();
    }
    profile.chargingSchedule.chargingRateUnit = this.powerUnit;
    // build schedule
    const startOfSchedule = this.slotsSchedule[0].slot.start.getTime();
    profile.chargingSchedule.chargingSchedulePeriod = [];
    for (const slot of this.slotsSchedule) {
      const period: any = {};
      period.startPeriod = (slot.slot.start.getTime() - startOfSchedule) / 1000;
      if (period.startPeriod >= 0) {
        period.limit = slot.slot.limit;
        profile.chargingSchedule.chargingSchedulePeriod.push(period);
      } else {
        throw "Invalid schedule";
      }
    }
    return profile;
  }

  _buildDisplayDateTimePickerValue(date: Date) {
    console.log(date.toISOString().slice(0,16));
    console.log(`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}T${date.getHours()}:${date.getMinutes()}`);
    return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}T${date.getHours()}:${date.getMinutes()}`;
  }

}
