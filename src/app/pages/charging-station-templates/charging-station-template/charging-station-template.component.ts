import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { StatusCodes } from 'http-status-codes';

import { CentralServerService } from '../../../services/central-server.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { WindowService } from '../../../services/window.service';
import { AbstractTabComponent } from '../../../shared/component/abstract-tab/abstract-tab.component';
import { DialogMode } from '../../../types/Authorization';
import { ChargingStationTemplate } from '../../../types/ChargingStationTemplate';
import { RestResponse } from '../../../types/GlobalType';
import { Utils } from '../../../utils/Utils';
import { ChargingStationTemplateMainComponent } from './main/charging-station-template-main.component';

@Component({
  selector: 'app-charging-station-template',
  templateUrl: 'charging-station-template.component.html',
  styleUrls: ['charging-station-template.component.scss'],
})
export class ChargingStationTemplateComponent extends AbstractTabComponent implements OnInit {
  @Input() public currentTemplateID!: string;
  @Input() public dialogMode!: DialogMode;
  @Input() public dialogRef!: MatDialogRef<any>;
  @Input() public dialogTitle!: string;

  @ViewChild('chargingStationTemplateMainComponent')
  public chargingStationTemplateMainComponent!: ChargingStationTemplateMainComponent;

  public formGroup!: FormGroup;
  public readOnly = true;
  public chargingStationTemplate!: ChargingStationTemplate;

  public constructor(
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private dialogService: DialogService,
    private translateService: TranslateService,
    private router: Router,
    protected activatedRoute: ActivatedRoute,
    protected windowService: WindowService
  ) {
    super(activatedRoute, windowService, ['main'], false);
  }

  public ngOnInit() {
    // Init the form
    this.formGroup = new FormGroup({});
    // Handle Dialog mode
    this.readOnly = this.dialogMode === DialogMode.VIEW;
    Utils.handleDialogMode(this.dialogMode, this.formGroup);
    // Load templates
    this.loadChargingStationTemplate();
  }

  public loadChargingStationTemplate() {
    if (this.currentTemplateID) {
      this.spinnerService.show();
      this.centralServerService.getChargingStationTemplate(this.currentTemplateID).subscribe({
        next: (chargingStationTemplate) => {
          this.spinnerService.hide();
          this.chargingStationTemplate = chargingStationTemplate;
          if (this.readOnly) {
            // Async call for letting the sub form groups to init
            setTimeout(() => this.formGroup.disable(), 0);
          }
          // Update form group
          this.formGroup.updateValueAndValidity();
          this.formGroup.markAsPristine();
          this.formGroup.markAllAsTouched();
        },
        error: (error) => {
          this.spinnerService.hide();
          switch (error.status) {
            case StatusCodes.NOT_FOUND:
              this.messageService.showErrorMessage('templates.template_not_found');
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
  }

  public closeDialog(saved: boolean = false) {
    if (this.dialogRef) {
      this.dialogRef.close(saved);
    }
  }

  public close() {
    Utils.checkAndSaveAndCloseDialog(
      this.formGroup,
      this.dialogService,
      this.translateService,
      this.saveTemplate.bind(this),
      this.closeDialog.bind(this)
    );
  }

  public saveTemplate() {
    const chargingStationTemplate: ChargingStationTemplate = {
      id: this.currentTemplateID || '',
      template: JSON.parse(this.formGroup.controls.template.value),
    };
    if (this.currentTemplateID) {
      this.updateChargingStationTemplate(chargingStationTemplate);
    } else {
      this.createChargingStationTemplate(chargingStationTemplate);
    }
  }

  private createChargingStationTemplate(template: ChargingStationTemplate) {
    this.spinnerService.show();
    // Create
    this.centralServerService.createChargingStationTemplate(template).subscribe({
      next: (response) => {
        this.spinnerService.hide();
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage('templates.create_success', {
            template:
              template.template.chargePointVendor +
              ' - ' +
              template.template.extraFilters.chargePointModel,
          });
          this.closeDialog(true);
        } else {
          Utils.handleError(
            JSON.stringify(response),
            this.messageService,
            'templates.create_error'
          );
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case StatusCodes.NOT_FOUND:
            this.messageService.showErrorMessage('templates.template_not_found');
            break;
          default:
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              'templates.create_error'
            );
        }
      },
    });
  }

  private updateChargingStationTemplate(chargingStationTemplate: ChargingStationTemplate) {
    this.spinnerService.show();
    // Update
    this.centralServerService.updateChargingStationTemplate(chargingStationTemplate).subscribe({
      next: (response) => {
        this.spinnerService.hide();
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage('templates.update_success', {
            template:
              chargingStationTemplate.template.chargePointVendor +
              ' - ' +
              chargingStationTemplate.template.extraFilters.chargePointModel,
          });
          this.closeDialog(true);
        } else {
          Utils.handleError(
            JSON.stringify(response),
            this.messageService,
            'templates.update_error'
          );
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case StatusCodes.NOT_FOUND:
            this.messageService.showErrorMessage('templates.template_not_found');
            break;
          default:
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              'templates.update_error'
            );
        }
      },
    });
  }
}
