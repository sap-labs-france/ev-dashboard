import { AfterViewInit, Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { debounceTime } from 'rxjs/operators';

import { CentralServerNotificationService } from '../../../../services/central-server-notification.service';
import { CentralServerService } from '../../../../services/central-server.service';
import { ComponentService } from '../../../../services/component.service';
import { ConfigService } from '../../../../services/config.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { AppDatePipe } from '../../../../shared/formatters/app-date.pipe';
import { TableNavigateToLogsAction } from '../../../../shared/table/actions/logs/table-navigate-to-logs-action';
import { ChargingProfile, ChargingProfileKindType, ChargingProfilePurposeType, ChargingSchedule, ChargingSchedulePeriod, Profile, RecurrencyKindType, Schedule } from '../../../../types/ChargingProfile';
import { ChargingRateUnitType, ChargingStation } from '../../../../types/ChargingStation';
import { RestResponse } from '../../../../types/GlobalType';
import { HTTPError } from '../../../../types/HTTPError';
import { ServerAction } from '../../../../types/Server';
import { ButtonType } from '../../../../types/Table';
import TenantComponents from '../../../../types/TenantComponents';
import { Utils } from '../../../../utils/Utils';
import { ChargingPlansEditableTableDataSource } from './charging-plans-editable-table-data-source';
import { ChargingPlansTableDataSource } from './charging-plans-table-data-source';

interface ProfileType {
  key: string;
  chargingProfileKindType: ChargingProfileKindType;
  recurrencyKindType?: RecurrencyKindType;
  description: string;
  stackLevel: number;
  profileId: number;
}

@Component({
  selector: 'app-charging-plans',
  templateUrl: 'charging-plans.component.html',
  providers: [
    ChargingPlansEditableTableDataSource,
    ChargingPlansTableDataSource,
  ],
})
export class ChargingPlansComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() public chargingStation!: ChargingStation;

  public profileTypeMap: ProfileType[] = [
    {
      key: ChargingProfileKindType.ABSOLUTE, description: 'chargers.smart_charging.profile_types.absolute',
      chargingProfileKindType: ChargingProfileKindType.ABSOLUTE, stackLevel: 3, profileId: 3
    },
    {
      key: ChargingProfileKindType.RECURRING, recurrencyKindType: RecurrencyKindType.DAILY, description: 'chargers.smart_charging.profile_types.recurring_daily',
      chargingProfileKindType: ChargingProfileKindType.RECURRING, stackLevel: 2, profileId: 2
    },
  ];
  public formGroup!: FormGroup;
  public profileTypeControl!: AbstractControl;
  public chargingProfilesControl!: AbstractControl;
  public startDateControl!: AbstractControl;
  public endDateControl!: AbstractControl;
  public chargingSchedules!: FormArray;
  public chargingProfiles: ChargingProfile[] = [];
  public currentChargingProfile: ChargingProfile;
  public currentChargingSchedules: Schedule[] = [];
  public isSmartChargingComponentActive = false;
  public autoRefreshEnabled = true;

  constructor(
    public scheduleTableDataSource: ChargingPlansTableDataSource,
    public scheduleEditableTableDataSource: ChargingPlansEditableTableDataSource,
    private centralServerNotificationService: CentralServerNotificationService,
    private configService: ConfigService,
    private translateService: TranslateService,
    private router: Router,
    private datePipe: AppDatePipe,
    private dialogService: DialogService,
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
  ) {
    this.isSmartChargingComponentActive = this.componentService.isActive(TenantComponents.SMART_CHARGING);
    if (this.autoRefreshEnabled && this.configService.getCentralSystemServer().socketIOEnabled) {
      // Update Charging Station?
      this.centralServerNotificationService.getSubjectChargingProfile().pipe(debounceTime(
        this.configService.getAdvanced().debounceTimeNotifMillis)).subscribe((singleChangeNotification) => {
          if (this.chargingProfiles && singleChangeNotification && singleChangeNotification.data) {
            const chargingProfile = this.chargingProfiles.find(
              (chargingProfile) => chargingProfile.id === singleChangeNotification.data.id);
            // Reload?
            if (chargingProfile) {
              this.refresh();
            }
          }
        });
    }
  }

  public navigateToLog() {
    new TableNavigateToLogsAction().getActionDef().action('logs?ChargingStationID=' + this.chargingStation.id +
      '&actions=' + ServerAction.CHARGING_PROFILES + '|'
      + ServerAction.CHARGING_PROFILE_DELETE + '|' + ServerAction.CHARGING_PROFILE_UPDATE);
  }

  public ngOnInit(): void {
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
          // this.validateDateMustBeInTheFuture,
        ])),
      endDateControl: new FormControl('',
        Validators.compose([
          this.validateEndDateLimitInRecurringPlan.bind(this),
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
    this.startDateControl.setValue(moment().add(10, 'm').startOf('m').toDate());
    this.scheduleEditableTableDataSource.startDate = this.startDateControl.value as Date;
    this.profileTypeControl.setValue(this.profileTypeMap[0]);
    // Assign for to editable data source
    this.scheduleEditableTableDataSource.setFormArray(this.chargingSchedules);
    // Change the Profile
    this.chargingProfilesControl.valueChanges.subscribe((chargingProfile: ChargingProfile) => {
      // Load Profile
      this.loadProfile(chargingProfile);
    });
    // Check if smart charging is active
    if (this.chargingStation.inactive || (this.isSmartChargingComponentActive && this.chargingStation.siteArea?.smartCharging
      && !this.chargingStation.excludeFromSmartCharging)) {
      this.startDateControl.disable();
    }
    // Change the Profile Type
    this.profileTypeControl.valueChanges.subscribe((profileType: ProfileType) => {
      // Change date format
      if (profileType.key === ChargingProfileKindType.RECURRING) {
        this.scheduleEditableTableDataSource.tableColumnsDef[0].formatter = (value: Date) => this.datePipe.transform(value, 'shortTime');
        this.scheduleEditableTableDataSource.tableColumnsDef[2].formatter = (value: Date) => this.datePipe.transform(value, 'shortTime');
        // Set the date at midnight next day
        this.startDateControl.setValue(moment().add(1, 'd').startOf('d').toDate());
        this.scheduleEditableTableDataSource.startDate = new Date(this.startDateControl.value);
      } else {
        this.startDateControl.setValue(moment().add(10, 'm').startOf('m').toDate());
        this.scheduleEditableTableDataSource.tableColumnsDef[0].formatter = (value: Date) => this.datePipe.transform(value, 'short');
        this.scheduleEditableTableDataSource.tableColumnsDef[2].formatter = (value: Date) => this.datePipe.transform(value, 'short');
      }
      this.scheduleEditableTableDataSource.refreshChargingSchedules();
      this.endDateControl.setValue(this.scheduleEditableTableDataSource.endDate);
    });
    // Change the Slots/Schedules
    this.scheduleEditableTableDataSource.getTableChangedSubject().subscribe((schedules: Schedule[]) => {
      // Update Chart (recreate the array to trigger the ngonchanges event on the chart)
      this.currentChargingSchedules = [...schedules];
      // Refresh end date
      this.scheduleEditableTableDataSource.refreshChargingSchedules();
      this.endDateControl.setValue(this.scheduleEditableTableDataSource.endDate);
      this.formGroup.markAsDirty();
    });
  }

  public ngAfterViewInit() {
    this.refresh();
  }

  public ngOnChanges() {
    if (this.autoRefreshEnabled) {
      this.refresh();
    }
  }

  public toggleAutoRefresh(value: boolean) {
    this.autoRefreshEnabled = value;
  }

  public validateDateMustBeInTheFuture(control: AbstractControl): ValidationErrors | null {
    // Check
    if (!control.value || (Utils.isValidDate(control.value) && moment(control.value).isAfter(new Date()))) {
      // Ok
      return null;
    }
    return { dateNotInFuture: true };
  }

  public validateEndDateLimitInRecurringPlan(control: AbstractControl): ValidationErrors | null {
    // Check
    if (!control.value || !this.startDateControl || (Utils.isValidDate(control.value) &&
      moment(control.value).isBefore(moment(this.startDateControl.value).add('1', 'd').add('1', 'm')))) {
      // Ok
      return null;
    }
    return { endDateOutOfRecurringLimit: true };
  }

  public refresh() {
    this.loadChargingProfiles();
  }

  public triggerSmartCharging() {
    // Show yes/no dialog
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('chargers.smart_charging.trigger_smart_charging_title'),
      this.translateService.instant('chargers.smart_charging.trigger_smart_charging_confirm'),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        this.spinnerService.show();
        this.centralServerService.triggerSmartCharging(this.chargingStation.siteArea.id).subscribe((response) => {
          this.spinnerService.hide();
          if (response.status === RestResponse.SUCCESS) {
            this.messageService.showSuccessMessage(this.translateService.instant('chargers.smart_charging.trigger_smart_charging_success'));
          } else {
            Utils.handleError(JSON.stringify(response), this.messageService,
              this.translateService.instant('chargers.smart_charging.trigger_smart_charging_error'));
          }
        }, (error) => {
          this.spinnerService.hide();
          Utils.handleHttpError(error, this.router, this.messageService,
            this.centralServerService, 'chargers.smart_charging.trigger_smart_charging_error');
        });
      }
    });
  }

  public startDateFilterChanged(value: Date) {
    this.scheduleEditableTableDataSource.startDate = new Date(value);
    this.scheduleEditableTableDataSource.refreshChargingSchedules();
    this.endDateControl.setValue(this.scheduleEditableTableDataSource.endDate);
  }

  public loadChargingProfiles() {
    if (this.chargingStation) {
      this.spinnerService.show();
      this.centralServerService.getChargingProfiles({ ChargeBoxID: this.chargingStation.id }).subscribe((chargingProfiles) => {
        this.spinnerService.hide();
        this.formGroup.markAsPristine();
        // Set Profile
        this.chargingProfiles = chargingProfiles.result;
        // Default
        this.scheduleEditableTableDataSource.setContent([]);
        this.currentChargingSchedules = [];
        // Init
        if (chargingProfiles.count > 0) {
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
        } else {
          this.scheduleEditableTableDataSource.setChargingStation(
            this.chargingStation, this.chargingStation.chargePoints[0]);
          this.scheduleTableDataSource.setChargingStation(
            this.chargingStation, this.chargingStation.chargePoints[0]);
        }
      }, (error) => {
        this.spinnerService.hide();
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.unexpected_error_backend');
      });
    }
  }

  private loadProfile(chargingProfile: ChargingProfile) {
    const schedules: Schedule[] = [];
    this.currentChargingProfile = chargingProfile;
    const chargePoint = Utils.getChargePointFromID(this.chargingStation, chargingProfile.chargePointID);
    // Set Data Sources
    this.scheduleEditableTableDataSource.setChargingStation(this.chargingStation, chargePoint);
    this.scheduleTableDataSource.setChargingStation(this.chargingStation, chargePoint);
    this.scheduleEditableTableDataSource.setChargingProfile(chargingProfile);
    this.scheduleTableDataSource.setChargingProfile(chargingProfile);
    if (chargingProfile) {
      // Init values
      if (chargingProfile.profile.chargingProfileKind) {
        this.formGroup.controls.profileTypeControl.setValue(chargingProfile.profile.chargingProfileKind);
      }
      // Set
      if (chargingProfile.profile.chargingProfileKind) {
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
          startDate: new Date(this.scheduleEditableTableDataSource.startDate),
          duration: chargingProfile.profile.chargingSchedule.duration ? chargingProfile.profile.chargingSchedule.duration / 60 : 0,
          limit: chargingSchedule.limit,
          limitInkW: Utils.convertAmpToWatt(
            this.chargingStation, chargePoint, chargingProfile.connectorID, chargingSchedule.limit) / 1000,
        };
        // Next Schedule?
        if (chargingProfile.profile.chargingSchedule.chargingSchedulePeriod[i + 1]) {
          schedule.duration = (chargingProfile.profile.chargingSchedule.chargingSchedulePeriod[i + 1].startPeriod
            - chargingSchedule.startPeriod) / 60;
        }
        // Set Start Date
        schedule.startDate.setSeconds(schedule.startDate.getSeconds() + chargingSchedule.startPeriod);
        // Set
        schedule.endDate = new Date(schedule.startDate.getTime() + schedule.duration * 60 * 1000);
        // Add
        schedules.push(schedule);
      }
      // Set last schedule
      if (chargingProfile.profile.chargingSchedule.duration) {
        // Limit the last schedule with the total duration
        schedules[schedules.length - 1].duration = (this.scheduleEditableTableDataSource.startDate.getTime() / 1000
          + chargingProfile.profile.chargingSchedule.duration
          - schedules[schedules.length - 1].startDate.getTime() / 1000) / 60;
        // Set
        schedules[schedules.length - 1].endDate =
          new Date(schedules[schedules.length - 1].startDate.getTime() + schedules[schedules.length - 1].duration * 60 * 1000);
        // Set end date
        this.endDateControl.setValue(new Date(this.scheduleEditableTableDataSource.startDate.getTime() +
          chargingProfile.profile.chargingSchedule.duration * 1000));
      }
      // Set Schedule
      this.scheduleTableDataSource.setChargingProfileSchedule(schedules);
      // Set Schedule Table content
      this.scheduleEditableTableDataSource.setContent(schedules);
      // Set Chart
      this.currentChargingSchedules = schedules;
    }
  }

  public deleteChargingProfile() {
    // Show yes/no dialog
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('chargers.smart_charging.clear_profile_title'),
      this.translateService.instant('chargers.smart_charging.clear_profile_confirm', { chargeBoxID: this.chargingStation.id }),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        // Build charging profile
        const chargingProfile = this.buildChargingProfile();
        this.spinnerService.show();
        this.centralServerService.deleteChargingProfile(chargingProfile.id).subscribe((response) => {
          this.spinnerService.hide();
          if (response.status === RestResponse.SUCCESS) {
            // Remove from array
            this.chargingProfiles = this.chargingProfiles.filter((exitingChargingProfile) => exitingChargingProfile.id !== chargingProfile.id);
            this.messageService.showSuccessMessage(this.translateService.instant('chargers.smart_charging.clear_profile_success',
              { chargeBoxID: this.chargingStation.id }));
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, this.translateService.instant('chargers.smart_charging.clear_profile_error'));
          }
        }, (error: any) => {
          this.spinnerService.hide();
          if (error.status === HTTPError.CLEAR_CHARGING_PROFILE_NOT_SUCCESSFUL) {
            Utils.handleHttpError(
              error, this.router, this.messageService, this.centralServerService,
              this.translateService.instant('chargers.smart_charging.clear_profile_not_accepted',
                { chargeBoxID: this.chargingStation.id }));
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
      this.translateService.instant('chargers.smart_charging.power_limit_plan_confirm', { chargeBoxID: this.chargingStation.id }),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        // Build charging profile
        const chargingProfile = this.buildChargingProfile();
        this.spinnerService.show();
        this.centralServerService.updateChargingProfile(chargingProfile).subscribe((response) => {
          this.spinnerService.hide();
          if (response.status === RestResponse.SUCCESS) {
            // Push new profile in array
            const foundChargingProfile = this.chargingProfiles.find((exitingChargingProfile) => exitingChargingProfile.id === chargingProfile.id);
            if (!foundChargingProfile) {
              chargingProfile.id = response.id;
              this.chargingProfilesControl.setValue(chargingProfile);
              this.chargingProfiles.push(chargingProfile);
            }
            this.messageService.showSuccessMessage(
              this.translateService.instant('chargers.smart_charging.power_limit_plan_success',
                { chargeBoxID: this.chargingStation.id }));
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
                { chargeBoxID: this.chargingStation.id }));
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
    chargingProfile.chargingStationID = this.chargingStation.id;
    chargingProfile.chargePointID = 1;
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
    // Set profile type
    const profileType: ProfileType = this.profileTypeControl.value as ProfileType;
    chargingProfile.profile.chargingProfileKind = profileType.chargingProfileKindType;
    chargingProfile.profile.chargingProfileId = profileType.profileId;
    chargingProfile.profile.stackLevel = profileType.stackLevel;
    chargingProfile.profile.chargingProfilePurpose = ChargingProfilePurposeType.TX_DEFAULT_PROFILE;
    if (profileType.chargingProfileKindType === ChargingProfileKindType.RECURRING &&
      profileType.recurrencyKindType) {
      chargingProfile.profile.recurrencyKind = profileType.recurrencyKindType;
    }
    // Set power unit
    chargingProfile.profile.chargingSchedule.chargingRateUnit = ChargingRateUnitType.AMPERE;
    // Build schedule
    if (this.scheduleEditableTableDataSource.data.length > 0) {
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
    }
    return chargingProfile;
  }
}
