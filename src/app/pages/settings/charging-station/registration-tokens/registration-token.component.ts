import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RegistrationToken } from 'app/types/RegistrationToken';
import { SiteArea } from 'app/types/SiteArea';
import * as moment from 'moment';
import { CentralServerService } from '../../../../services/central-server.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { SiteAreasDialogComponent } from '../../../../shared/dialogs/site-areas/site-areas-dialog.component';
import { Utils } from '../../../../utils/Utils';

@Component({
  templateUrl: 'registration-token.component.html',
})
export class RegistrationTokenComponent implements OnInit {
  public formGroup!: FormGroup;
  public siteArea!: AbstractControl;
  public siteAreaID!: AbstractControl;
  public expirationDate!: AbstractControl;
  public description!: AbstractControl;

  constructor(
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private dialog: MatDialog,
    private router: Router,
    protected dialogRef: MatDialogRef<RegistrationTokenComponent>,
    @Inject(MAT_DIALOG_DATA) data: any) {
  }

  public ngOnInit(): void {
    this.formGroup = new FormGroup({
      siteArea: new FormControl(),
      siteAreaID: new FormControl(),
      description: new FormControl('', Validators.compose([
        Validators.required,
        Validators.maxLength(100),
      ])),
      // @ts-ignore
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

  public cancel() {
    this.dialogRef.close();
  }

  public save(token: RegistrationToken) {
    this.spinnerService.show();
    this.centralServerService.createRegistrationToken(token).subscribe((response) => {
      this.spinnerService.hide();
      if (token) {
        this.messageService.showSuccessMessage('settings.charging_station.registration_token_creation_success');
        this.dialogRef.close(true);
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
