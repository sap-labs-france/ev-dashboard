import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material';
import { CentralServerService } from 'app/services/central-server.service';
import { MessageService } from 'app/services/message.service';
import { Router } from '@angular/router';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { SpinnerService } from 'app/services/spinner.service';
import { Utils } from 'app/utils/Utils';
import { Constants } from 'app/utils/Constants';
import { DialogService } from 'app/services/dialog.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  templateUrl: './sac-link.dialog.component.html'
})
export class SacLinkDialogComponent implements OnInit {
  public formGroup: FormGroup;
  public id: AbstractControl;
  public name: AbstractControl;
  public description: AbstractControl;
  public url: AbstractControl;

  private urlPattern = /^(?:https?|wss?):\/\/((?:[\w-]+)(?:\.[\w-]+)*)(?:[\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?$/;

  public currentSacLink: any;

  constructor(
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private translateService: TranslateService,
    private router: Router,
    protected dialogRef: MatDialogRef<SacLinkDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {
    // Check if data is passed to the dialog
    if (data) {
      this.currentSacLink = data;
    } else {
      this.currentSacLink = {
        'id': '',
        'name': '',
        'description': '',
        'url': ''
      }
    }
  }

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      'id': new FormControl(this.currentSacLink.id),
      'name': new FormControl(this.currentSacLink.name,
        Validators.compose([
          Validators.required,
          Validators.maxLength(100)
        ])),
      'description': new FormControl(this.currentSacLink.description, Validators.required),
      'url': new FormControl(this.currentSacLink.url,
        Validators.compose([
          Validators.required,
          Validators.pattern(this.urlPattern)
        ]))
    });

    this.id = this.formGroup.controls['id'];
    this.name = this.formGroup.controls['name'];
    this.description = this.formGroup.controls['description'];
    this.url = this.formGroup.controls['url'];

    // listen to escape key
    this.dialogRef.keydownEvents().subscribe((keydownEvents) => {
      // check if escape
      if (keydownEvents && keydownEvents.code === 'Escape') {
        this.onClose();
      }
    });
  }

  cancel() {
    this.dialogRef.close();
  }

  setLink(sacLink) {
    this.dialogRef.close(sacLink);
  }

  openUrl() {
    window.open(this.url.value);
  }
  // public closeDialog() {
  //     this.dialogRef.close();
  // }

  public onClose() {
    this.dialogRef.close();
  }
}
