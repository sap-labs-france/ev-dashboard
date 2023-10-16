import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { StatusCodes } from 'http-status-codes';
import { SettingAuthorizationActions } from 'types/Authorization';

import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService } from '../../../services/component.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { RestResponse } from '../../../types/GlobalType';
import { AnalyticsSettings, AnalyticsSettingsType } from '../../../types/Setting';
import { TenantComponents } from '../../../types/Tenant';
import { Utils } from '../../../utils/Utils';
import { AnalyticsLinksTableDataSource } from './analytics-link/analytics-links-table-data-source';

@Component({
  selector: 'app-settings-analytics',
  templateUrl: 'settings-analytics.component.html',
  styleUrls: ['settings-analytics.component.scss'],
})
export class SettingsAnalyticsComponent implements OnInit {
  public isActive = false;
  public analyticsSettings!: AnalyticsSettings;
  public authorizations: SettingAuthorizationActions;
  public formGroup: FormGroup;

  public constructor(
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private spinnerService: SpinnerService,
    private messageService: MessageService,
    private router: Router,
    public analyticsLinksTableDataSource: AnalyticsLinksTableDataSource
  ) {
    this.analyticsLinksTableDataSource.changed.subscribe(() => {
      this.formGroup.markAsDirty();
    });
    this.isActive = componentService.isActive(TenantComponents.ANALYTICS);
  }

  public ngOnInit(): void {
    if (this.isActive) {
      // Build form
      this.formGroup = new FormGroup({});
      // Load the conf
      this.loadConfiguration();
    }
  }

  public loadConfiguration() {
    this.spinnerService.show();
    this.componentService.getSacSettings().subscribe({
      next: (settings) => {
        this.spinnerService.hide();
        // Init Auth
        this.authorizations = {
          canUpdate: Utils.convertToBoolean(settings.canUpdate),
        };
        this.analyticsSettings = settings;
        // Set Links
        this.analyticsLinksTableDataSource.setLinks(settings.links);
        // Set authorizations
        this.analyticsLinksTableDataSource.setAuthorizations(this.authorizations);
        // Load data
        this.analyticsLinksTableDataSource.loadData().subscribe();
        // Init form
        this.formGroup.markAsPristine();
      },
      error: (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case StatusCodes.NOT_FOUND:
            this.messageService.showErrorMessage('settings.analytics.setting_not_found');
            break;
          default:
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              'general.unexpected_error_backend'
            );
        }
      },
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
    this.componentService.saveSacSettings(this.analyticsSettings).subscribe({
      next: (response) => {
        this.spinnerService.hide();
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage(
            !this.analyticsSettings.id
              ? 'settings.analytics.create_success'
              : 'settings.analytics.update_success'
          );
          this.refresh();
        } else {
          Utils.handleError(
            JSON.stringify(response),
            this.messageService,
            !this.analyticsSettings.id
              ? 'settings.analytics.create_error'
              : 'settings.analytics.update_error'
          );
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case StatusCodes.NOT_FOUND:
            this.messageService.showErrorMessage('settings.analytics.setting_do_not_exist');
            break;
          default:
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              !this.analyticsSettings.id
                ? 'settings.analytics.create_error'
                : 'settings.analytics.update_error'
            );
        }
      },
    });
  }

  public refresh() {
    this.loadConfiguration();
  }
}
