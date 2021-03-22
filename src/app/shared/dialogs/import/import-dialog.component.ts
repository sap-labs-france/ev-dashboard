import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { StatusCodes } from 'http-status-codes';
import { FileItem, FileUploader, ParsedResponseHeaders } from 'ng2-file-upload';
import { NgxCsvParser } from 'ngx-csv-parser';
import { CentralServerService } from 'services/central-server.service';
import { MessageService } from 'services/message.service';
import { ServerAction } from 'types/Server';
import { Constants } from 'utils/Constants';
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
  private ngxCsvParser: NgxCsvParser;
  private endpoint: ServerAction;
  private requiredProperties: string[];
  public ImportInstructions: string;
  public isFileValid = true;
  public title: string;

  constructor(
    protected dialogRef: MatDialogRef<ImportDialogComponent>,
    protected translateService: TranslateService,
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    @Inject(MAT_DIALOG_DATA) data) {
    if (data) {
      if (data.endpoint) {
        this.endpoint = data.endpoint;
        this.title = data.title;
        this.requiredProperties = data.requiredProperties;
      }
    }
    Utils.registerCloseKeyEvents(this.dialogRef);

    this.uploader = new FileUploader({
      headers: this.centralServerService.buildHttpHeadersFile(),
      url: `${this.centralServerService.getCentralRestServerServiceSecuredURL()}/${this.endpoint}`
    });

    this.uploader.response.subscribe(res => this.response = res);
    this.ngxCsvParser = new NgxCsvParser();
  }

  public ngOnInit() {
    this.ImportInstructions = this.translateService.instant('general.import_instructions', { properties: this.requiredProperties.join(', ') })
    this.uploader.onAfterAddingFile = (fileItem: FileItem) => {
      if (this.uploader.queue.length > 1) {
        this.uploader.removeFromQueue(this.uploader.queue[0]);
      }
      fileItem.withCredentials = false;
      this.fileName = fileItem.file.name;
      this.isFileValid = this.ngxCsvParser.isCSVFile(fileItem._file);
      this.ngxCsvParser.parse(fileItem._file, {}).subscribe((csvHeader: string[]) => {
        if (!Utils.isEmptyArray(csvHeader)) {
          const properties = Object.keys(csvHeader[0])[0].split(Constants.CSV_SEPARATOR);
          this.isFileValid = this.requiredProperties.every(property => properties.includes(property));
        }
      }, (error) => {
        this.isFileValid = false;
      });
    };
    this.uploader.onCompleteItem = (fileItem: FileItem, response: string, status: number, headers: ParsedResponseHeaders) => {
      if (status === StatusCodes.OK) {
        this.messageService.showSuccessMessage('general.success_import');
      }
      this.uploader.destroy();
      this.dialogRef.close();
    };
    this.uploader.onErrorItem = (item: FileItem, response: string, status: number, headers: ParsedResponseHeaders) => {
      this.messageService.showErrorMessage('general.error_import');
    };

    this.uploader.onProgressAll = (progress: any) => {
      this.progress = progress;
      this.showProgressBar = true;
    };
  }

  public cancel() {
    this.uploader.destroy();
    this.dialogRef.close();
  }

  public upload(): void {
    this.uploader.uploadAll();
  }
}
