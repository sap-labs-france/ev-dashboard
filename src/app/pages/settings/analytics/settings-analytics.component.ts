import { AnalyticsSettings, AnalyticsSettingsType } from 'app/types/Setting';
import { Component, OnInit } from '@angular/core';

import { AnalyticsLinksTableDataSource } from './analytics-link/analytics-links-table-data-source';
import { CentralServerService } from 'app/services/central-server.service';
import { ComponentService } from '../../../services/component.service';
import { FormGroup } from '@angular/forms';
import { HTTPError } from 'app/types/HTTPError';
import { MessageService } from 'app/services/message.service';
import { RestResponse } from 'app/types/GlobalType';
import { Router } from '@angular/router';
import { SpinnerService } from 'app/services/spinner.service';
import TenantComponents from 'app/types/TenantComponents';
import { Utils } from 'app/utils/Utils';

@Component({
  selector: 'app-settings-analytics',
  templateUrl: 'settings-analytics.component.html',
})
export class SettingsAnalyticsComponent implements OnInit {
  public isActive = false;
  public analyticsSettings!: AnalyticsSettings;
  public formGroup: FormGroup;

  constructor(
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private spinnerService: SpinnerService,
    private messageService: MessageService,
    private router: Router,
    public analyticsLinksTableDataSource: AnalyticsLinksTableDataSource,
  ) {
    this.analyticsLinksTableDataSource.changed.subscribe(() => {
      this.formGroup.markAsDirty();
    });
    this.isActive = componentService.isActive(TenantComponents.ANALYTICS);
    // Build form
    this.formGroup = new FormGroup({});
  }

  public ngOnInit(): void {
    this.loadConfiguration();
  }

  public loadConfiguration() {
    this.spinnerService.show();
    this.componentService.getSacSettings().subscribe((settings) => {
      this.spinnerService.hide();
      // Keep
      this.analyticsSettings = settings;
      // Set Links
      this.analyticsLinksTableDataSource.setLinks(settings.links);
      this.analyticsLinksTableDataSource.loadData().subscribe();
      // Init form
      this.formGroup.markAsPristine();
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case HTTPError.OBJECT_DOES_NOT_EXIST_ERROR:
          this.messageService.showErrorMessage('settings.analytics.setting_not_found');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService,
            this.centralServerService, 'general.unexpected_error_backend');
      }
    });
  }

  public save(content: AnalyticsSettings) {
    // SAC?
    if (content.sac) {
      this.analyticsSettings.type = AnalyticsSettingsType.SAC;
      this.analyticsSettings.sac = content.sac;
    } else {
      return;
    }
    this.analyticsSettings.links = this.analyticsLinksTableDataSource.getLinks();
    // Save
    this.spinnerService.show();
    this.componentService.saveSacSettings(this.analyticsSettings).subscribe((response) => {
      this.spinnerService.hide();
      if (response.status === RestResponse.SUCCESS) {
        this.messageService.showSuccessMessage(
          (!this.analyticsSettings.id ? 'settings.analytics.create_success' : 'settings.analytics.update_success'));
        this.refresh();
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, (!this.analyticsSettings.id ? 'settings.analytics.create_error' : 'settings.analytics.update_error'));
      }
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case HTTPError.OBJECT_DOES_NOT_EXIST_ERROR:
          this.messageService.showErrorMessage('settings.analytics.setting_do_not_exist');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            (!this.analyticsSettings.id ? 'settings.analytics.create_error' : 'settings.analytics.update_error'));
      }
    });
  }

  public refresh() {
    // Load Setting
    this.loadConfiguration();
  }
}
