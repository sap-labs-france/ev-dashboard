import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { WindowService } from 'services/window.service';
import { GridMonitoringConnectionSetting } from 'types/Setting';
import { EcowattGridMonitoringLevel, SiteArea } from 'types/SiteArea';

@Component({
  selector: 'app-site-area-ecowatt',
  templateUrl: './site-area-ecowatt.component.html',
})
export class SiteAreaEcowattComponent implements OnInit, OnChanges {
  @Input() public formGroup!: UntypedFormGroup;
  @Input() public isGridMonitoringActive!: boolean;
  @Input() public gridMonitoringConnectionSetting!: GridMonitoringConnectionSetting;
  @Input() public siteArea!: SiteArea;

  public ecowatt!: UntypedFormGroup;
  public levelOverridden!: AbstractControl;
  public levelGreenPercent!: AbstractControl;
  public levelOrangePercent!: AbstractControl;
  public levelRedPercent!: AbstractControl;

  public siteAreaNewMaximumPower: number;
  public gridMonitoringPowerLevelPercent: number;
  public gridMonitoringCurrentLevel: EcowattGridMonitoringLevel;
  public gridMonitoringForecastLevel: EcowattGridMonitoringLevel;
  public gridMonitoringForecastDate: Date;
  public gridMonitoringLastUpdatedOn: Date;

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    private windowService: WindowService
  ) {
  }

  public ngOnInit(): void {
    this.ecowatt = new UntypedFormGroup({
      levelOverridden: new FormControl(false),
      currentLevel: new FormControl(''),
      forecastLevel: new FormControl(''),
      forecastDate: new FormControl(''),
      lastUpdated: new FormControl(''),
      levelGreenPercent: new FormControl(null,
        Validators.compose([
          Validators.required,
          Validators.min(0),
          Validators.max(100),
        ])
      ),
      levelOrangePercent: new FormControl(null,
        Validators.compose([
          Validators.required,
          Validators.min(0),
          Validators.max(100),
        ])
      ),
      levelRedPercent: new FormControl(null,
        Validators.compose([
          Validators.required,
          Validators.min(0),
          Validators.max(100),
        ])
      )
    });
    this.formGroup.addControl('ecowatt', this.ecowatt);
    this.levelOverridden = this.ecowatt.controls['levelOverridden'];
    this.levelGreenPercent = this.ecowatt.controls['levelGreenPercent'];
    this.levelOrangePercent = this.ecowatt.controls['levelOrangePercent'];
    this.levelRedPercent = this.ecowatt.controls['levelRedPercent'];
    this.loadEcowattConnectionData();
  }

  public ngOnChanges(): void {
    this.loadEcowattConnectionData();
  }

  public loadEcowattConnectionData() {
    if (this.siteArea && this.gridMonitoringConnectionSetting && this.ecowatt) {
      if (this.siteArea.gridMonitoringData?.ecowatt) {
        this.levelOverridden.setValue(this.siteArea.gridMonitoringData.ecowatt.levelOverridden);
      } else {
        this.levelOverridden.setValue(false);
      }
      if (this.siteArea.gridMonitoringData?.ecowatt.forecastLevel) {
        this.gridMonitoringForecastLevel = this.siteArea.gridMonitoringData?.ecowatt.forecastLevel;
      }
      if (this.siteArea.gridMonitoringData?.ecowatt.lastUpdated) {
        this.gridMonitoringLastUpdatedOn = this.siteArea.gridMonitoringData?.ecowatt.lastUpdated;
      }
      if (this.siteArea.gridMonitoringData?.ecowatt.forecastDate) {
        this.gridMonitoringForecastDate = this.siteArea.gridMonitoringData?.ecowatt.forecastDate;
      }
      // Display Site Area overridden values
      if (this.siteArea.gridMonitoringData?.ecowatt?.levelOverridden) {
        this.levelGreenPercent.setValue(this.siteArea.gridMonitoringData.ecowatt.levelGreenPercent);
        this.levelOrangePercent.setValue(this.siteArea.gridMonitoringData.ecowatt.levelOrangePercent);
        this.levelRedPercent.setValue(this.siteArea.gridMonitoringData.ecowatt.levelRedPercent);
      // Set the default levels in settings
      } else {
        this.levelGreenPercent.setValue(this.gridMonitoringConnectionSetting.ecowattConnection.levelGreenPercent);
        this.levelOrangePercent.setValue(this.gridMonitoringConnectionSetting.ecowattConnection.levelOrangePercent);
        this.levelRedPercent.setValue(this.gridMonitoringConnectionSetting.ecowattConnection.levelRedPercent);
      }
      if (this.siteArea.gridMonitoringData?.ecowatt.currentLevel) {
        this.gridMonitoringCurrentLevel = this.siteArea.gridMonitoringData?.ecowatt.currentLevel;
        this.updateSiteAreaNewMaximumPower();
      }
      if (this.isGridMonitoringActive) {
        this.levelOverridden.enable();
        this.checkEditLevelActivated();
      } else {
        this.ecowatt.disable();
      }
    }
  }

  public updateSiteAreaNewMaximumPower() {
    switch (this.gridMonitoringCurrentLevel) {
      case EcowattGridMonitoringLevel.LEVEL_GREEN:
        this.gridMonitoringPowerLevelPercent = this.levelGreenPercent.value;
        this.siteAreaNewMaximumPower = this.siteArea.maximumPower * (this.levelGreenPercent.value / 100);
        break;
      case EcowattGridMonitoringLevel.LEVEL_ORANGE:
        this.gridMonitoringPowerLevelPercent = this.levelOrangePercent.value;
        this.siteAreaNewMaximumPower = this.siteArea.maximumPower * (this.levelOrangePercent.value / 100);
        break;
      case EcowattGridMonitoringLevel.LEVEL_RED:
        this.gridMonitoringPowerLevelPercent = this.levelRedPercent.value;
        this.siteAreaNewMaximumPower = this.siteArea.maximumPower * (this.levelRedPercent.value / 100);
        break;
    }
  }

  public gridMonitoringChanged(isGridMonitoringActive: boolean) {
    this.isGridMonitoringActive = isGridMonitoringActive;
    if (this.isGridMonitoringActive) {
      this.levelOverridden.enable();
      this.checkEditLevelActivated();
    } else {
      this.ecowatt.disable();
    }
  }

  public checkEditLevelActivated() {
    if (this.levelOverridden.value) {
      this.levelGreenPercent.enable();
      this.levelOrangePercent.enable();
      this.levelRedPercent.enable();
    } else {
      this.levelGreenPercent.disable();
      this.levelOrangePercent.disable();
      this.levelRedPercent.disable();
    }
  }

  public openEcowattWindow() {
    this.windowService.openUrl('https://www.monecowatt.fr/');
  }
}
