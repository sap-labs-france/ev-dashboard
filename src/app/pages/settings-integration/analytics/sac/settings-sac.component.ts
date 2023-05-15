import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment-timezone';
import { SettingAuthorizationActions } from 'types/Authorization';

import { AnalyticsSettings } from '../../../../types/Setting';
import { Constants } from '../../../../utils/Constants';
import { AnalyticsLinksTableDataSource } from '../analytics-link/analytics-links-table-data-source';

@Component({
  selector: 'app-settings-sac',
  templateUrl: 'settings-sac.component.html',
})
export class SettingsSacComponent implements OnInit, OnChanges {
  @Input() public formGroup!: FormGroup;
  @Input() public analyticsSettings!: AnalyticsSettings;
  @Input() public authorizations!: SettingAuthorizationActions;

  public sac!: FormGroup;
  public mainUrl!: AbstractControl;
  public timezone!: AbstractControl;
  public timezoneList: any = [];

  public constructor(public analyticsLinksTableDataSource: AnalyticsLinksTableDataSource) {
    // Initialize timezone list from moment-timezone
    this.timezoneList = (moment as any).tz.names();
  }

  public ngOnInit(): void {
    // Add control
    this.sac = new FormGroup({
      mainUrl: new FormControl('', Validators.pattern(Constants.URL_PATTERN)),
      timezone: new FormControl('', Validators.required),
    });
    this.formGroup.addControl('sac', this.sac);
    // Keep
    this.mainUrl = this.sac.controls['mainUrl'];
    this.timezone = this.sac.controls['timezone'];
    // Set data
    this.updateFormData();
  }

  public openUrl() {
    window.open(this.mainUrl.value);
  }

  public ngOnChanges() {
    this.updateFormData();
  }

  public updateFormData() {
    if (this.mainUrl) {
      this.mainUrl.setValue(this.analyticsSettings.sac.mainUrl);
      this.analyticsLinksTableDataSource.setLinks(
        this.analyticsSettings.links ? this.analyticsSettings.links : []
      );
      this.analyticsLinksTableDataSource.loadData().subscribe();
      if (this.analyticsSettings.sac.timezone && this.analyticsSettings.sac.timezone.length > 0) {
        this.timezone.setValue(this.analyticsSettings.sac.timezone);
      }
      this.formGroup.markAsPristine();
      // Read only
      if (!this.authorizations.canUpdate) {
        // Async call for letting the sub form groups to init
        setTimeout(() => this.formGroup.disable(), 0);
      }
    }
  }
}
