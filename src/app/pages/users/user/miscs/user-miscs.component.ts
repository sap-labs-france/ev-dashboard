import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from 'services/central-server.service';
import { DialogService } from 'services/dialog.service';
import { MessageService } from 'services/message.service';
import { SpinnerService } from 'services/spinner.service';
import { AuthorizationDefinitionFieldMetadata, DialogMode } from 'types/Authorization';
import { ButtonAction, RestResponse } from 'types/GlobalType';
import { User } from 'types/User';
import { Utils } from 'utils/Utils';

@Component({
  selector: 'app-user-miscs',
  templateUrl: 'user-miscs.component.html',
})
// @Injectable()
export class UserMiscsComponent implements OnInit, OnChanges {
  @Input() public formGroup: UntypedFormGroup;
  @Input() public user!: User;
  @Input() public dialogMode!: DialogMode;
  @Input() public metadata!: Record<string, AuthorizationDefinitionFieldMetadata>;

  public initialized = false;

  public iNumber!: AbstractControl;
  public costCenter!: AbstractControl;

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    private centralServerService: CentralServerService,
    private router: Router,
    private spinnerService: SpinnerService,
    private dialogService: DialogService,
    private messageService: MessageService,
    private translateService: TranslateService) {
  }

  public ngOnInit(): void {
    // Init the form
    this.formGroup.addControl('iNumber', new FormControl(''));
    this.formGroup.addControl('costCenter', new FormControl('',
      Validators.compose([
        Validators.pattern('^[0-9]*$'),
      ])
    ));
    // Form
    this.iNumber = this.formGroup.controls['iNumber'];
    this.costCenter = this.formGroup.controls['costCenter'];
    this.initialized = true;
    this.loadUser();
  }

  public ngOnChanges() {
    this.loadUser();
  }

  public loadUser() {
    if (this.initialized && this.user) {
      if (this.user.iNumber) {
        this.iNumber.setValue(this.user.iNumber);
      }
      if (this.user.costCenter) {
        this.costCenter.setValue(this.user.costCenter);
      }
    }
  }

  public deleteUserAccountConfirm() {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant(this.translateService.instant('users.delete_account_title')),
      this.translateService.instant(this.translateService.instant('users.delete_account_confirm')),
    ).subscribe((result) => {
      if (result === ButtonAction.YES) {
        this.spinnerService.show();
        this.centralServerService.deleteUser(this.user.id).subscribe({
          next: (response) => {
            this.spinnerService.hide();
            if (response.status === RestResponse.SUCCESS) {
              this.messageService.showSuccessMessage(
                this.translateService.instant('users.delete_account_success'));
              // Log out
              this.centralServerService.logout().subscribe({
                next: () => {
                  this.centralServerService.clearLoginInformation();
                  void this.router.navigate(['/auth/login']);
                },
                error: (error) => {
                  this.centralServerService.clearLoginInformation();
                  void this.router.navigate(['/auth/login']);
                }
              });
            } else {
              Utils.handleError(JSON.stringify(response), this.messageService,
                this.translateService.instant('users.delete_account_error'));
            }
          },
          error: (error) => {
            this.spinnerService.hide();
            Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
              this.translateService.instant('users.delete_account_error'));
          }
        });
      }
    });
  }
}
