import { ButtonType } from 'app/types/Table';
import { CentralServerService } from '../../../services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { FilterParams } from 'app/types/GlobalType';
import { Injectable } from '@angular/core';
import { MessageService } from 'app/services/message.service';
import { Router } from '@angular/router';
import { SpinnerService } from '../../../services/spinner.service';
import { Utils } from 'app/utils/Utils';
import saveAs from 'file-saver';

@Injectable()
export class StatisticsExportService {

  constructor(
    public spinnerService: SpinnerService,
    private dialogService: DialogService,
    private router: Router,
    private messageService: MessageService,
    private centralServerService: CentralServerService) { }

  public enhanceFilterParams(filterParams: FilterParams, dataType: string, dataCategory: string, year: number, dataScope?: string): FilterParams {
    if (dataScope) {
      return { ...filterParams, DataType: dataType, DataCategory: dataCategory, DataScope: dataScope, Year: year.toString() };
    }
    return { ...filterParams, DataType: dataType, DataCategory: dataCategory, Year: year.toString() };
  }

  public exportDataWithDialog(filterParams: FilterParams, dialogTitle: string, dialogQuestion: string) {
    this.dialogService.createAndShowYesNoDialog(dialogTitle, dialogQuestion).subscribe((response) => {
      if (response === ButtonType.YES) {
        this.exportStatisticsData(filterParams);
      }
    });
  }

  private exportStatisticsData(filterParams: FilterParams) {
    this.spinnerService.show();
    let chartType: string = filterParams['DataType'] as string;
    chartType = chartType.toLowerCase();
    this.centralServerService.exportStatistics(filterParams)
      .subscribe((result) => {
        this.spinnerService.hide();
        saveAs(result, `exported-${chartType}-statistics.csv`);
      }, (error) => {
        this.spinnerService.hide();
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
      });
  }

}
