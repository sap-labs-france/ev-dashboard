import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { ComponentService } from 'services/component.service';
import TenantComponents from 'types/TenantComponents';

import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { SiteAreasDialogComponent } from '../../../../shared/dialogs/site-areas/site-areas-dialog.component';
import { RegistrationToken } from '../../../../types/RegistrationToken';
import { SiteArea } from '../../../../types/SiteArea';
import { Utils } from '../../../../utils/Utils';
import { RegistrationTokenDialogComponent } from './registration-token.dialog.component';

@Component({
  selector: 'app-settings-registration-token',
  templateUrl: 'registration-token.component.html',
})
export class RegistrationTokenComponent implements OnInit {
  @Input() public currentToken!: RegistrationToken;
  @Input() public inDialog!: boolean;
  @Input() public dialogRef!: MatDialogRef<RegistrationTokenDialogComponent>;
  public readonly isOrganizationComponentActive: boolean;
  public formGroup!: FormGroup;
  public siteArea!: AbstractControl;
  public siteAreaID!: AbstractControl;
  public expirationDate!: AbstractControl;
  public description!: AbstractControl;

  constructor(
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private dialogService: DialogService,
    private componentService: ComponentService,
    private translateService: TranslateService,
    private dialog: MatDialog,
    private router: Router) {
      this.isOrganizationComponentActive = this.componentService.isActive(TenantComponents.ORGANIZATION);
  }

  public ngOnInit(): void {
    this.formGroup = new FormGroup({
      siteArea: new FormControl(),
      siteAreaID: new FormControl(),
      description: new FormControl('', Validators.compose([
        Validators.required,
        Validators.maxLength(100),
      ])),
      expirationDate: new FormControl(moment().add(1, 'month'),
        Validators.compose([
          Validators.required,
        ])),
    });
    this.siteArea = this.formGroup.controls['siteArea'];
    this.siteAreaID = this.formGroup.controls['siteAreaID'];
    this.description = this.formGroup.controls['description'];
    this.expirationDate = this.formGroup.controls['expirationDate'];
  }

  public closeDialog(saved: boolean = false) {
    if (this.inDialog) {
      this.dialogRef.close(saved);
    }
  }

  public close() {
    Utils.checkAndSaveAndCloseDialog(this.formGroup, this.dialogService,
      this.translateService, this.save.bind(this), this.closeDialog.bind(this));
  }

  public save(token: RegistrationToken) {
    this.spinnerService.show();
    this.centralServerService.createRegistrationToken(token).subscribe((response) => {
      this.spinnerService.hide();
      if (token) {
        this.messageService.showSuccessMessage('settings.charging_station.registration_token_creation_success');
        this.closeDialog(true);
      } else {
        Utils.handleError(null,
          this.messageService, 'settings.charging_station.registration_token_creation_error');
      }
    }, (error) => {
      this.spinnerService.hide();
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'tenants.create_error');
    });
  }

  public assignSiteArea() {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    dialogConfig.data = {
      title: 'chargers.assign_site_area',
      validateButtonTitle: 'general.select',
      sitesAdminOnly: true,
      rowMultipleSelection: false,
    };
    // Open
    this.dialog.open(SiteAreasDialogComponent, dialogConfig)
      .afterClosed().subscribe((result) => {
      if (result && result.length > 0 && result[0].objectRef) {
        const siteArea = (result[0].objectRef) as SiteArea;
        this.siteArea.setValue(`${(siteArea.site ? siteArea.site.name + ' - ' : '')}${siteArea.name}`);
        this.siteAreaID.setValue(siteArea.id);
      }
    });
  }
}
