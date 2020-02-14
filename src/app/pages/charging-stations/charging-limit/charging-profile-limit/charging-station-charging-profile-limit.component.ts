import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { ChargingProfile, ChargingProfileKindType, ChargingProfilePurposeType, ChargingSchedule, ChargingSchedulePeriod, Profile, RecurrencyKindType, Slot } from 'app/types/ChargingProfile';
import { ChargingStation, PowerLimitUnits } from 'app/types/ChargingStation';
import { RestResponse } from 'app/types/GlobalType';
import { HTTPError } from 'app/types/HTTPError';
import { ButtonType, TableEditType } from 'app/types/Table';
import { ChargingStations } from 'app/utils/ChargingStations';
import { Utils } from 'app/utils/Utils';
import * as moment from 'moment';
import { ChargingStationSmartChargingLimitPlannerChartComponent } from './charging-station-charging-profile-limit-chart.component';
import { ChargingStationChargingProfileLimitSlotTableDataSource } from './charging-station-charging-profile-limit-slot-table-data-source';

export const PROFILE_TYPE_MAP =
  [
    { key: ChargingProfileKindType.ABSOLUTE, description: 'chargers.smart_charging.profile_types.absolute', stackLevel: 3, id: 3 },
    { key: ChargingProfileKindType.RECURRING, description: 'chargers.smart_charging.profile_types.recurring_daily', stackLevel: 2, id: 2 },
    // { key: RecurrencyKindType.WEEKLY, description: 'chargers.smart_charging.profile_types.recurring_weekly', stackLevel: 1, id: 1 },
  ];

@Component({
  selector: 'app-charging-station-charging-profile-limit',
  templateUrl: 'charging-station-charging-profile-limit.component.html',
  providers: [ChargingStationChargingProfileLimitSlotTableDataSource],
})

export class ChargingStationChargingProfileLimitComponent implements OnInit, AfterViewInit {
  @Input() charger!: ChargingStation;
  @ViewChild('limitChart', { static: true }) limitChartPlannerComponent!: ChargingStationSmartChargingLimitPlannerChartComponent;
  public profileTypeMap = PROFILE_TYPE_MAP;
  public powerUnit!: PowerLimitUnits;
  public slotsSchedule!: Slot[];
  public formGroup!: FormGroup;
  public profileTypeControl!: AbstractControl;
  public chargingProfilesControl!: AbstractControl;
  public startDateControl!: AbstractControl;
  public stackLevel!: number;
  public profileId!: number;
  public chargingProfilePurpose!: ChargingProfilePurposeType;
  public chargingSlots!: FormArray;
  public startSchedule!: Date;
  public chargingProfiles: ChargingProfile[] = [];
  public  = false;

  constructor(
    public slotTableDataSource: ChargingStationChargingProfileLimitSlotTableDataSource,
    private translateService: TranslateService,
    private router: Router,
    private dialogService: DialogService,
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
  ) {

  }

