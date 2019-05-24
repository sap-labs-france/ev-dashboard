import {Component, OnInit, Input} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import * as moment from 'moment-timezone';
import {Constants} from 'app/utils/Constants';
import {AnalyticsLinksDataSource} from '../analytics-link/analytics-links-source-table';
import {AnalyticsSettings} from 'app/common.types';

@Component({
  selector: 'app-settings-sac',
  templateUrl: 'settings-sac.component.html'
})
export class SettingsSacComponent implements OnInit {
  @Input() formGroup: FormGroup;
  @Input() analyticsSettings: AnalyticsSettings;

  public mainUrl: AbstractControl;
  public timezone: AbstractControl;
  public timezoneList: any = [];

  constructor(
      public analyticsLinksDataSource: AnalyticsLinksDataSource) {
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
    // Get SAC Main Url
    this.mainUrl.setValue(this.analyticsSettings.sac.mainUrl);
    // set SAC Links Data Source
    this.analyticsLinksDataSource.setLinks(this.analyticsSettings.links ? this.analyticsSettings.links : []);
    this.analyticsLinksDataSource.loadData().subscribe();
    // get timezone
    if (this.analyticsSettings.sac.timezone && this.analyticsSettings.sac.timezone.length > 0) {
      this.timezone.setValue(this.analyticsSettings.sac.timezone);
    }
    // Init form
    this.formGroup.markAsPristine();
  }
}
