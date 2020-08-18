import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthorizationService } from 'app/services/authorization.service';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { UsersDialogComponent } from 'app/shared/dialogs/users/users-dialog.component';
import { ActionResponse } from 'app/types/DataResult';
import { RestResponse } from 'app/types/GlobalType';
import { HTTPError } from 'app/types/HTTPError';
import { Tag } from 'app/types/Tag';
import { Utils } from 'app/utils/Utils';

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
  public issuer!: AbstractControl;
  public user!: AbstractControl;
  public userID!: AbstractControl;
  public active!: AbstractControl;


  constructor(
    public spinnerService: SpinnerService,
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private dialogService: DialogService,
    private router: Router,
    private dialog: MatDialog) {
  }

  public ngOnInit() {
    // Init the form
    this.formGroup = new FormGroup({
      id: new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(20),
          Validators.pattern('^[a-zA-Z0-9]*$'),
        ])),
      issuer: new FormControl('',
        Validators.compose([
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
        ])),
      active: new FormControl(true,
        Validators.compose([
        ])),
    });
    // Form
    this.id = this.formGroup.controls['id'];
    this.description = this.formGroup.controls['description'];
    this.issuer = this.formGroup.controls['issuer'];
    this.user = this.formGroup.controls['user'];
    this.userID = this.formGroup.controls['userID'];
    this.active = this.formGroup.controls['active'];
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
        this.userID.setValue(tag.user.id);
        this.description.setValue(tag.description);
        this.issuer.setValue(tag.issuer);
        this.active.setValue(tag.active);
        this.user.setValue(Utils.buildUserFullName(tag.user));
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
        this.closeDialog(true);
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
        this.closeDialog(true);
      } else {
        Utils.handleError(JSON.stringify(response), this.messageService, 'tags.create_error');
      }
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case HTTPError.USER_TAG_ID_ALREADY_USED_ERROR:
          this.messageService.showErrorMessage('tags.user_tag_id_already_used');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'tags.create_error');
      }
    });
  }
}
