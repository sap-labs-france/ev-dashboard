import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import * as moment from 'moment-timezone';
import {CentralServerService} from 'app/services/central-server.service';
import {MessageService} from 'app/services/message.service';
import {Constants} from 'app/utils/Constants';
import {SpinnerService} from 'app/services/spinner.service';
import {Utils} from 'app/utils/Utils';
import {ComponentEnum, ComponentService} from '../../../services/component.service';
import {SacLinksDataSource} from './sac-links/settings-sac-links-source-table';
import { SacSettings } from 'app/common.types';

@Component({
  selector: 'app-settings-sac',
  templateUrl: 'settings-sac.component.html'
})
export class SettingsSacComponent implements OnInit {
  public isAdmin;
  public formGroup: FormGroup;
  public mainUrl: AbstractControl;
  public timezone: AbstractControl;
  public isSacActive = false;

  public timezoneList: any = [];
  public currentSettingID: any;
  public sacSettings: SacSettings;

  private urlPattern = /^(?:https?|wss?):\/\/((?:[\w-]+)(?:\.[\w-]+)*)(?:[\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?$/;

  constructor(
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private spinnerService: SpinnerService,
    private messageService: MessageService,
    private router: Router,
    public sacLinksDataSource: SacLinksDataSource
  ) {
    this.isSacActive = componentService.isActive(ComponentEnum.SAC);
    // initialize timezone list from moment-timezone
    this.timezoneList = moment.tz.names();
  }

  ngOnInit(): void {
    // build form
    this.formGroup = new FormGroup({
      'mainUrl': new FormControl('',
        Validators.pattern(this.urlPattern)),
      'timezone': new FormControl('')
    });
    this.mainUrl = this.formGroup.controls['mainUrl'];
    this.timezone = this.formGroup.controls['timezone'];

    this.loadConfiguration();
  }

  public loadConfiguration() {
    this.spinnerService.show();
    this.componentService.getSacSettings().subscribe((settings) => {
      this.spinnerService.hide();
      // Init form
      this.formGroup.markAsPristine();
      // Default
      if (!settings) {
        settings = {
          'identifier': ComponentEnum.SAC,
          'mainUrl': '',
          'timezone': '',
          'links': []
        };
      }
      // Keep
      this.sacSettings = settings;
      // get SAC Main Url
      this.mainUrl.setValue(settings.mainUrl);
      // set SAC Links Data Source
      this.sacLinksDataSource.setSacLinks(settings.links, this.formGroup);
      this.sacLinksDataSource.refreshData().subscribe();

      // get timezone
      if (settings.timezone && settings.timezone.length > 0) {
        this.timezone.setValue(settings.timezone);
      } else {
        this.timezone.setValue(moment.tz.guess());
        this.formGroup.markAsDirty();
      }
    }, (error) => {
      // Hide
      this.spinnerService.hide();
      // Handle error
      switch (error.status) {
        // Not found
        case 550:
          // Transaction not found`
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'settings.sac.setting_not_found');
          break;
        default:
          // Unexpected error`
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'general.unexpected_error_backend');
      }
    });
  }

  public save(content) {
    // add links to content
    content.links = this.sacLinksDataSource.getSacLinks();
    // create or update
    if (this.sacSettings.id) {
      this.updateSACConfiguration(content);
    } else {
      this.createSACConfiguration(content);
    }
  }

  private createSACConfiguration(content) {
    // build setting payload
    const setting = {
      'id': null,
      'identifier': ComponentEnum.SAC,
      'content': content
    };

    // Show
    this.spinnerService.show();
    // Yes: Update
    this.centralServerService.createSetting(setting).subscribe(response => {
      // Hide
      this.spinnerService.hide();
      // Ok?
      if (response.status === Constants.REST_RESPONSE_SUCCESS) {
        // Ok
        this.messageService.showSuccessMessage('settings.sac.create_success');
        // Refresh
        this.refresh();
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, 'settings.sac.create_error');
      }
    }, (error) => {
      // Hide
      this.spinnerService.hide();
      // Check status
      switch (error.status) {
        // Setting deleted
        case 550:
          // Show error
          this.messageService.showErrorMessage('settings.sac.setting_do_not_exist');
          break;
        default:
          // No longer exists!
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'settings.sac.create_error');
      }
    });
  }

  private updateSACConfiguration(content) {
    // build setting payload
    const setting = {
      'id': this.sacSettings.id,
      'identifier': ComponentEnum.SAC,
      'content': content
    };
    // Show
    this.spinnerService.show();
    // Yes: Update
    this.centralServerService.updateSetting(setting).subscribe(response => {
      // Hide
      this.spinnerService.hide();
      // Ok?
      if (response.status === Constants.REST_RESPONSE_SUCCESS) {
        // Ok
        this.messageService.showSuccessMessage('settings.sac.update_success');
        this.refresh();
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, 'settings.sac.update_error');
      }
    }, (error) => {
      // Hide
      this.spinnerService.hide();
      // Check status
      switch (error.status) {
        // Setting deleted
        case 550:
          // Show error
          this.messageService.showErrorMessage('settings.sac.setting_do_not_exist');
          break;
        default:
          // No longer exists!
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'settings.sac.update_error');
      }
    });
  }

  public refresh() {
    // Load Setting
    this.loadConfiguration();
  }

  openUrl() {
    window.open(this.mainUrl.value);
  }
}
