import { Component, Input, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Charger } from 'app/common.types';
import { Slot, ScheduleSlot, Profile, ChargingProfile, ChargingProfileKindType, ChargingProfilePurposeType,  ChargingSchedule, RecurrencyKindType, ChargingSchedulePeriod } from 'app/types/ChargingProfile';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { ChargingStation, PowerLimitUnits } from 'app/types/ChargingStation';
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
import { mergeMap } from 'rxjs/operators';


interface DisplayedSlot extends ScheduleSlot {
  displayedLimitInkW: number;
}
export interface DisplayedScheduleSlot {
  slot: DisplayedSlot;
  id: number;
  displayedStartValue: Date;
  duration: number;
}


export const PROFILE_TYPE_MAP =
  [
    { key: ChargingProfileKindType.ABSOLUTE, description: 'chargers.smart_charging.profile_types.absolute', stackLevel: 3, id: 3 },
    // { key: RecurrencyKindType.DAILY , description: 'chargers.smart_charging.profile_types.recurring_daily', stackLevel: 2, id: 2 },
    // { key: RecurrencyKindType.WEEKLY, description: 'chargers.smart_charging.profile_types.recurring_weekly', stackLevel: 1, id: 1 },
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
  public powerUnit!: PowerLimitUnits;
  public slotsSchedule!: Slot[];
  public chargingProfile!: ChargingProfile;

  public formGroup!: FormGroup;
  public profileTypeControl!: AbstractControl;
  public stackLevelControl!: AbstractControl;
  public profileIdControl!: AbstractControl;
  public durationControl!: AbstractControl;
  public chargingProfilePurposeControl!: AbstractControl;
  public chargingPeriod!: FormArray;
  public startSchedule!: Date;

  public chartSlotsSchedule!: DisplayedScheduleSlot;

  private defaultLimit!: number;


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
    this.powerUnit = (this.charger.powerLimitUnit ? this.charger.powerLimitUnit : PowerLimitUnits.AMPERE);
    // Calculate default slider value which is macimum Power of the charger
    // TODO: To handle numberOfConnectedPhase per connector now
    // if (this.powerUnit === Constants.OCPP_UNIT_AMPER) {
    //   this.defaultLimit = ChargingStations.convertWToAmp(this.charger.numberOfConnectedPhase, this.charger.maximumPower);
    // } else {
    //   this.defaultLimit = this.charger.maximumPower;
    // }
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
        chargingProfilePurposeControl: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      durationControl: new FormControl(''),
      chargingPeriod: new FormArray([],
        Validators.compose([
          Validators.required,
        ])),
    });

    // Form
    this.profileTypeControl = this.formGroup.controls['profileTypeControl'];
    this.stackLevelControl = this.formGroup.controls['stackLevelControl'];
    this.profileIdControl = this.formGroup.controls['profileIdControl'];
    this.durationControl = this.formGroup.controls['durationControl'];
    this.chargingPeriod = this.formGroup.controls['chargingPeriod'] as FormArray;

    this.profileTypeControl.valueChanges.subscribe(() => {
      // Set default values
      // @ts-ignore
      this.stackLevelControl.setValue(PROFILE_TYPE_MAP.find((mapElement) => mapElement.key === this.profileTypeControl.value).stackLevel);
      // @ts-ignore
      this.profileIdControl.setValue(PROFILE_TYPE_MAP.find((mapElement) => mapElement.key === this.profileTypeControl.value).id);
    });

    this.profileTypeControl.setValue('Absolute');
    this.chargingPeriodListTableDataSource.setFormArray(this.chargingPeriod);

    this.loadChargingProfile();
    this.chargingPeriodListTableDataSource.addCharger(this.charger);
    //this.onChanges();
  }

  public loadChargingProfile() {

    if (!this.charger) {
      return;
    }
    // Show spinner
    this.spinnerService.show();
    // Yes, get it
    // tslint:disable-next-line:cyclomatic-complexity
    this.centralServerService.getChargingProfile(this.charger.id).subscribe((chargingProfile) => {
      this.formGroup.markAsPristine();
      if(chargingProfile){
      // Init form
      if (chargingProfile.profile.chargingProfileId) {
        this.formGroup.controls.profileIdControl.setValue(chargingProfile.profile.chargingProfileId);
      }
      if (chargingProfile.profile.chargingProfileKind) {
        this.formGroup.controls.profileTypeControl.setValue(chargingProfile.profile.chargingProfileKind);
      }
      if (chargingProfile.profile.chargingProfilePurpose) {
        this.formGroup.controls.chargingProfilePurposeControl.setValue(chargingProfile.profile.chargingProfilePurpose);
      }
      if (chargingProfile.profile.stackLevel) {
        this.stackLevelControl.setValue(chargingProfile.profile.stackLevel);
      }
      if (chargingProfile.profile.chargingSchedule.startSchedule) {
        this.startSchedule = chargingProfile.profile.chargingSchedule.startSchedule;
      }
      if (chargingProfile.profile.chargingSchedule.chargingSchedulePeriod) {
        let slot: Slot = {
          key:'',
          id : 0,
          displayedStartValue: new Date(this.startSchedule),
          duration : chargingProfile.profile.chargingSchedule.chargingSchedulePeriod[1].startPeriod/60,
          limit : chargingProfile.profile.chargingSchedule.chargingSchedulePeriod[0].limit,
          displayedLimitInkW: ChargingStations.convertAmpToW(this.charger.numberOfConnectedPhase ? this.charger.numberOfConnectedPhase: 0, chargingProfile.profile.chargingSchedule.chargingSchedulePeriod[0].limit/1000),
        };
        this.slotsSchedule.push(slot)
        for(let i = 1; i < chargingProfile.profile.chargingSchedule.chargingSchedulePeriod.length; i++){
          let slot: Slot = {
            key:'',
            id : i,
            displayedStartValue: new Date(this.startSchedule),
            duration : 0,
            limit : chargingProfile.profile.chargingSchedule.chargingSchedulePeriod[i].limit,
            displayedLimitInkW: ChargingStations.convertAmpToW(this.charger.numberOfConnectedPhase ? this.charger.numberOfConnectedPhase: 0 , chargingProfile.profile.chargingSchedule.chargingSchedulePeriod[i].limit/1000),
          };
          if(chargingProfile.profile.chargingSchedule.chargingSchedulePeriod[i+1]){
            slot.duration = (chargingProfile.profile.chargingSchedule.chargingSchedulePeriod[i+1].startPeriod - chargingProfile.profile.chargingSchedule.chargingSchedulePeriod[i].startPeriod)/60;
          }
          slot.displayedStartValue.setSeconds(slot.displayedStartValue.getSeconds() + chargingProfile.profile.chargingSchedule.chargingSchedulePeriod[i].startPeriod)
          this.slotsSchedule.push(slot)
        }
        this.chargingPeriodListTableDataSource.setContent(this.slotsSchedule);
        this.limitChartPlannerComponent.setLimitPlannerData(this.slotsSchedule);
      }
    }
    }, (error) => {
      // Hide
      this.spinnerService.hide();
      // Handle error
      switch (error.status) {
        // Not found
        case 550:
          // Transaction not found`
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'chargingProfile not found');
          break;
        default:
          // Unexpected error`
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'general.unexpected_error_backend');
      }
    });
  }



  // changeSlotDuration(value: number, slot: DisplayedScheduleSlot) {
  //   // update current slot end date
  //   slot.slot.end = new Date(slot.slot.start.getTime() + value * 1000);
  //   slot.displayedEndValue = this.buildDisplayDateTimePickerValue(slot.slot.end);
  //   slot.duration = value;
  //   // update next slots start date
  //   for (let index = slot.id + 1; index < this.slotsSchedule.length; index++) {
  //     const slotSchedule = this.slotsSchedule[index];
  //     slotSchedule.slot.start = this.slotsSchedule[index - 1].slot.end;
  //     slotSchedule.slot.end = new Date(this.slotsSchedule[index - 1].slot.end.getTime() + slotSchedule.duration * 1000);
  //     slotSchedule.displayedStartValue = this.buildDisplayDateTimePickerValue(slotSchedule.slot.start);
  //     slotSchedule.displayedEndValue = this.buildDisplayDateTimePickerValue(slotSchedule.slot.end);
  //   }
  //   this.limitChartPlannerComponent.setLimitPlannerData(this.slotsSchedule);
  // }


    // onChanges(): void {
    //   this.formGroup.valueChanges.subscribe(val => {

    //     if (this.chargingPeriodListTableDataSource.data.length > 0) {

    //       this.slotsSchedule = [];

    //       let slot: Slot = {
    //         id : 0,
    //         displayedStartValue: new Date(this.chargingPeriodListTableDataSource.data[0].displayedStartValue),
    //         duration : this.chargingPeriodListTableDataSource.data[1].displayedStartValue.getTime()- this.chargingPeriodListTableDataSource.data[0].displayedStartValue.getTime(),
    //         limit : this.chargingPeriodListTableDataSource.data[0].limit,
    //         displayedLimitInkW: ChargingStations.convertAmpToW(3, this.chargingPeriodListTableDataSource.data[0].limit) * this.charger.connectors.length,
    //       };
    //       this.slotsSchedule.push(slot)
    //       for(let i = 1; i < this.chargingPeriodListTableDataSource.data.length; i++){
    //         let slot: Slot = {
    //           id : i,
    //           displayedStartValue: new Date(this.chargingPeriodListTableDataSource.data[i].displayedStartValue),
    //           duration : 0,
    //           limit : this.chargingPeriodListTableDataSource.data[i].limit,
    //           displayedLimitInkW: ChargingStations.convertAmpToW(3, this.chargingPeriodListTableDataSource.data[i].limit) * this.charger.connectors.length,
    //         };
    //         if(this.chargingPeriodListTableDataSource.data[i+1]){
    //           slot.duration = (this.chargingPeriodListTableDataSource.data[i+1].displayedStartValue.getTime() - this.chargingPeriodListTableDataSource.data[i].displayedStartValue.getTime())/60;
    //         }
    //         this.slotsSchedule.push(slot)
    //       }
    //       this.chargingPeriodListTableDataSource.setContent(this.slotsSchedule);
    //     }
    //   });
    // }


  clearChargingProfile() {
    // show yes/no dialog
    const self = this;
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('chargers.smart_charging.power_limit_plan_title'),
      this.translateService.instant('chargers.smart_charging.power_limit_plan_clear', { chargeBoxID: this.charger.id }),
    ).subscribe((result) => {
      if (result === Constants.BUTTON_TYPE_YES) {
        try {
          // call REST service
          this.centralServerService.deleteChargingProfile(this.charger.id).subscribe((response) => {
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
          console.log(error);
          Utils.handleError(JSON.stringify(error),
            this.messageService, this.translateService.instant('chargers.smart_charging.power_limit_error'));
        }
        this.slotsSchedule = [];
        this.chargingPeriodListTableDataSource.setContent(this.slotsSchedule);
      }
    }
    );
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
          const chargingProfile = this._buildProfile();
          // call REST service
          this.centralServerService.updateChargingProfile(chargingProfile).subscribe((response) => {
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
          console.log(error);
          Utils.handleError(JSON.stringify(error),
            this.messageService, this.translateService.instant('chargers.smart_charging.power_limit_error'));
        }
      }
    });
  }


  public _buildProfile() {
    this.chargingPeriodListTableDataSource.refreshData()
    const chargingProfile = {} as ChargingProfile;
    chargingProfile.profile = {} as Profile;
    chargingProfile.chargingStationID = this.charger.id;
    if (this.profileIdControl.value > 0 && this.profileIdControl.value <= 10) {
      chargingProfile.profile.chargingProfileId = this.profileIdControl.value;
    } else {
      throw new Error('Invalid profile Id');
    }
    if (this.stackLevelControl.value > 0 && this.stackLevelControl.value <= 10) {
      chargingProfile.profile.stackLevel = this.stackLevelControl.value;
    } else {
      throw new Error('Invalid stack level');
    }
    chargingProfile.profile.chargingProfilePurpose = ChargingProfilePurposeType.TX_DEFAULT_PROFILE;
    chargingProfile.profile.chargingProfileKind = ChargingProfileKindType.ABSOLUTE;
    // // set profile type
    // if (this.profileTypeControl.value === PROFILE_TYPE_MAP[1].key || this.profileTypeControl.value === PROFILE_TYPE_MAP[2].key) {

    //   profile.recurrencyKind = this.profileTypeControl.value;
    // } else {
    //   if (this.profileTypeControl.value) {
    //     profile.chargingProfileKind = this.profileTypeControl.value;
    //   } else {
    //     throw new Error('Invalid profile type');
    //   }
    // }
    // build charging schedule header
    chargingProfile.profile.chargingSchedule = {} as ChargingSchedule;
    if (this.durationControl.value > 0) {
      chargingProfile.profile.chargingSchedule.duration = this.durationControl.value;
    }

    chargingProfile.profile.chargingSchedule.chargingRateUnit = this.powerUnit;

    // build schedule
    const startOfSchedule = this.chargingPeriodListTableDataSource.data[0].displayedStartValue;
    chargingProfile.profile.chargingSchedule.startSchedule = startOfSchedule;
    chargingProfile.profile.chargingSchedule.chargingSchedulePeriod = [];

    for (const slot of this.chargingPeriodListTableDataSource.data) {

      const period = {} as ChargingSchedulePeriod;
      period.startPeriod = Math.round((slot.displayedStartValue.getTime() - startOfSchedule.getTime()) / 1000);
      if (period.startPeriod >= 0) {
        period.limit = slot.limit;
        chargingProfile.profile.chargingSchedule.chargingSchedulePeriod.push(period);
      } else {
        throw new Error('Invalid schedule');
      }
    }
    return chargingProfile;
  }

  private buildDisplayDateTimePickerValue(date: Date) {
    // tslint:disable-next-line:max-line-length
    const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1)}-${(date.getDate() < 10 ? '0' + date.getDate() : date.getDate())}T${(date.getHours() < 10 ? '0' + date.getHours() : date.getHours())}:${(date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())}`;
    return date;
  }

  private getDisplayedLimit(value: number) {
    // TODO: To handle numberOfConnectedPhase per connector now
    // if (this.powerUnit === Constants.OCPP_UNIT_AMPER) {
    //   return ChargingStations.convertAmpToW(this.charger.numberOfConnectedPhase, value);
    // } else {
    //   return value;
    // }
    return value;
  }

}
