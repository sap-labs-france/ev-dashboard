import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';

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

  public sac!: FormGroup;
  public mainUrl!: AbstractControl;
  public timezone!: AbstractControl;
  public timezoneList: any = [];

  constructor(
      public analyticsLinksTableDataSource: AnalyticsLinksTableDataSource) {
    // initialize timezone list from moment-timezone
    this.timezoneList = (moment as any).tz.names();
  }

  public ngOnInit(): void {
    // Add control
    this.sac = new FormGroup({
      mainUrl: new FormControl('',
        Validators.pattern(Constants.URL_PATTERN),
      ),
      timezone: new FormControl('',
        Validators.required,
      ),
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
