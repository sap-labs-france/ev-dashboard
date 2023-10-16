import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { StatusCodes } from 'http-status-codes';
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
  selector: 'app-transaction',
  templateUrl: 'transaction.component.html',
  styleUrls: ['transaction.component.scss'],
})
export class TransactionComponent implements OnInit, OnDestroy {
  @ViewChild('chartConsumption') public chartComponent!: ConsumptionChartComponent;

  @Input() public transactionID!: number;
  @Input() public connectorID!: number;
  @Input() public chargingStationID!: string;
  @Input() public inDialog!: boolean;
  @Input() public dialogRef!: MatDialogRef<any>;

  public transaction!: Transaction;
  public loggedUserImage = Constants.USER_NO_PICTURE;
  public carImage = Constants.NO_IMAGE;
  public isCarComponentActive = false;
  public isPricingComponentActive = false;
  public showPricingDetail = false;

  private refreshInterval;

  public constructor(
    private spinnerService: SpinnerService,
    private messageService: MessageService,
    private router: Router,
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private configService: ConfigService
  ) {
    this.isCarComponentActive = this.componentService.isActive(TenantComponents.CAR);
    this.isPricingComponentActive = this.componentService.isActive(TenantComponents.PRICING);
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
    if (!this.transactionID) {
      this.spinnerService.show();
      this.centralServerService
        .getLastTransaction(this.chargingStationID, this.connectorID)
        .subscribe({
          next: (dataResult) => {
            this.spinnerService.hide();
            if (!Utils.isEmptyArray(dataResult.result)) {
              this.transactionID = Utils.convertToInteger(dataResult.result[0].id);
              this.loadConsumption();
            } else {
              this.spinnerService.hide();
              this.messageService.showInfoMessage('chargers.no_transaction_found', {
                chargerID: this.chargingStationID,
              });
              this.dialogRef.close();
            }
          },
          error: (error) => {
            this.spinnerService.hide();
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              'transactions.load_transaction_error'
            );
          },
        });
    } else {
      this.loadConsumption();
    }
  }

  public loadConsumption() {
    this.spinnerService.show();
    this.centralServerService.getTransaction(this.transactionID).subscribe({
      next: (transaction: Transaction) => {
        this.spinnerService.hide();
        this.transaction = transaction;
        // Transaction in progress?
        if (!transaction.stop) {
          // Transaction refresh
          this.createTransactionRefresh();
        }
        // Set properties
        if (this.isPricingComponentActive && transaction.pricingModel) {
          // Show pricing dimensions in a second tab
          this.showPricingDetail = true;
        }
        // Load User's image
        if (this.loggedUserImage === Constants.USER_NO_PICTURE && transaction.user) {
          this.centralServerService.getUserImage(transaction.user.id).subscribe({
            next: (userImage) => {
              this.loggedUserImage = userImage ?? Constants.USER_NO_PICTURE;
            },
            error: (error) => {
              switch (error.status) {
                case StatusCodes.NOT_FOUND:
                  this.loggedUserImage = Constants.USER_NO_PICTURE;
                  break;
                default:
                  Utils.handleHttpError(
                    error,
                    this.router,
                    this.messageService,
                    this.centralServerService,
                    'general.unexpected_error_backend'
                  );
              }
            },
          });
        }
        // Load Car's image
        if (
          this.isCarComponentActive &&
          this.carImage === Constants.NO_IMAGE &&
          transaction?.carCatalogID
        ) {
          this.centralServerService
            .getCarCatalogImages(
              transaction.carCatalogID,
              {},
              { limit: 1, skip: Constants.DEFAULT_SKIP }
            )
            .subscribe((carImage) => {
              if (carImage.count > 0) {
                this.carImage = carImage.result[0].image;
              }
            });
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        this.dialogRef.close();
        Utils.handleHttpError(
          error,
          this.router,
          this.messageService,
          this.centralServerService,
          'transactions.load_transaction_error'
        );
      },
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
    this.chartComponent.refresh();
  }
}