  ngOnInit(): void {
    // Init the form
    this.formGroup = new FormGroup({
      profileTypeControl: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      chargingProfilesControl: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      startDateControl: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      chargingSlots: new FormArray([],
        Validators.compose([
          Validators.required,
        ])),
    });
    // Form controls
    this.profileTypeControl = this.formGroup.controls['profileTypeControl'];
    this.chargingProfilesControl = this.formGroup.controls['chargingProfilesControl'];
    this.startDateControl = this.formGroup.controls['startDateControl'];
    this.chargingSlots = this.formGroup.controls['chargingSlots'] as FormArray;
    // Default values
    this.powerUnit = PowerLimitUnits.AMPERE;
    this.slotsSchedule = [];
    this.stackLevel = 3;
    this.profileId = 3;
    // @ts-ignore
    this.startSchedule = moment().add(1, 'day').startOf('day').toDate();
    this.slotTableDataSource.startDate = this.startSchedule;
    this.profileTypeControl.setValue(ChargingProfileKindType.ABSOLUTE);
    // Assign for to editable data source
    this.slotTableDataSource.setFormArray(this.chargingSlots);
    // Initial values
    this.slotTableDataSource.setCharger(this.charger);
    this.limitChartPlannerComponent.setLimitPlannerData([]);
    // Change the Profile
    this.chargingProfilesControl.valueChanges.subscribe((chargingProfile: ChargingProfile) => {
      // Load Profile
      this.loadProfile(chargingProfile);
    });
    // Change the Profile Type
    this.profileTypeControl.valueChanges.subscribe(() => {
      // Set values
      // @ts-ignore
      this.stackLevel = PROFILE_TYPE_MAP.find((mapElement) => mapElement.key === this.profileTypeControl.value).stackLevel;
      // @ts-ignore
      this.profileId = PROFILE_TYPE_MAP.find((mapElement) => mapElement.key === this.profileTypeControl.value).id;
      // Change date format
      if (this.profileTypeControl.value === ChargingProfileKindType.ABSOLUTE) {
        this.slotTableDataSource.tableColumnDefs[0].editType = TableEditType.DISPLAY_ONLY_DATE;
      } else {
        this.slotTableDataSource.tableColumnDefs[0].editType = TableEditType.DISPLAY_ONLY_TIME;
      }
    });
    // Change the Slots/Schedules
    this.slotTableDataSource.getTableChangedSubject().subscribe((chargingSlots: Slot[]) => {
      // Update Chart
      this.limitChartPlannerComponent.setLimitPlannerData(chargingSlots);
    });
  }

  public refresh() {
    this.loadChargingProfiles();
  }

  ngAfterViewInit() {
    // Load
    this.loadChargingProfiles();
  }

  public startDateFilterChanged(value: Date) {
    this.slotTableDataSource.startDate = value;
    this.slotTableDataSource.refreshChargingSlots();
  }

  public loadChargingProfiles() {
    if (!this.charger) {
      return;
    }
    this.spinnerService.show();
    this.centralServerService.getChargingProfiles(this.charger.id).subscribe((chargingProfilesResult) => {
      this.spinnerService.hide();
      this.formGroup.markAsPristine();
      // Set
      this.chargingProfiles = chargingProfilesResult.result;
      // Default
      this.slotTableDataSource.setContent([]);
      this.limitChartPlannerComponent.setLimitPlannerData([]);
      // Init
      if (chargingProfilesResult.count > 0) {
        if (this.chargingProfilesControl.value) {
          // Find the same ID
          const selectedChargingProfile = this.chargingProfiles.find((chargingProfile: ChargingProfile) =>
            chargingProfile.id === this.chargingProfilesControl.value.id);
          if (selectedChargingProfile) {
            // Found: Reset the current one
            this.chargingProfilesControl.setValue(selectedChargingProfile);
          } else {
            // Not Found: Set the first one
            this.chargingProfilesControl.setValue(this.chargingProfiles[0]);
          }
        } else {
          // Set the first one
          this.chargingProfilesControl.setValue(this.chargingProfiles[0]);
        }
        // TODO: Check if Site Area Smart Charging is enabled to switch in r/o (later on)
        if (this.chargingProfiles.length > 1) {
          // Make table read only
          this.slotTableDataSource.tableDef.isEditable = false;
          this.slotTableDataSource.tableRowActionsDef = [];
          this.slotTableDataSource.hasActions = false;
          this.slotTableDataSource.hasRowActions = false;
          this.slotTableDataSource.tableColumnDefs[2].isAngularComponent = false;
          this.slotTableDataSource.tableColumnDefs[2].id = 'limitInkW';
          this.profileTypeControl.disable();
          this.startDateControl.disable();
        }
      }
    }, (error) => {
      this.spinnerService.hide();
      // Unexpected error`
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.unexpected_error_backend');
    });
  }

