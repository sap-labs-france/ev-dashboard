import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { Utils } from 'app/utils/Utils';
import saveAs from 'file-saver';
import { CentralServerService } from '../../../services/central-server.service';
import { Constants } from '../../../utils/Constants';

@Injectable()
export class StatisticsExportService {

  constructor(
    private dialogService: DialogService,
    private router: Router,
    private messageService: MessageService,
    private centralServerService: CentralServerService) { }

  public enhanceFilterParams(filterParams: object, dataType: string, dataCategory: string, year: number, dataScope?: string): object {
    if (dataScope) {
      return { ...filterParams, DataType: dataType, DataCategory: dataCategory, DataScope: dataScope, Year: year };
    }
    return { ...filterParams, DataType: dataType, DataCategory: dataCategory, Year: year };
  }

  public exportDataWithDialog(filterParams: object, dialogTitle: string, dialogQuestion: string) {
    this.dialogService.createAndShowYesNoDialog(dialogTitle, dialogQuestion).subscribe((response) => {
      if (response === Constants.BUTTON_TYPE_YES) {
        this.exportStatisticsData(filterParams);
      }
    });
  }

  private exportStatisticsData(filterParams: object) {
    const fileName = `export${filterParams['DataType']}Statistics.csv`;

    this.centralServerService.exportStatistics(filterParams)
      .subscribe((result) => {
        saveAs(result, fileName);
      }, (error) => {
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
      });
  }

}
