import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { StatusCodes } from 'http-status-codes';
import { CentralServerService } from 'services/central-server.service';
import { ComponentService } from 'services/component.service';
import { DialogService } from 'services/dialog.service';
import { MessageService } from 'services/message.service';
import { SpinnerService } from 'services/spinner.service';
import { DialogMode } from 'types/Authorization';
import { ButtonAction, RestResponse } from 'types/GlobalType';
import { GridMonitoringConnectionSetting, GridMonitoringConnectionType, GridMonitoringSettings } from 'types/Setting';
import { SiteArea } from 'types/SiteArea';
import { Utils } from 'utils/Utils';

import { SiteAreaEcowattComponent } from './ecowatt/site-area-ecowatt.component';

@Component({
  selector: 'app-site-area-grid-monitoring',
  templateUrl: './site-area-grid-monitoring.component.html',
})
export class SiteAreaGridMonitoringComponent implements OnInit, OnChanges {
  @Input() public siteArea!: SiteArea;
  @Input() public formGroup!: UntypedFormGroup;
  @Input() public dialogMode: DialogMode;
  @Output() public siteAreaChanged = new EventEmitter<void>();

  @ViewChild('siteAreaEcowattComponent') public siteAreaEcowattComponent!: SiteAreaEcowattComponent;

  public gridMonitoringData!: UntypedFormGroup;
  public gridMonitoringID!: AbstractControl;
  public gridMonitoring!: AbstractControl;
  public type!: AbstractControl;

  public isSmartChargingActive: boolean;

  public readonly DialogMode = DialogMode;
  public readonly GridMonitoringConnectionType = GridMonitoringConnectionType;

  public gridMonitoringSettings: GridMonitoringSettings;
  public gridMonitoringConnectionSetting: GridMonitoringConnectionSetting;

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    private spinnerService: SpinnerService,
    private componentService: ComponentService,
    private translateService: TranslateService,
    private dialogService: DialogService,
    private messageService: MessageService,
    private centralServerService: CentralServerService,
    private router: Router
  ) {};

  public ngOnInit(): void {
    this.gridMonitoringData = new UntypedFormGroup({
      gridMonitoringID: new FormControl(''),
      type: new FormControl(''),
    });
    this.formGroup.addControl('gridMonitoring', new FormControl(false));
    this.formGroup.addControl('gridMonitoringData', this.gridMonitoringData);
    this.gridMonitoring = this.formGroup.controls['gridMonitoring'];
    this.gridMonitoringID = this.gridMonitoringData.controls['gridMonitoringID'];
    this.type = this.gridMonitoringData.controls['type'];
    this.loadConfiguration();
  }

  public ngOnChanges(): void {
    setTimeout(() => this.loadSiteArea(), 0);
  }

  public loadConfiguration() {
    this.spinnerService.show();
    this.componentService.getGridMonitoringSettings().subscribe({
      next: (gridMonitoringSettings) => {
        this.spinnerService.hide();
        this.gridMonitoringSettings = gridMonitoringSettings;
        this.loadSiteArea();
      },
      error: (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case StatusCodes.NOT_FOUND:
            this.messageService.showErrorMessage('settings.grid_monitoring.setting_not_found');
            break;
          default:
            Utils.handleHttpError(error, this.router, this.messageService,
              this.centralServerService, 'general.unexpected_error_backend');
        }
      }
    });
  }

  public loadSiteArea() {
    let connectionActive: GridMonitoringConnectionSetting;
    if (this.siteArea && this.gridMonitoringSettings) {
      this.isSmartChargingActive = this.siteArea.smartCharging;
      if (this.siteArea.gridMonitoring) {
        this.gridMonitoring.setValue(true);
      } else {
        this.gridMonitoring.setValue(false);
      }
      if (this.siteArea.gridMonitoringData) {
        connectionActive = this.gridMonitoringSettings.gridMonitoring.connections.find(
          (connection) => this.siteArea.gridMonitoringData.gridMonitoringID === connection.id);
        if (connectionActive) {
          this.gridMonitoringID.setValue(connectionActive.id);
          this.gridMonitoringConnectionChanged();
        }
      }
    }
    this.enableDisableGridMonitoring();
  }

  public enableDisableGridMonitoring() {
    if (this.dialogMode !== this.DialogMode.VIEW) {
      if (this.siteArea && this.isSmartChargingActive) {
        this.gridMonitoring.enable();
        this.enableDisableGridMonitoringContent();
      } else {
        this.gridMonitoring.setValue(false);
        this.gridMonitoring.disable();
        this.enableDisableGridMonitoringContent();
      }
    }
  }

  public enableDisableGridMonitoringContent() {
    if (this.gridMonitoring.value) {
      this.gridMonitoringID.enable();
    } else {
      this.gridMonitoringID.disable();
    }
    if (this.siteAreaEcowattComponent) {
      this.siteAreaEcowattComponent.gridMonitoringChanged(this.gridMonitoring.value);
    }
  }

  public gridMonitoringConnectionChanged() {
    this.gridMonitoringConnectionSetting = this.gridMonitoringSettings.gridMonitoring.connections.find(
      (connectionSetting) => this.gridMonitoringID.value === connectionSetting.id);
    this.type.setValue(this.gridMonitoringConnectionSetting.type);
  }

  public smartChargingChanged(isSmartChargingActive: boolean) {
    this.isSmartChargingActive = isSmartChargingActive;
    this.enableDisableGridMonitoring();
  }

  public gridMonitoringChanged() {
    this.enableDisableGridMonitoring();
  }

  public triggerGridMonitoring() {
    // Show yes/no dialog
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('site_areas.trigger_grid_monitoring_title'),
      this.translateService.instant('site_areas.trigger_grid_monitoring_confirm'),
    ).subscribe((result) => {
      if (result === ButtonAction.YES) {
        this.spinnerService.show();
        this.centralServerService.triggerGridMonitoring(this.siteArea.id).subscribe({
          next: (response) => {
            this.spinnerService.hide();
            if (response.status === RestResponse.SUCCESS) {
              this.messageService.showSuccessMessage(this.translateService.instant('site_areas.trigger_grid_monitoring_success'));
              this.siteAreaChanged.emit();
            } else {
              Utils.handleError(JSON.stringify(response), this.messageService,
                this.translateService.instant('site_areas.trigger_grid_monitoring_error'));
            }
          },
          error: (error) => {
            this.spinnerService.hide();
            switch (error.status) {
              case StatusCodes.TOO_MANY_REQUESTS:
                this.messageService.showErrorMessage('site_areas.trigger_grid_monitoring_error_too_many_requests');
                break;
              default:
                Utils.handleHttpError(error, this.router, this.messageService,
                  this.centralServerService, 'site_areas.trigger_grid_monitoring_error');
                break;
            }
          }
        });
      }
    });
  }
}