  public loadProfile(chargingProfile: ChargingProfile) {
    this.slotsSchedule = [];
    if (chargingProfile) {
      // Init values
      if (chargingProfile.profile.chargingProfileKind) {
        this.formGroup.controls.profileTypeControl.setValue(chargingProfile.profile.chargingProfileKind);
      }
      if (chargingProfile.profile.chargingProfileId) {
        this.profileId = chargingProfile.profile.chargingProfileId;
      }
      if (chargingProfile.profile.chargingProfilePurpose) {
        this.chargingProfilePurpose = chargingProfile.profile.chargingProfilePurpose;
      }
      if (chargingProfile.profile.stackLevel) {
        this.stackLevel = chargingProfile.profile.stackLevel;
      }
      if (chargingProfile.profile.chargingSchedule.startSchedule) {
        this.startSchedule = new Date(chargingProfile.profile.chargingSchedule.startSchedule);
      }
      if (chargingProfile.profile.chargingProfileKind !== ChargingProfileKindType.ABSOLUTE) {
        this.slotTableDataSource.tableColumnDefs[1].editType = TableEditType.DISPLAY_ONLY_TIME;
      }
      this.slotTableDataSource.startDate = this.startSchedule;
      // Create Slot
      for (let i = 0; i < chargingProfile.profile.chargingSchedule.chargingSchedulePeriod.length; i++) {
        const chargingSchedule = chargingProfile.profile.chargingSchedule.chargingSchedulePeriod[i];
        // Current Slot
        const slot: Slot = {
          key: '',
          id: 0,
          startDate: new Date(this.startSchedule),
          duration: chargingProfile.profile.chargingSchedule.duration ? chargingProfile.profile.chargingSchedule.duration / 60 : 0,
          limit: chargingSchedule.limit,
          limitInkW: ChargingStations.convertAmpToW(
            this.charger.connectors[0].numberOfConnectedPhase ? this.charger.connectors[0].numberOfConnectedPhase : 0,
            chargingSchedule.limit) / 1000,
        };
        // Next Slot?
        if (chargingProfile.profile.chargingSchedule.chargingSchedulePeriod[i + 1]) {
          slot.duration = (chargingProfile.profile.chargingSchedule.chargingSchedulePeriod[i + 1].startPeriod
            - chargingSchedule.startPeriod) / 60;
        }
        // Set Start Date
        slot.startDate.setSeconds(this.startSchedule.getSeconds() + chargingSchedule.startPeriod);
        // Add
        this.slotsSchedule.push(slot);
      }
      // Limit the last slot with the total duration
      if (chargingProfile.profile.chargingSchedule.duration) {
        this.slotsSchedule[this.slotsSchedule.length - 1].duration = (this.startSchedule.getTime() / 1000
          + chargingProfile.profile.chargingSchedule.duration
          - this.slotsSchedule[this.slotsSchedule.length - 1].startDate.getTime() / 1000) / 60;
      }
      // Set Slot Table content
      this.slotTableDataSource.setContent(this.slotsSchedule);
      // Set Chart
      this.limitChartPlannerComponent.setLimitPlannerData(this.slotsSchedule);
    }
  }

