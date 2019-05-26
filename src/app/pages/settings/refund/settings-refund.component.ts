import {Component, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {CentralServerService} from '../../../services/central-server.service';
import {Constants} from '../../../utils/Constants';
import {Utils} from '../../../utils/Utils';
import {SpinnerService} from '../../../services/spinner.service';
import {MessageService} from '../../../services/message.service';
import {Router} from '@angular/router';
import {ComponentEnum, ComponentService} from '../../../services/component.service';
import { RefundSettings } from 'app/common.types';

@Component({
  selector: 'app-settings-refund',
  templateUrl: 'settings-refund.component.html'
})
export class SettingsRefundComponent implements OnInit {
  public isActive = false;

  public formGroup: FormGroup;
  public refundSettings: RefundSettings;

  constructor(
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private spinnerService: SpinnerService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.isActive = this.componentService.isActive(ComponentEnum.REFUND);
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
    this.componentService.getRefundSettings().subscribe((settings) => {
      this.spinnerService.hide();
      // Keep
      this.refundSettings = settings;
      // Init form
      this.formGroup.markAsPristine();
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case 550:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'settings.refund.setting_not_found');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.unexpected_error_backend');
      }
    });
  }

  public save(content) {
    // Set the content
    this.refundSettings[Object.keys(content)[0]] = content[Object.keys(content)[0]];
    // Save
    this.spinnerService.show();
    this.componentService.saveRefundSettings(this.refundSettings).subscribe((response) => {
      this.spinnerService.hide();
      if (response.status === Constants.REST_RESPONSE_SUCCESS) {
        this.messageService.showSuccessMessage(
          (!this.refundSettings.id ? 'settings.refund.create_success' : 'settings.refund.update_success'));
        this.refresh();
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, (!this.refundSettings.id ? 'settings.refund.create_error' : 'settings.refund.update_error'));
      }
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case 550:
          this.messageService.showErrorMessage('settings.refund.setting_do_not_exist');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            (!this.refundSettings.id ? 'settings.refund.create_error' : 'settings.refund.update_error'));
      }
    });
  }

  public refresh() {
    this.loadConfiguration();
  }
}
