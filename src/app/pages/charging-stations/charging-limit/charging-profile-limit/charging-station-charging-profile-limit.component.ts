import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { ChargingProfile, ChargingProfileKindType, ChargingProfilePurposeType, ChargingSchedule, ChargingSchedulePeriod, Profile, RecurrencyKindType, Schedule } from 'app/types/ChargingProfile';
import { ChargingStation, PowerLimitUnits } from 'app/types/ChargingStation';
import { RestResponse } from 'app/types/GlobalType';
import { HTTPError } from 'app/types/HTTPError';
import { ButtonType, TableEditType } from 'app/types/Table';
import { ChargingStations } from 'app/utils/ChargingStations';
import { Utils } from 'app/utils/Utils';
import { ChargingStationSmartChargingLimitPlannerChartComponent } from './charging-station-charging-profile-limit-chart.component';
import { ChargingStationChargingProfileLimitScheduleEditableTableDataSource } from './charging-station-charging-profile-limit-schedule-editable-table-data-source';
import { ChargingStationChargingProfileLimitScheduleTableDataSource } from './charging-station-charging-profile-limit-schedule-table-data-source';

interface ProfileType {
  key: string;
  description: string;
  stackLevel: number;
  profileId: number;
}

@Component({
  selector: 'app-charging-station-charging-profile-limit',
  templateUrl: 'charging-station-charging-profile-limit.component.html',
  providers: [
    ChargingStationChargingProfileLimitScheduleEditableTableDataSource,
    ChargingStationChargingProfileLimitScheduleTableDataSource,
  ],
})
export class ChargingStationChargingProfileLimitComponent implements OnInit, AfterViewInit {
  @Input() charger!: ChargingStation;
  @ViewChild('limitChart', { static: true }) limitChartPlannerComponent!: ChargingStationSmartChargingLimitPlannerChartComponent;
  public profileTypeMap: ProfileType[] = [
    { key: ChargingProfileKindType.ABSOLUTE, description: 'chargers.smart_charging.profile_types.absolute', stackLevel: 3, profileId: 3 },
    { key: ChargingProfileKindType.RECURRING, description: 'chargers.smart_charging.profile_types.recurring_daily', stackLevel: 2, profileId: 2 },
    // { key: RecurrencyKindType.WEEKLY, description: 'chargers.smart_charging.profile_types.recurring_weekly', stackLevel: 1, profileId: 1 },
  ];
  public formGroup!: FormGroup;
  public profileTypeControl!: AbstractControl;
  public chargingProfilesControl!: AbstractControl;
  public startDateControl!: AbstractControl;
  public endDateControl!: AbstractControl;
  public chargingSchedules!: FormArray;
  public chargingProfiles: ChargingProfile[] = [];

  constructor(
    public scheduleTableDataSource: ChargingStationChargingProfileLimitScheduleTableDataSource,
    public scheduleEditableTableDataSource: ChargingStationChargingProfileLimitScheduleEditableTableDataSource,
    private translateService: TranslateService,
    private router: Router,
    private dialogService: DialogService,
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
  ) {}

  ngOnInit(): void {
    // Init the form
    this.formGroup = new FormGroup({
      profileTypeControl: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      chargingProfilesControl: new FormControl(''),
      startDateControl: new FormControl('',
        Validators.compose([
          Validators.required,
          this.validateDateInFuture,
        ])),
      endDateControl: new FormControl('',
        Validators.compose([
          this.validateDateInFuture,
        ])),
      schedules: new FormArray([],
        Validators.compose([
          Validators.required,
        ])),
    });
    // Form controls
    this.profileTypeControl = this.formGroup.controls['profileTypeControl'];
    this.chargingProfilesControl = this.formGroup.controls['chargingProfilesControl'];
    this.startDateControl = this.formGroup.controls['startDateControl'];
    this.endDateControl = this.formGroup.controls['endDateControl'];
    this.chargingSchedules = this.formGroup.controls['schedules'] as FormArray;
    // @ts-ignore
    this.startDateControl.setValue(moment().add(1, 'day').startOf('day').toDate());
    this.scheduleEditableTableDataSource.startDate = this.startDateControl.value as Date;
    this.profileTypeControl.setValue(this.profileTypeMap[0]);
    // Assign for to editable data source
    this.scheduleEditableTableDataSource.setFormArray(this.chargingSchedules);
    // Initial values
    this.scheduleEditableTableDataSource.setCharger(this.charger);
    this.limitChartPlannerComponent.setLimitPlannerData([]);
    // Change the Profile
    this.chargingProfilesControl.valueChanges.subscribe((chargingProfile: ChargingProfile) => {
      // Load Profile
      this.loadProfile(chargingProfile);
    });
    // Change the Profile Type
    this.profileTypeControl.valueChanges.subscribe((profileType: ProfileType) => {
      // Change date format
      if (profileType.key !== ChargingProfileKindType.ABSOLUTE) {
        this.scheduleEditableTableDataSource.tableColumnDefs[0].editType = TableEditType.DISPLAY_ONLY_TIME;
      } else {
        this.scheduleEditableTableDataSource.tableColumnDefs[0].editType = TableEditType.DISPLAY_ONLY_DATE;
      }
    });
    // Change the Slots/Schedules
    this.scheduleEditableTableDataSource.getTableChangedSubject().subscribe((schedules: Schedule[]) => {
      // Update Chart
      this.limitChartPlannerComponent.setLimitPlannerData(schedules);
      // Refresh end date
      this.scheduleEditableTableDataSource.refreshChargingSchedules();
      this.endDateControl.setValue(this.scheduleEditableTableDataSource.endDate);
      this.formGroup.markAsDirty();
    });
  }

