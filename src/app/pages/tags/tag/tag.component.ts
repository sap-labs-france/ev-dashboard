import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { StatusCodes } from 'http-status-codes';
import { WindowService } from 'services/window.service';
import { AbstractTabComponent } from 'shared/component/abstract-tab/abstract-tab.component';
import { DialogMode, TagsAuthorizations } from 'types/Authorization';

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
  selector: 'app-tag',
  templateUrl: 'tag.component.html',
  styleUrls: ['tag.component.scss'],
})
export class TagComponent extends AbstractTabComponent implements OnInit {
  @Input() public currentTagID!: string;
  @Input() public currentTagVisualID!: string;
  @Input() public dialogRef!: MatDialogRef<any>;
  @Input() public tagsAuthorizations!: TagsAuthorizations;
  @Input() public dialogMode!: DialogMode;

  public formGroup!: UntypedFormGroup;
  public readOnly = true;
  public tag!: Tag;

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    public spinnerService: SpinnerService,
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private dialogService: DialogService,
    protected activatedRoute: ActivatedRoute,
    protected windowService: WindowService,
    private router: Router
  ) {
    super(activatedRoute, windowService, ['main'], false);
  }

  public ngOnInit() {
    // Init the form
    this.formGroup = new UntypedFormGroup({});
    // Handle Dialog mode
    this.readOnly = this.dialogMode === DialogMode.VIEW;
    Utils.handleDialogMode(this.dialogMode, this.formGroup);
    // Load Tag
    this.loadTag();
  }

  public onClose() {
    this.closeDialog();
  }

  public loadTag() {
    if (this.currentTagID) {
      this.spinnerService.show();
      this.centralServerService.getTag(this.currentTagID).subscribe(
        (tag: Tag) => {
          this.spinnerService.hide();
          this.tag = tag;
          if (this.readOnly) {
            // Async call for letting the sub form groups to init
            setTimeout(() => this.formGroup.disable(), 0);
          }
          // Update form group
          this.formGroup.updateValueAndValidity();
          this.formGroup.markAsPristine();
          this.formGroup.markAllAsTouched();
        },
        (error) => {
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
        }
      );
    } else if (this.currentTagVisualID) {
      this.spinnerService.show();
      this.centralServerService.getTagByVisualID(this.currentTagVisualID).subscribe(
        (tag: Tag) => {
          this.spinnerService.hide();
          this.tag = tag;
          if (this.readOnly) {
            // Async call for letting the sub form groups to init
            setTimeout(() => this.formGroup.disable(), 0);
          }
          // Update form group
          this.formGroup.updateValueAndValidity();
          this.formGroup.markAsPristine();
          this.formGroup.markAllAsTouched();
        },
        (error) => {
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
        }
      );
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
      this.saveTag.bind(this),
      this.closeDialog.bind(this)
    );
  }

  public saveTag(tag: Tag) {
    if (this.currentTagID || this.currentTagVisualID) {
      this.updateTag(tag);
    } else {
      this.createTag(tag);
    }
  }

  private updateTag(tag: Tag) {
    this.spinnerService.show();
    this.centralServerService.updateTag(tag).subscribe(
      (response: ActionResponse) => {
        this.spinnerService.hide();
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage('tags.update_success', { tagID: tag.id });
          this.closeDialog(true);
        } else {
          Utils.handleError(JSON.stringify(response), this.messageService, 'tags.update_error');
        }
      },
      (error) => {
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
      }
    );
  }

  private createTag(tag: Tag) {
    this.spinnerService.show();
    this.centralServerService.createTag(tag).subscribe(
      (response: ActionResponse) => {
        this.spinnerService.hide();
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage('tags.create_success', { tagID: tag.id });
          this.closeDialog(true);
        } else {
          Utils.handleError(JSON.stringify(response), this.messageService, 'tags.create_error');
        }
      },
      (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case HTTPError.TAG_ALREADY_EXIST_ERROR:
            this.messageService.showErrorMessage('tags.tag_id_already_used', { tagID: tag.id });
            break;
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
              'tags.create_error'
            );
        }
      }
    );
  }
}
