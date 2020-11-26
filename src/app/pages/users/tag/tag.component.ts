import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerService } from '../../../services/central-server.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { UsersDialogComponent } from '../../../shared/dialogs/users/users-dialog.component';
import { ActionResponse } from '../../../types/DataResult';
import { RestResponse } from '../../../types/GlobalType';
import { HTTPError } from '../../../types/HTTPError';
import { ButtonType } from '../../../types/Table';
import { Tag } from '../../../types/Tag';
import { Utils } from '../../../utils/Utils';

@Component({
  selector: 'app-tag',
  templateUrl: 'tag.component.html'
})
export class TagComponent implements OnInit {
  @Input() public currentTagID!: string;
  @Input() public inDialog!: boolean;
  @Input() public dialogRef!: MatDialogRef<any>;

  public formGroup!: FormGroup;
  public id!: AbstractControl;
  public description!: AbstractControl;
  public user!: AbstractControl;
  public userID!: AbstractControl;
  public active!: AbstractControl;
  public default!: AbstractControl;

  public isAdmin = false;

  constructor(
    public spinnerService: SpinnerService,
    private authorizationService: AuthorizationService,
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private dialogService: DialogService,
    private router: Router,
    private dialog: MatDialog) {
    this.isAdmin = this.authorizationService.isAdmin();
  }

  public ngOnInit() {
    // Init the form
    this.formGroup = new FormGroup({
      id: new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(20),
          Validators.pattern('^[a-zA-Z0-9]*$'),
        ])),
      user: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      userID: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      description: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      active: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      default: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
    });
    // Form
    this.id = this.formGroup.controls['id'];
    this.description = this.formGroup.controls['description'];
    this.user = this.formGroup.controls['user'];
    this.userID = this.formGroup.controls['userID'];
    this.active = this.formGroup.controls['active'];
    this.default = this.formGroup.controls['default'];
    this.default.setValue(false);
    if (this.currentTagID) {
      this.id.disable();
    }
    // Set tag
    this.loadTag();
  }

  public onClose() {
    this.closeDialog();
  }

  public assignUser() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    // Set data
    dialogConfig.data = {
      rowMultipleSelection: false,
      staticFilter: {
      },
    };
    // Show
    const dialogRef = this.dialog.open(UsersDialogComponent, dialogConfig);
    // Register to the answer
    dialogRef.afterClosed().subscribe((result) => {
      this.user.setValue(Utils.buildUserFullName(result[0].objectRef));
      this.userID.setValue(result[0].key);
      this.formGroup.markAsDirty();
    });
  }

  public loadTag() {
    if (this.currentTagID) {
      this.spinnerService.show();
      this.centralServerService.getTag(this.currentTagID).subscribe((tag: Tag) => {
        this.spinnerService.hide();
        // Init form
        this.id.setValue(tag.id);
        this.description.setValue(tag.description);
        this.active.setValue(tag.active);
        if (tag.user) {
          this.userID.setValue(tag.user.id);
          this.user.setValue(Utils.buildUserFullName(tag.user));
        }
        this.default.setValue(tag.default);
        this.id.disable();
        this.formGroup.updateValueAndValidity();
        this.formGroup.markAsPristine();
        this.formGroup.markAllAsTouched();
        // Yes, get image
      }, (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case HTTPError.OBJECT_DOES_NOT_EXIST_ERROR:
            this.messageService.showErrorMessage('tags.tag_not_found');
            break;
          default:
            Utils.handleHttpError(error, this.router, this.messageService,
              this.centralServerService, 'tags.tag_error');
        }
      });
    }
  }

  public closeDialog(saved: boolean = false) {
    if (this.inDialog) {
      this.dialogRef.close(saved);
    }
  }

  public toUpperCase(control: AbstractControl) {
    control.setValue(control.value.toUpperCase());
  }

  public close() {
    Utils.checkAndSaveAndCloseDialog(this.formGroup, this.dialogService,
      this.translateService, this.saveTag.bind(this), this.closeDialog.bind(this));
  }

  public saveTag(tag: Tag) {
    if (this.currentTagID) {
      this.updateTag(tag);
    } else {
      this.createTag(tag);
    }
  }

  private updateTag(tag: Tag) {
    this.spinnerService.show();
    this.centralServerService.updateTag(tag).subscribe((response: ActionResponse) => {
      this.spinnerService.hide();
      if (response.status === RestResponse.SUCCESS) {
        this.messageService.showSuccessMessage('tags.update_success', { tagID: tag.id });
        // Reassign transactions to user?
        this.checkUnassignedTransactions(tag.userID, tag.id);
      } else {
        Utils.handleError(JSON.stringify(response), this.messageService, 'tags.update_error');
      }
    }, (error) => {
      this.spinnerService.hide();
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'tags.update_error');
    });
  }

  private createTag(tag: Tag) {
    this.spinnerService.show();
    this.centralServerService.createTag(tag).subscribe((response: ActionResponse) => {
      this.spinnerService.hide();
      if (response.status === RestResponse.SUCCESS) {
        this.messageService.showSuccessMessage('tags.create_success', { tagID: tag.id });
        // Reassign transactions to user?
        this.checkUnassignedTransactions(tag.userID, tag.id);
      } else {
        Utils.handleError(JSON.stringify(response), this.messageService, 'tags.create_error');
      }
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case HTTPError.TAG_ALREADY_EXIST_ERROR:
          this.messageService.showErrorMessage('tags.tag_id_already_used', { tagID: tag.id });
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'tags.create_error');
      }
    });
  }

  private checkUnassignedTransactions(userID: string, tagID: string) {
    // Admin?
    if (this.isAdmin && userID && tagID) {
      // Check if there are unassigned transactions
      this.centralServerService.getUnassignedTransactionsCount(tagID).subscribe((count) => {
        if (count && count > 0) {
          this.dialogService.createAndShowYesNoDialog(
            this.translateService.instant('users.assign_transactions_title'),
            this.translateService.instant('users.assign_transactions_confirm', { count }),
          ).subscribe((result) => {
            if (result === ButtonType.YES) {
              // Assign transactions to User
              this.assignTransactionsToUser(userID, tagID);
            } else {
              this.closeDialog(true);
            }
          });
        } else {
          this.closeDialog(true);
        }
      }, (error) => {
        // Hide
        this.spinnerService.hide();
        if (this.currentTagID) {
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'users.update_error');
        } else {
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'users.create_error');
        }
      });
    } else {
      this.closeDialog(true);
    }
  }

  private assignTransactionsToUser(userID: string, tagID: string) {
    // Assign Transactions to User
    this.spinnerService.show();
    this.centralServerService.assignTransactionsToUser(userID, tagID).subscribe((response) => {
      this.spinnerService.hide();
      if (response.status === RestResponse.SUCCESS) {
        this.messageService.showSuccessMessage('users.assign_transactions_success', { userFullName: this.user.value });
      } else {
        Utils.handleError(JSON.stringify(response), this.messageService, 'users.assign_transactions_error');
      }
      this.closeDialog(true);
    }, (error) => {
      this.spinnerService.hide();
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'users.assign_transactions_error');
    });
  }
}
