import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { AnalyticsSettings } from 'app/common.types';
import { Constants } from 'app/utils/Constants';
import * as moment from 'moment-timezone';
import { AnalyticsLinksTableDataSource } from '../analytics-link/analytics-links-table-data-source';

@Component({
  selector: 'app-settings-sac',
  templateUrl: 'settings-sac.component.html'
})
export class SettingsSacComponent implements OnInit, OnChanges {
  @Input() formGroup: FormGroup;
  @Input() analyticsSettings: AnalyticsSettings;

  public mainUrl: AbstractControl;
  public timezone: AbstractControl;
  public timezoneList: any = [];

  constructor(
      public analyticsLinksTableDataSource: AnalyticsLinksTableDataSource) {
    // initialize timezone list from moment-timezone
    this.timezoneList = moment.tz.names();
  }

  ngOnInit(): void {
    // Add control
    this.formGroup.addControl(
      'mainUrl', new FormControl('',
        Validators.compose([
          Validators.pattern(Constants.URL_PATTERN)
        ]))
    );
    this.formGroup.addControl(
      'timezone', new FormControl('',
        Validators.required)
    );
    this.mainUrl = this.formGroup.controls['mainUrl'];
    this.timezone = this.formGroup.controls['timezone'];
    // Set data
    this.updateFormData();
  }

  openUrl() {
    window.open(this.mainUrl.value);
  }

  ngOnChanges() {
    this.updateFormData();
  }

  updateFormData() {
    // Set data
    if (this.mainUrl) {
      this.mainUrl.setValue(this.analyticsSettings.sac.mainUrl);
      this.analyticsLinksTableDataSource.setLinks(this.analyticsSettings.links ? this.analyticsSettings.links : []);
      this.analyticsLinksTableDataSource.loadData().subscribe();
      if (this.analyticsSettings.sac.timezone && this.analyticsSettings.sac.timezone.length > 0) {
        this.timezone.setValue(this.analyticsSettings.sac.timezone);
      }
      this.formGroup.markAsPristine();
    }
  }
}