  ngAfterViewInit() {
    this.refresh();
  }

  public validateDateInFuture(control: AbstractControl): ValidationErrors|null {
    // Check
    // @ts-ignore
    if (!control.value || (Utils.isValidDate(control.value) && moment(control.value).isAfter(new Date()))) {
        // Ok
      return null;
    }
    return { dateNotInFuture: true };
  }

  public refresh() {
    this.loadChargingProfiles();
  }

  public startDateFilterChanged(value: Date) {
    this.scheduleEditableTableDataSource.startDate = new Date(value);
    this.scheduleEditableTableDataSource.refreshChargingSchedules();
    this.endDateControl.setValue(this.scheduleEditableTableDataSource.endDate);
  }

  public loadChargingStation() {
    // Show spinner
    this.spinnerService.show();
  }

  public loadChargingProfiles() {
    if (!this.charger) {
      return;
    }
    this.spinnerService.show();
    this.centralServerService.getCharger(this.charger.id).subscribe((charger) => {
      // Update charger
      this.charger = charger;
      this.scheduleEditableTableDataSource.setCharger(this.charger);
      this.centralServerService.getChargingProfiles(this.charger.id).subscribe((chargingProfilesResult) => {
        this.spinnerService.hide();
        this.formGroup.markAsPristine();
        // Set Profile
        this.chargingProfiles = chargingProfilesResult.result;
        // Default
        this.scheduleEditableTableDataSource.setContent([]);
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
        }
      }, (error) => {
        this.spinnerService.hide();
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.unexpected_error_backend');
      });
    }, (error) => {
      this.spinnerService.hide();
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.unexpected_error_backend');
  });
  }

  private loadProfile(chargingProfile: ChargingProfile) {
    const schedules: Schedule[] = [];
    if (chargingProfile) {
      // Init values
      if (chargingProfile.profile.chargingProfileKind) {
        this.formGroup.controls.profileTypeControl.setValue(chargingProfile.profile.chargingProfileKind);
      }
      if (chargingProfile.profile.chargingProfileKind) {
        // Set
        const foundProfileType = this.profileTypeMap.find((profileType) => profileType.key === chargingProfile.profile.chargingProfileKind);
        if (foundProfileType) {
          this.profileTypeControl.setValue(foundProfileType);
        }
      }
      if (chargingProfile.profile.chargingSchedule.startSchedule) {
        this.startDateControl.setValue(new Date(chargingProfile.profile.chargingSchedule.startSchedule));
        this.scheduleEditableTableDataSource.startDate = this.startDateControl.value as Date;
      }
      // Create Schedule
      for (let i = 0; i < chargingProfile.profile.chargingSchedule.chargingSchedulePeriod.length; i++) {
        const chargingSchedule = chargingProfile.profile.chargingSchedule.chargingSchedulePeriod[i];
        // Current Schedule
        const schedule: Schedule = {
          key: '',
          id: 0,
          startDate: new Date (this.scheduleEditableTableDataSource.startDate),
          duration: chargingProfile.profile.chargingSchedule.duration ? chargingProfile.profile.chargingSchedule.duration / 60 : 0,
          limit: chargingSchedule.limit,
          limitInkW: ChargingStations.convertAmpToW(
            this.charger.connectors[0].numberOfConnectedPhase ? this.charger.connectors[0].numberOfConnectedPhase : 0,
            chargingSchedule.limit) / 1000,
        };
        // Next Schedule?
        if (chargingProfile.profile.chargingSchedule.chargingSchedulePeriod[i + 1]) {
          schedule.duration = (chargingProfile.profile.chargingSchedule.chargingSchedulePeriod[i + 1].startPeriod
            - chargingSchedule.startPeriod) / 60;
        }
        // Set Start Date
        schedule.startDate.setSeconds(schedule.startDate.getSeconds() + chargingSchedule.startPeriod);
        // Add
        schedules.push(schedule);
        // Set Schedule
        this.scheduleTableDataSource.setChargingProfileSchedule(schedules);
      }
      if (chargingProfile.profile.chargingSchedule.duration) {
        // Limit the last schedule with the total duration
        schedules[schedules.length - 1].duration = (this.scheduleEditableTableDataSource.startDate.getTime() / 1000
          + chargingProfile.profile.chargingSchedule.duration
          - schedules[schedules.length - 1].startDate.getTime() / 1000) / 60;
        // Set end date
        this.endDateControl.setValue(new Date(this.scheduleEditableTableDataSource.startDate.getTime() +
          chargingProfile.profile.chargingSchedule.duration * 1000));
      }
      // Set Schedule Table content
      this.scheduleEditableTableDataSource.setContent(schedules);
      // Set Chart
      this.limitChartPlannerComponent.setLimitPlannerData(schedules);
    }
  }

  public deleteChargingProfile() {
    // Show yes/no dialog
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('chargers.smart_charging.clear_profile_title'),
      this.translateService.instant('chargers.smart_charging.clear_profile_confirm', { chargeBoxID: this.charger.id }),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        // Build charging profile
        const chargingProfile = this.buildChargingProfile();
        this.spinnerService.show();
        this.centralServerService.deleteChargingProfile(chargingProfile.id).subscribe((response) => {
          this.spinnerService.hide();
          if (response.status === RestResponse.SUCCESS) {
            // Success + Reload
            this.messageService.showSuccessMessage(this.translateService.instant('chargers.smart_charging.f',
              { chargeBoxID: this.charger.id }));
            this.refresh();
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, this.translateService.instant('chargers.smart_charging.clear_profile_error'));
          }
        }, (error: any) => {
          this.spinnerService.hide();
          if (error.status === HTTPError.SET_CHARGING_PROFILE_ERROR) {
            Utils.handleHttpError(
              error, this.router, this.messageService, this.centralServerService,
              this.translateService.instant('chargers.smart_charging.clear_profile_not_accepted',
              { chargeBoxID: this.charger.id }));
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
                { chargeBoxID: this.charger.id }));
            this.refresh();
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, this.translateService.instant('chargers.smart_charging.power_limit_plan_error'));
          }
        }, (error) => {
        this.spinnerService.hide();
        if (error.status === HTTPError.SET_CHARGING_PROFILE_ERROR) {
            Utils.handleHttpError(
              error, this.router, this.messageService, this.centralServerService,
              this.translateService.instant('chargers.smart_charging.power_limit_plan_not_accepted',
              { chargeBoxID: this.charger.id }));
          } else {
            Utils.handleHttpError(
              error, this.router, this.messageService, this.centralServerService,
              this.translateService.instant('chargers.smart_charging.power_limit_plan_error'));
          }
        });
      }
    });
  }

  private buildChargingProfile(): ChargingProfile {
    // Instantiate new charging profile
    const chargingProfile = {} as ChargingProfile;
    chargingProfile.chargingStationID = this.charger.id;
    // Set charging station ID and ConnectorID 0 for whole station
    if (this.chargingProfilesControl.value) {
      // Use selected
      const selectedChargingProfile = this.chargingProfilesControl.value as ChargingProfile;
      chargingProfile.id = selectedChargingProfile.id;
      chargingProfile.connectorID = selectedChargingProfile.connectorID;
    } else {
      // Default
      chargingProfile.connectorID = 0;
    }
    chargingProfile.profile = {} as Profile;
    chargingProfile.profile.chargingSchedule = {} as ChargingSchedule;
    const profileType: ProfileType = this.profileTypeControl.value as ProfileType;
    chargingProfile.profile.chargingProfileId = profileType.profileId;
    chargingProfile.profile.stackLevel = profileType.stackLevel;
    chargingProfile.profile.chargingProfilePurpose = ChargingProfilePurposeType.TX_DEFAULT_PROFILE;
    // Set profile type
    if (this.profileTypeControl.value === this.profileTypeMap[1].key) {
      chargingProfile.profile.recurrencyKind = RecurrencyKindType.DAILY;
      chargingProfile.profile.chargingProfileKind = ChargingProfileKindType.RECURRING;
    } else {
      chargingProfile.profile.chargingProfileKind = ChargingProfileKindType.ABSOLUTE;
    }
    // Set power unit
    chargingProfile.profile.chargingSchedule.chargingRateUnit = PowerLimitUnits.AMPERE;
    // Build schedule
    // Set start date
    const startOfSchedule = new Date(this.scheduleEditableTableDataSource.data[0].startDate);
    chargingProfile.profile.chargingSchedule.startSchedule = startOfSchedule;
    // Instantiate chargingSchedulePeriods
    chargingProfile.profile.chargingSchedule.chargingSchedulePeriod = [];
    // Helper for duration
    let duration = 0;
    for (const schedule of this.scheduleEditableTableDataSource.getContent()) {
      const period = {} as ChargingSchedulePeriod;
      const startOfPeriod = new Date(schedule.startDate);
      period.startPeriod = Math.round((startOfPeriod.getTime() - startOfSchedule.getTime()) / 1000);
      period.limit = schedule.limit;
      chargingProfile.profile.chargingSchedule.chargingSchedulePeriod.push(period);
      duration = duration + schedule.duration * 60;
    }
    // Set duration
    chargingProfile.profile.chargingSchedule.duration = duration;
    return chargingProfile;
  }
}
