import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from 'services/central-server.service';
import { ComponentService } from 'services/component.service';
import { DialogService } from 'services/dialog.service';
import { MessageService } from 'services/message.service';
import { SpinnerService } from 'services/spinner.service';
import { DialogMode } from 'types/Authorization';
import { ButtonAction, RestResponse } from 'types/GlobalType';
import { TenantComponents } from 'types/Tenant';
import { Utils } from 'utils/Utils';

import { SiteArea } from '../../../../../types/SiteArea';

@Component({
  selector: 'app-site-area-limits',
  templateUrl: 'site-area-limits.component.html',
})
export class SiteAreaLimitsComponent implements OnInit, OnChanges {
  @Input() public siteArea!: SiteArea;
  @Input() public formGroup!: UntypedFormGroup;
  @Input() public dialogMode: DialogMode;
  @Output() public smartChargingChanged = new EventEmitter<boolean>();

  public readonly DialogMode = DialogMode;
  public public = false;
  public isSmartChargingComponentActive = false;
  public initialized = false;

  public maximumPower!: AbstractControl;
  public maximumTotalPowerAmps!: AbstractControl;
  public maximumPowerAmpsPerPhase!: AbstractControl;
  public voltage!: AbstractControl;
  public smartCharging!: AbstractControl;
  public numberOfPhases!: AbstractControl;

  public phaseMap = [
    { key: 1, description: 'site_areas.single_phased' },
    { key: 3, description: 'site_areas.three_phased' },
  ];

  public constructor(
    private componentService: ComponentService,
    private spinnerService: SpinnerService,
    private translateService: TranslateService,
    private dialogService: DialogService,
    private messageService: MessageService,
    private router: Router,
    private centralServerService: CentralServerService
  ) {
    this.isSmartChargingComponentActive = this.componentService.isActive(TenantComponents.SMART_CHARGING);
  }

  public ngOnInit() {
    // Init the form
    this.formGroup.addControl('smartCharging', new FormControl(false));
    this.formGroup.addControl('maximumPower', new FormControl(0,
      Validators.compose([
        Validators.pattern(/^[+-]?([0-9]*[.])?[0-9]+$/),
        Validators.required,
      ])
    ));
    this.formGroup.addControl('maximumTotalPowerAmps', new FormControl(0));
    this.formGroup.addControl('maximumPowerAmpsPerPhase', new FormControl(0));
    this.formGroup.addControl('voltage', new FormControl(230,
      Validators.compose([
        Validators.required,
        Validators.min(1),
        Validators.pattern('^[+]?[0-9]*$'),
      ])
    ));
    this.formGroup.addControl('numberOfPhases', new FormControl(3,
      Validators.compose([
        Validators.required,
      ])
    ));
    // Form
    this.smartCharging = this.formGroup.controls['smartCharging'];
    this.maximumPower = this.formGroup.controls['maximumPower'];
    this.maximumTotalPowerAmps = this.formGroup.controls['maximumTotalPowerAmps'];
    this.maximumPowerAmpsPerPhase = this.formGroup.controls['maximumPowerAmpsPerPhase'];
    this.voltage = this.formGroup.controls['voltage'];
    this.numberOfPhases = this.formGroup.controls['numberOfPhases'];
    this.maximumPowerAmpsPerPhase.disable();
    this.maximumTotalPowerAmps.disable();
    this.initialized = true;
    this.loadSiteArea();
  }

  public ngOnChanges() {
    this.loadSiteArea();
  }

  public loadSiteArea() {
    if (this.initialized && this.siteArea) {
      if (this.siteArea.maximumPower) {
        this.maximumPower.setValue(this.siteArea.maximumPower);
      }
      if (this.siteArea.numberOfPhases) {
        this.numberOfPhases.setValue(this.siteArea.numberOfPhases);
      }
      if (this.siteArea.voltage) {
        this.voltage.setValue(this.siteArea.voltage);
      }
      if (this.siteArea.smartCharging) {
        this.smartCharging.setValue(this.siteArea.smartCharging);
      } else {
        this.smartCharging.setValue(false);
      }
      this.refreshMaximumAmps();
    }
  }

  public voltageChanged() {
    this.maximumPowerChanged();
  }

  public numberOfPhasesChanged() {
    this.maximumPowerChanged();
  }

  public refreshMaximumAmps() {
    this.maximumPowerChanged();
  }

  public smartChargingChange() {
    this.smartChargingChanged.emit(this.smartCharging.value);
  }

  public maximumPowerChanged() {
    if (!this.maximumPower.errors && this.voltage.value) {
      if (this.numberOfPhases.value) {
        this.maximumPowerAmpsPerPhase.setValue(
          Math.floor((this.maximumPower.value as number) / (this.voltage.value as number) / (this.numberOfPhases.value)));
      } else {
        this.maximumPowerAmpsPerPhase.setValue(0);
      }
      this.maximumTotalPowerAmps.setValue(
        Math.floor((this.maximumPower.value as number) / (this.voltage.value as number)));
    } else {
      this.maximumPowerAmpsPerPhase.setValue(0);
      this.maximumTotalPowerAmps.setValue(0);
    }
  }

  public triggerSmartCharging() {
    // Show yes/no dialog
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('chargers.smart_charging.trigger_smart_charging_title'),
      this.translateService.instant('chargers.smart_charging.trigger_smart_charging_confirm'),
    ).subscribe((result) => {
      if (result === ButtonAction.YES) {
        this.spinnerService.show();
        this.centralServerService.triggerSmartCharging(this.siteArea.id).subscribe({
          next: (response) => {
            this.spinnerService.hide();
            if (response.status === RestResponse.SUCCESS) {
              this.messageService.showSuccessMessage(this.translateService.instant('chargers.smart_charging.trigger_smart_charging_success'));
            } else {
              Utils.handleError(JSON.stringify(response), this.messageService,
                this.translateService.instant('chargers.smart_charging.trigger_smart_charging_error'));
            }
          },
          error: (error) => {
            this.spinnerService.hide();
            Utils.handleHttpError(error, this.router, this.messageService,
              this.centralServerService, 'chargers.smart_charging.trigger_smart_charging_error');
          }
        });
      }
    });
  }
}
