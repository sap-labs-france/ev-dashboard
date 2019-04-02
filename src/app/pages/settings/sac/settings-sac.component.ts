import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import * as moment from 'moment-timezone';

import {AuthorizationService} from 'app/services/authorization-service';
import {CentralServerService} from 'app/services/central-server.service';
import {MessageService} from 'app/services/message.service';
import {Constants} from 'app/utils/Constants';
import {SpinnerService} from 'app/services/spinner.service';
import {Utils} from 'app/utils/Utils';
import {ComponentEnum, ComponentService} from '../../../services/component.service';
import {SacLinksDataSource} from './sac-links/settings-sac-links-source-table';

@Component({
  selector: 'app-settings-sac',
  templateUrl: 'settings-sac.component.html',
  providers: [
    SacLinksDataSource
  ]
})
export class SettingsSacComponent implements OnInit {
  public isAdmin;
  public formGroup: FormGroup;
  public mainUrl: AbstractControl;
  public timezone: AbstractControl;
  public isSacActive = false;

  public timezoneList: any = [];
  public currentSettingID: any;

  private urlPattern = /^(?:https?|wss?):\/\/((?:[\w-]+)(?:\.[\w-]+)*)(?:[\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?$/;

  constructor(
    private authorizationService: AuthorizationService,
    private translateService: TranslateService,
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

    this.loadSACConfiguration();
  }

  public loadSACConfiguration() {
    // Show spinner
    this.spinnerService.show();
    // Yes, get it
    this.centralServerService.getSettings(Constants.SETTINGS_SAC).subscribe((sacConfiguration) => {
      this.spinnerService.hide();

      // get SAC configuration
      let sacContent = { mainUrl: '', timezone: '', links: []};
      if (sacConfiguration && sacConfiguration.count > 0 && sacConfiguration.result[0].content) {
        // define setting ID
        this.currentSettingID = sacConfiguration.result[0].id;

        // build default void object
        sacContent = sacConfiguration.result[0].content;
      }

      // get SAC Main Url
      if (sacContent.mainUrl) {
        this.mainUrl.setValue(sacContent.mainUrl);
      }

      // set SAC Links Data Source
      this.sacLinksDataSource.setSacSettings(sacContent);
      this.sacLinksDataSource.loadData();

      this.formGroup.markAsPristine();

      // get timezone
      if (sacContent.timezone) {
        this.timezone.setValue(sacContent.timezone);
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
    if (this.currentSettingID) {
      this._updateSACConfiguration(content);
    } else {
      this._createSACConfiguration(content);
    }
  }

  private _createSACConfiguration(content) {
    // build setting payload
    const setting = {
      'id': null,
      'identifier': Constants.SETTINGS_SAC,
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

  private _updateSACConfiguration(content) {
    // build setting payload
    const setting = {
      'id': this.currentSettingID,
      'identifier': Constants.SETTINGS_SAC,
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
    this.loadSACConfiguration();
  }

  openUrl() {
    window.open(this.mainUrl.value);
  }
}
