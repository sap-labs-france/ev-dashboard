import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CentralServerService } from 'app/services/central-server.service';
import { ComponentService, ComponentType } from 'app/services/component.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { BuildingSettings } from 'app/types/Setting';
import { Utils } from 'app/utils/Utils';

@Component({
  selector: 'app-settings-building',
  templateUrl: './settings-building.component.html',
})
export class SettingsBuildingComponent implements OnInit {
  public isActive = false;

  public formGroup!: FormGroup;
  public buildingSettings!: BuildingSettings;

  constructor(
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private router: Router,
  ) {
    this.isActive = this.componentService.isActive(ComponentType.BUILDING);
  }

  ngOnInit(): void {
    if (this.isActive) {
      // Build the form
      this.formGroup = new FormGroup({});
      // Load the conf
      this.loadConfiguration();
    }
  }

  loadConfiguration() {
    this.spinnerService.show();
    this.componentService.getBuildingSettings().subscribe((settings) => {
      this.spinnerService.hide();
      // Keep
      this.buildingSettings = settings;
      // Init form
      this.formGroup.markAsPristine();
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case 550:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'settings.building.setting_not_found');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.unexpected_error_backend');
      }
    });
  }
}
