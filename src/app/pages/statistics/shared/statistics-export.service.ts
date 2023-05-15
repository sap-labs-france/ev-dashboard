import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as FileSaver from 'file-saver';

import { CentralServerService } from '../../../services/central-server.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { ButtonAction, FilterParams } from '../../../types/GlobalType';
import { Utils } from '../../../utils/Utils';

@Injectable()
export class StatisticsExportService {
  // eslint-disable-next-line no-useless-constructor
  public constructor(
    public spinnerService: SpinnerService,
    private dialogService: DialogService,
    private router: Router,
    private messageService: MessageService,
    private centralServerService: CentralServerService
  ) {}

  public enhanceFilterParams(
    filterParams: FilterParams,
    dataType: string,
    dataCategory: string,
    year: number,
    dataScope?: string
  ): FilterParams {
    if (dataScope) {
      return {
        ...filterParams,
        DataType: dataType,
        DataCategory: dataCategory,
        DataScope: dataScope,
        Year: year.toString(),
      };
    }
    return {
      ...filterParams,
      DataType: dataType,
      DataCategory: dataCategory,
      Year: year.toString(),
    };
  }

  public exportDataWithDialog(
    filterParams: FilterParams,
    dialogTitle: string,
    dialogQuestion: string
  ) {
    this.dialogService
      .createAndShowYesNoDialog(dialogTitle, dialogQuestion)
      .subscribe((response) => {
        if (response === ButtonAction.YES) {
          this.exportStatisticsData(filterParams);
        }
      });
  }

  private exportStatisticsData(filterParams: FilterParams) {
    this.spinnerService.show();
    let chartType: string = filterParams['DataType'] as string;
    chartType = chartType.toLowerCase();
    this.centralServerService.exportStatistics(filterParams).subscribe(
      (result) => {
        this.spinnerService.hide();
        FileSaver.saveAs(result, `exported-${chartType}-statistics.csv`);
      },
      (error) => {
        this.spinnerService.hide();
        Utils.handleHttpError(
          error,
          this.router,
          this.messageService,
          this.centralServerService,
          'general.error_backend'
        );
      }
    );
  }
}
