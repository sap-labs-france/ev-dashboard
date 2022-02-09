import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthorizationDefinitionFieldMetadata, DialogMode } from 'types/Authorization';

import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerService } from '../../../services/central-server.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { UsersDialogComponent } from '../../../shared/dialogs/users/users-dialog.component';
import { ActionResponse } from '../../../types/DataResult';
import { RestResponse } from '../../../types/GlobalType';
import { HTTPError } from '../../../types/HTTPError';
import { Tag } from '../../../types/Tag';
import { Utils } from '../../../utils/Utils';

@Component({
  selector: 'app-tag',
  templateUrl: 'tag.component.html'
})
export class TagComponent implements OnInit {
  @Input() public currentTagID!: string;
  @Input() public metadata!: Record<string, AuthorizationDefinitionFieldMetadata>;
  @Input() public inDialog!: boolean;
  @Input() public dialogRef!: MatDialogRef<any>;
  @Input() public dialogMode!: DialogMode;

  public formGroup!: FormGroup;
  public id!: AbstractControl;
  public description!: AbstractControl;
  public user!: AbstractControl;
  public userID!: AbstractControl;
  public active!: AbstractControl;
  public default!: AbstractControl;
  public visualID!: AbstractControl;

  public isAdmin = false;

  public constructor(
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
        ])),
      userID: new FormControl('',
        Validators.compose([
        ])),
      description: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      visualID: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      active: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      default: new FormControl(false,
        Validators.compose([
          Validators.required,
        ])),
    });
    // Form
    this.id = this.formGroup.controls['id'];
    this.description = this.formGroup.controls['description'];
    this.visualID = this.formGroup.controls['visualID'];
    this.user = this.formGroup.controls['user'];
    this.userID = this.formGroup.controls['userID'];
    this.active = this.formGroup.controls['active'];
    this.default = this.formGroup.controls['default'];
    this.default.disable();
    if (this.currentTagID) {
      this.id.disable();
    }
    if (this.metadata?.userID?.mandatory) {
      this.user.setValidators(Validators.required);
      this.userID.setValidators(Validators.required);
    }
    this.loadTag();
    // Handle Dialog mode
    Utils.handleDialogMode(this.dialogMode, this.formGroup);
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
      this.default.enable();
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
        this.visualID.setValue(tag.visualID);
        this.active.setValue(tag.active);
        if (tag.user) {
          this.userID.setValue(tag.user.id);
          this.user.setValue(Utils.buildUserFullName(tag.user));
          this.default.enable();
          this.default.setValue(tag.default);
        }
        if (this.metadata?.userID?.mandatory) {
          this.user.setValidators(Validators.required);
          this.userID.setValidators(Validators.required);
        }
        this.id.disable();
        this.formGroup.updateValueAndValidity();
        this.formGroup.markAsPristine();
        this.formGroup.markAllAsTouched();
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

  public resetUser() {
    this.userID.reset();
    this.user.reset();
    this.default.setValue(false);
    this.default.disable();
    this.formGroup.markAsDirty();
  }

  private updateTag(tag: Tag) {
    this.spinnerService.show();
    this.centralServerService.updateTag(tag).subscribe((response: ActionResponse) => {
      this.spinnerService.hide();
      if (response.status === RestResponse.SUCCESS) {
        this.messageService.showSuccessMessage('tags.update_success', { tagID: tag.id });
        this.closeDialog(true);
      } else {
        Utils.handleError(JSON.stringify(response), this.messageService, 'tags.update_error');
      }
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case HTTPError.TAG_VISUAL_ID_ALREADY_EXIST_ERROR:
          this.messageService.showErrorMessage('tags.tag_visual_id_already_used', { visualID: tag.visualID });
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'tags.update_error');
      }
    });
  }

  private createTag(tag: Tag) {
    this.spinnerService.show();
    this.centralServerService.createTag(tag).subscribe((response: ActionResponse) => {
      this.spinnerService.hide();
      if (response.status === RestResponse.SUCCESS) {
        this.messageService.showSuccessMessage('tags.create_success', { tagID: tag.id });
        this.closeDialog(true);
      } else {
        Utils.handleError(JSON.stringify(response), this.messageService, 'tags.create_error');
      }
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case HTTPError.TAG_ALREADY_EXIST_ERROR:
          this.messageService.showErrorMessage('tags.tag_id_already_used', { tagID: tag.id });
          break;
        case HTTPError.TAG_VISUAL_ID_ALREADY_EXIST_ERROR:
          this.messageService.showErrorMessage('tags.tag_visual_id_already_used', { visualID: tag.visualID });
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'tags.create_error');
      }
    });
  }
}
