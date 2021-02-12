import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { FileItem, FileUploader, ParsedResponseHeaders } from 'ng2-file-upload';
import { CentralServerService } from 'services/central-server.service';
import { MessageService } from 'services/message.service';
import { Utils } from 'utils/Utils';

@Component({
  templateUrl: './import-dialog.component.html',
})
export class ImportDialogComponent {

  public uploader: FileUploader;
  public response: string;
  public progress: number = 0;
  public showProgressBar = false;
  public fileName = '';

  private endpoint;

  constructor(
    protected dialogRef: MatDialogRef<ImportDialogComponent>,
    protected translateService: TranslateService,
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    @Inject(MAT_DIALOG_DATA) data) {
    if (data) {
      if (data.endpoint) {
        this.endpoint = data.endpoint;
      }
    }
    Utils.registerCloseKeyEvents(this.dialogRef);

    this.uploader = new FileUploader({
      headers: this.centralServerService.buildHttpHeadersFile(),
      url: `${this.centralServerService.getCentralRestServerServiceSecuredURL()}/${this.endpoint}`,
    });

    this.uploader.response.subscribe(res => this.response = res);
  }

  public ngOnInit() {
    this.uploader.onAfterAddingFile = (fileItem: FileItem) => {
      fileItem.withCredentials = false;
      this.fileName = fileItem.file.name;
    };
    this.uploader.onCompleteItem = (fileItem: FileItem, response: string, status: number, headers: ParsedResponseHeaders) => {
      this.messageService.showSuccessMessage('general.success_import');
      this.uploader.destroy();
      this.dialogRef.close();
    };
    this.uploader.onErrorItem = (item: FileItem, response: string, status: number, headers: ParsedResponseHeaders) => {
      debugger;
      this.messageService.showErrorMessage('general.error_import');
    };

    this.uploader.onProgressAll = (progress: any) => {
      this.progress = progress;
      this.showProgressBar = true;
    };
  }

  public cancel() {
    this.dialogRef.close();
  }

  public upload(): void {
    this.uploader.uploadAll();
  }
}
