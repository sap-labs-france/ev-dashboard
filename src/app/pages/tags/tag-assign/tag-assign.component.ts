import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { StatusCodes } from 'http-status-codes';
import { TagsAuthorizationActions } from 'types/Authorization';

import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerService } from '../../../services/central-server.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { ActionResponse } from '../../../types/DataResult';
import { RestResponse } from '../../../types/GlobalType';
import { HTTPError } from '../../../types/HTTPError';
import { Tag } from '../../../types/Tag';
import { Utils } from '../../../utils/Utils';

@Component({
  selector: 'app-tag-assign',
  templateUrl: 'tag-assign.component.html',
})
export class TagAssignComponent implements OnInit {
  @Input() public currentTagVisualID!: string;
  @Input() public inDialog!: boolean;
  @Input() public dialogRef!: MatDialogRef<any>;
  @Input() public tagsAuthorizations!: TagsAuthorizationActions;

  public formGroup!: UntypedFormGroup;
  public description!: AbstractControl;
  public user!: AbstractControl;
  public userID!: AbstractControl;
  public default!: AbstractControl;
  public visualID!: AbstractControl;
  public canListUsers: boolean;

  public constructor(
    public spinnerService: SpinnerService,
    private authorizationService: AuthorizationService,
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private dialogService: DialogService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.canListUsers = this.authorizationService.canListUsers();
  }

  public ngOnInit() {
    // Init the form
    this.formGroup = new UntypedFormGroup({
      user: new UntypedFormControl('', Validators.compose([Validators.required])),
      userID: new UntypedFormControl('', Validators.compose([Validators.required])),
      description: new UntypedFormControl('', Validators.compose([Validators.required])),
      visualID: new UntypedFormControl('', Validators.compose([Validators.required])),
      default: new UntypedFormControl('', Validators.compose([Validators.required])),
    });

    // Form
    this.description = this.formGroup.controls['description'];
    this.visualID = this.formGroup.controls['visualID'];
    this.user = this.formGroup.controls['user'];
    this.userID = this.formGroup.controls['userID'];
    this.default = this.formGroup.controls['default'];
    this.default.setValue(false);
    this.user.setValue(Utils.buildUserFullName(this.centralServerService.getLoggedUser()));
    this.userID.setValue(this.centralServerService.getLoggedUser().id);
    this.user.disable();
    this.userID.disable();
    // Set tag
    this.loadTag();
  }

  public onClose() {
    this.closeDialog();
  }

  public loadTag() {
    if (this.currentTagVisualID) {
      this.spinnerService.show();
      this.centralServerService.getTagByVisualID(this.currentTagVisualID).subscribe({
        next: (tag: Tag) => {
          this.spinnerService.hide();
          // Init form
          if (tag.visualID) {
            this.visualID.setValue(tag.visualID);
            this.visualID.disable();
          }
          this.description.setValue(tag.description);
          this.visualID.setValue(tag.visualID);
          this.default.setValue(tag.default);
          // Update form group
          this.formGroup.updateValueAndValidity();
          this.formGroup.markAsPristine();
          this.formGroup.markAllAsTouched();
          // Yes, get image
        },
        error: (error) => {
          this.spinnerService.hide();
          switch (error.status) {
            case StatusCodes.NOT_FOUND:
              this.messageService.showErrorMessage('tags.tag_not_found');
              break;
            default:
              Utils.handleHttpError(
                error,
                this.router,
                this.messageService,
                this.centralServerService,
                'tags.tag_error'
              );
          }
        },
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
    Utils.checkAndSaveAndCloseDialog(
      this.formGroup,
      this.dialogService,
      this.translateService,
      this.saveTag.bind(this),
      this.closeDialog.bind(this)
    );
  }

  public saveTag(tag: Tag) {
    if (this.currentTagVisualID) {
      this.updateTag(tag);
    } else {
      this.assignTag(tag);
    }
  }

  private updateTag(tag: Tag) {
    this.spinnerService.show();
    this.centralServerService.updateTag(tag).subscribe({
      next: (response: ActionResponse) => {
        this.spinnerService.hide();
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage('tags.update_by_visual_id_success', {
            visualID: tag.visualID,
          });
          this.closeDialog(true);
        } else {
          Utils.handleError(JSON.stringify(response), this.messageService, 'tags.update_error');
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case HTTPError.TAG_VISUAL_ID_ALREADY_EXIST_ERROR:
            this.messageService.showErrorMessage('tags.tag_visual_id_already_used', {
              visualID: tag.visualID,
            });
            break;
          default:
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              'tags.update_error'
            );
        }
      },
    });
  }

  private assignTag(tag: Tag) {
    this.spinnerService.show();
    this.centralServerService.assignTag(tag).subscribe({
      next: (response: ActionResponse) => {
        this.spinnerService.hide();
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage('tags.register_success', {
            visualID: tag.visualID,
          });
          this.closeDialog(true);
        } else {
          Utils.handleError(JSON.stringify(response), this.messageService, 'tags.register_error');
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case StatusCodes.NOT_FOUND:
            this.messageService.showErrorMessage('tags.tag_visual_id_does_not_match_tag', {
              visualID: tag.visualID,
            });
            break;
          case HTTPError.TAG_INACTIVE:
            this.messageService.showErrorMessage('tags.tag_inactive', { visualID: tag.visualID });
            break;
          default:
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              'tags.register_error'
            );
        }
      },
    });
  }
}
