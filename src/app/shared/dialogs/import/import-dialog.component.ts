import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { FileUploader } from 'ng2-file-upload';
import { CentralServerService } from 'services/central-server.service';
import { ServerAction } from 'types/Server';
import { Utils } from 'utils/Utils';

@Component({
  templateUrl: './import-dialog.component.html',
})
export class ImportDialogComponent {
  public fileToUpload = null;

  public uploader:FileUploader;
  public response:string;
  public progress: number = 0;

  private endpoint;

  constructor(
    protected dialogRef: MatDialogRef<ImportDialogComponent>,
    protected translateService: TranslateService,
    private centralServerService: CentralServerService,
    @Inject(MAT_DIALOG_DATA) data){
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

      this.uploader.response.subscribe( res => this.response = res );
  }

  public ngOnInit() {
    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
         console.log('FileUpload:uploaded:', item, status, response);
         alert('File uploaded successfully');
     };
 }

  public cancel() {
    this.dialogRef.close();
  }


  public handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
}

  public upload(): void{
  //   const chunkSize = 100000000;

  //   for( let offset = 0; offset < this.fileToUpload.size; offset += chunkSize ){
  //     const chunk = this.fileToUpload
  //     .slice( offset, offset + chunkSize );
  //     this.centralServerService.importUser(chunk).subscribe((response)=>{
  //       console.log(response);
  //     })
  // }

//   const arraySize = 15000;
//   const fileReader = new FileReader();
//   fileReader.readAsText(this.fileToUpload, "UTF-8");
//   let users = null;
//   fileReader.onload = () => {
//    //console.log(JSON.parse(fileReader.result as string));
//    users = JSON.parse(fileReader.result as string);
//    const chunk = 15000;
//    const j = users.length;
//    let userSplice = [];
//    console.log(users);

//    for (let i=0; i<j; i+=chunk) {
//      userSplice = users.slice(i,i+chunk);
//      this.centralServerService.importUser(userSplice).subscribe((response)=> {
//        console.log(response)
//      });
//  }
//   }
//   fileReader.onerror = (error) => {
//     console.log(error);
//   }

this.uploader.uploadAll();
this.uploader.onProgressItem = (progress: any) => {
  console.log(progress['progress']);
};


}}
