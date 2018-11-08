import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {CentralServerService} from '../../../services/central-server.service';
import {MessageService} from '../../../services/message.service';
import {Router} from '@angular/router';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import {SpinnerService} from '../../../services/spinner.service';
import {Utils} from '../../../utils/Utils';
import {Constants} from '../../../utils/Constants';

@Component({
  templateUrl: './tenant.dialog.component.html',
  styleUrls: ['../../../shared/dialogs/dialogs.component.scss'],
})
export class TenantDialogComponent implements OnInit {
  private messages;
  public formGroup: FormGroup;
  public id: AbstractControl;
  public name: AbstractControl;
  public subdomain: AbstractControl;
  public email: AbstractControl;

  constructor(
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private router: Router,
    protected dialogRef: MatDialogRef<TenantDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {
  }

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      'id': new FormControl(''),
      'name': new FormControl('',
        Validators.compose([
          Validators.required
        ])),
      'email': new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.email
        ])),
      'subdomain': new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(20),
          Validators.pattern('^[a-z0-9]*$')
        ]))
    });

    this.id = this.formGroup.controls['id'];
    this.name = this.formGroup.controls['name'];
    this.email = this.formGroup.controls['email'];
    this.subdomain = this.formGroup.controls['subdomain'];
  }

  cancel() {
    this.dialogRef.close();
  }

  save(tenant) {
    // Show
    this.spinnerService.show();
    // Yes: Update
    this.centralServerService.createTenant(tenant).subscribe(response => {
      // Hide
      this.spinnerService.hide();
      // Ok?
      if (response.status === Constants.REST_RESPONSE_SUCCESS) {
        // Ok
        this.messageService.showSuccessMessage('tenants.create_success', {'name': tenant.name});
        this.dialogRef.close();
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, 'tenants.create_error');
      }
    }, (error) => {
      // Hide
      this.spinnerService.hide();
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
        'tenants.create_error');
    });
  }
}
