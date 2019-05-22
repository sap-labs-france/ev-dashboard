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
import { SacSettings, SacSettingsType } from 'app/common.types';

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
        Validators.pattern(Constants.URL_PATTERN)),
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
      // Default
      if (!settings) {
        settings = {
          'identifier': ComponentEnum.SAC,
          'type': SacSettingsType.sac,
          'sac': {
            'mainUrl': '',
            'timezone': '',
            'links': []
          }
        };
      }
      // Keep
      this.sacSettings = settings;
      // get SAC Main Url
      this.mainUrl.setValue((settings.sac ? settings.sac.mainUrl : ''));
      // set SAC Links Data Source
      this.sacLinksDataSource.setSacLinks(settings.sac ? settings.sac.links : [], this.formGroup);
      this.sacLinksDataSource.loadData().subscribe();
      // get timezone
      if (settings.sac && settings.sac.timezone && settings.sac.timezone.length > 0) {
        this.timezone.setValue(settings.sac.timezone);
      }
      // Init form
      this.formGroup.markAsPristine();
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
    this.sacSettings.sac = content;
    this.sacSettings.type = SacSettingsType.sac;
    console.log(this.sacSettings);
    // Save
    this.spinnerService.show();
    this.componentService.saveSacSettings(this.sacSettings).subscribe((response) => {
      this.spinnerService.hide();
      if (response.status === Constants.REST_RESPONSE_SUCCESS) {
        this.messageService.showSuccessMessage(
          (!this.sacSettings.id ? 'settings.sac.create_success' : 'settings.sac.update_success'));
        this.refresh();
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, (!this.sacSettings.id ? 'settings.sac.create_error' : 'settings.sac.update_error'));
      }
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case 550:
          this.messageService.showErrorMessage('settings.sac.setting_do_not_exist');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            (!this.sacSettings.id ? 'settings.sac.create_error' : 'settings.sac.update_error'));
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
