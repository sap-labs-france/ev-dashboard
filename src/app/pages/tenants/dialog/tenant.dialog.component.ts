import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { CentralServerService } from '../../../services/central-server.service';
import { MessageService } from '../../../services/message.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { FormGroup, AbstractControl, Validators, FormControl } from '@angular/forms';
import { SpinnerService } from '../../../services/spinner.service';
import { Utils } from '../../../utils/Utils';

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

    constructor(
        private centralServerService: CentralServerService,
        private messageService: MessageService,
        private translateService: TranslateService,
        private spinnerService: SpinnerService,
        private router: Router,
        protected dialogRef: MatDialogRef<TenantDialogComponent>,
        @Inject(MAT_DIALOG_DATA) data) {

        this.translateService.get('tenants', {}).subscribe((messages) => {
            this.messages = messages;
        });
    }

    ngOnInit(): void {
        this.formGroup = new FormGroup({
            'id': new FormControl(''),
            'name': new FormControl('',
                Validators.compose([
                    Validators.required
                ])),
            'subdomain': new FormControl('',
                Validators.compose([
                    Validators.required,
                    Validators.minLength(2),
                    Validators.maxLength(10),
                    Validators.pattern('^[a-z0-9]*$')
                ]))
        });

        this.id = this.formGroup.controls['id'];
        this.name = this.formGroup.controls['name'];
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
            if (response.status === 'Success') {
                // Ok
                this.messageService.showSuccessMessage(this.translateService.instant('tenants.create_success',
                    { 'name': tenant.name }));
                this.dialogRef.close();
            } else {
                Utils.handleError(JSON.stringify(response),
                    this.messageService, this.messages['update_error']);
            }
        }, (error) => {
            // Hide
            this.spinnerService.hide();
            // Check status
            switch (error.status) {
                case 510:
                    this.messageService.showErrorMessage(
                        this.translateService.instant('tenants.already_used'));
                    break;
                default:
                    Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
                        this.messages['update_error']);
            }
        });
    }
}