  public deleteChargingProfile() {
    // Show yes/no dialog
    const self = this;
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('chargers.smart_charging.clear_profile_title'),
      this.translateService.instant('chargers.smart_charging.clear_profile_confirm', { chargeBoxID: this.charger.id }),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        this.spinnerService.show();
        this.centralServerService.deleteChargingProfile(this.charger.id).subscribe((response) => {
          this.spinnerService.hide();
          if (response.status === RestResponse.SUCCESS) {
            // Success + Reload
            this.messageService.showSuccessMessage(this.translateService.instant('chargers.smart_charging.clear_profile_success',
              { chargeBoxID: self.charger.id, power: 'plan' }));
            this.refresh();
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, this.translateService.instant('chargers.smart_charging.clear_profile_error'));
          }
        }, (error: any) => {
          this.spinnerService.hide();
          if (error.status === HTTPError.SET_CHARGING_PROFILE_ERROR) {
            Utils.handleHttpError(
              error, this.router, this.messageService, this.centralServerService, 'chargers.smart_charging.clear_profile_not_accepted', { chargeBoxID: self.charger.id });
          } else {
            Utils.handleHttpError(
              error, this.router, this.messageService, this.centralServerService, 'chargers.smart_charging.clear_profile_error');
          }
        });
      }
    });
  }

  public saveAndApplyChargingProfile() {
    // show yes/no dialog
    const self = this;
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('chargers.smart_charging.power_limit_plan_title'),
      this.translateService.instant('chargers.smart_charging.power_limit_plan_confirm', { chargeBoxID: this.charger.id }),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        // Build charging profile
        const chargingProfile = this.buildChargingProfile();
        this.spinnerService.show();
        this.centralServerService.updateChargingProfile(chargingProfile).subscribe((response) => {
          this.spinnerService.hide();
          if (response.status === RestResponse.SUCCESS) {
            // Success + Reload
            this.messageService.showSuccessMessage(
              this.translateService.instant('chargers.smart_charging.power_limit_plan_success',
                { chargeBoxID: self.charger.id, power: 'plan' }));
            this.refresh();
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, this.translateService.instant('chargers.smart_charging.power_limit_plan_error'));
          }
        }, (error) => {
          this.spinnerService.hide();
          if (error.status === HTTPError.SET_CHARGING_PROFILE_ERROR) {
            Utils.handleHttpError(
              error, this.router, this.messageService, this.centralServerService, 'chargers.smart_charging.power_limit_plan_not_accepted', { chargeBoxID: self.charger.id });
          } else {
            Utils.handleHttpError(
              error, this.router, this.messageService, this.centralServerService, 'chargers.smart_charging.power_limit_plan_error');
          }
        });
      }
    });
  }

  private buildChargingProfile(): ChargingProfile {
    // Instantiate new charging profile
    const chargingProfile = {} as ChargingProfile;
    chargingProfile.profile = {} as Profile;
    chargingProfile.profile.chargingSchedule = {} as ChargingSchedule;
    // Set charging station ID and ConnectorID 0 for whole station
    chargingProfile.chargingStationID = this.charger.id;
    chargingProfile.connectorID = 0;
    chargingProfile.profile.chargingProfileId = this.profileId;
    chargingProfile.profile.stackLevel = this.stackLevel;
    chargingProfile.profile.chargingProfilePurpose = ChargingProfilePurposeType.TX_DEFAULT_PROFILE;
    // Set profile type
    if (this.profileTypeControl.value === PROFILE_TYPE_MAP[1].key) {
      chargingProfile.profile.recurrencyKind = RecurrencyKindType.DAILY;
      chargingProfile.profile.chargingProfileKind = ChargingProfileKindType.RECURRING;
    } else {
      chargingProfile.profile.chargingProfileKind = ChargingProfileKindType.ABSOLUTE;
    }
    // Set power unit
    chargingProfile.profile.chargingSchedule.chargingRateUnit = this.powerUnit;
    // Build schedule
    // Set start date
    const startOfSchedule = new Date(this.slotTableDataSource.data[0].startDate);
    chargingProfile.profile.chargingSchedule.startSchedule = startOfSchedule;
    // Instantiate chargingSchedulePeriods
    chargingProfile.profile.chargingSchedule.chargingSchedulePeriod = [];
    // Helper for duration
    let duration = 0;
    for (const slot of this.slotTableDataSource.getContent()) {
      const period = {} as ChargingSchedulePeriod;
      const startOfPeriod = new Date(slot.startDate);
      period.startPeriod = Math.round((startOfPeriod.getTime() - startOfSchedule.getTime()) / 1000);
      period.limit = slot.limit;
      chargingProfile.profile.chargingSchedule.chargingSchedulePeriod.push(period);
      duration = duration + slot.duration * 60;
    }
    // Set duration
    chargingProfile.profile.chargingSchedule.duration = duration;
    return chargingProfile;
  }
}
