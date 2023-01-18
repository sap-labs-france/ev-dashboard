import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { StatusCodes } from 'http-status-codes';
import { TransactionHeaderComponent } from 'shared/dialogs/transaction/header/transaction-header.component';
import { TenantComponents } from 'types/Tenant';

import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService } from '../../../services/component.service';
import { ConfigService } from '../../../services/config.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { ConsumptionChartComponent } from '../../../shared/component/consumption-chart/consumption-chart.component';
import { Image } from '../../../types/GlobalType';
import { Transaction } from '../../../types/Transaction';
import { Constants } from '../../../utils/Constants';
import { Utils } from '../../../utils/Utils';

@Component({
  selector: 'app-show-transaction',
  templateUrl: 'show-transaction.component.html',
  // styleUrls: ['transaction.component.scss']
})
export class ShowTransactionComponent implements OnInit, OnDestroy {
  // @ViewChild('chartConsumption') public chartComponent!: ConsumptionChartComponent;
  @ViewChild('transactionHeader') public transactionHeader!: TransactionHeaderComponent;

  @Input() public transactionID!: number;

  public currentTransactionID!: number;
  public transaction: Transaction;
  public isClicked: boolean;

  private refreshInterval;

  public constructor(
    private spinnerService: SpinnerService,
    private messageService: MessageService,
    private router: Router,
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private configService: ConfigService,
    private activatedRoute: ActivatedRoute) {
    this.currentTransactionID = this.activatedRoute?.snapshot?.params['transactionID'];
  }

  public ngOnInit(): void {
    // Load
    this.loadData();
  }

  public ngOnDestroy(): void {
    // Destroy transaction refresh
    this.destroyTransactionRefresh();
  }

  public loadData() {
    if (this.currentTransactionID) {
      this.spinnerService.show();
      this.centralServerService.getTransactionScanPay(this.currentTransactionID).subscribe({
        next: (transaction: Transaction) => {
          this.spinnerService.hide();
          this.transaction = transaction;
          // this.transactionHeader;
        },
        error: (error) => {
          this.spinnerService.hide();
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'accounts.onboarding.onboarding_process_failed');
        }
      });
    } else {
      this.loadConsumption();
    }
  }

  public loadConsumption() {
    this.spinnerService.show();
    this.centralServerService.getTransaction(this.currentTransactionID).subscribe({
      next: (transaction: Transaction) => {
        this.spinnerService.hide();
        this.transaction = transaction;
        // Transaction in progress?
        if (!transaction.stop) {
          // Transaction refresh
          this.createTransactionRefresh();
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        // this.dialogRef.close();
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'transactions.load_transaction_error');
      }
    });
  }

  public scanPayStopTransaction() {
    this.isClicked = true;
    const data = {};
    this.spinnerService.show();
    //TODO: ajuster les params avec l'url hash
    data['email'] = this.transaction?.user?.email;
    // Show
    data['transactionId'] = this.currentTransactionID;
    // launch capture and stop transaction
    this.centralServerService.scanPayHandleCapturePayment(data).subscribe({
      next: (response) => {
        this.spinnerService.hide();
        this.messageService.showSuccessMessage('settings.billing.scan_pay_stop_success');
        // void this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        this.spinnerService.hide();
        this.messageService.showErrorMessage('settings.billing.scan_pay_stop_error');
        // void this.router.navigate(['/auth/login']);
      }
    });
  }

  private createTransactionRefresh() {
    const pollIntervalSecs = this.configService.getCentralSystemServer().pollIntervalSecs;
    if (!this.refreshInterval && pollIntervalSecs > 0) {
      // create the timer
      this.refreshInterval = setInterval(() => {
        this.refreshTransaction();
      }, pollIntervalSecs * 1000);
    }
  }

  private destroyTransactionRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  private refreshTransaction() {
    this.loadData();
    // this.chartComponent.refresh();
  }
}
