import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerService } from '../../../services/central-server.service';
import { SpinnerService } from '../../../services/spinner.service';
import { TransactionHeaderComponent } from '../../../shared/dialogs/transaction/header/transaction-header.component';
import { Transaction } from '../../../types/Transaction';
import { User } from '../../../types/User';

@Component({
  selector: 'app-scan-pay-show-transaction',
  templateUrl: 'scan-pay-show-transaction.component.html',
})
export class ScanPayShowTransactionComponent implements OnInit, OnDestroy {
  @ViewChild('transactionHeader') public transactionHeader!: TransactionHeaderComponent;

  @Input() public transactionID!: number;

  public currentTransactionID!: number;
  public transaction: Transaction;
  public isSendClicked: boolean;
  public token: string;
  public user: Partial<User>;
  public headerClass = 'card-header-primary';
  public title = 'settings.scan_pay.stop_title';
  public message: string;
  private refreshInterval;
  private params: Params;

  public constructor(
    private spinnerService: SpinnerService,
    private centralServerService: CentralServerService,
    private authorizationService: AuthorizationService,
    private activatedRoute: ActivatedRoute) {
    this.params = this.activatedRoute?.snapshot?.params;
    this.currentTransactionID = this.params?.transactionID;
    this.token = this.params?.token;
    this.user = { email: this.params?.email, verificationToken: this.token, password: this.token, acceptEula: true } as Partial<User>;
  }

  public ngOnInit(): void {
    this.login();
    this.isSendClicked = false;
    // Load
    this.loadData();
  }

  public ngOnDestroy(): void {
    // Destroy transaction refresh
    this.destroyTransactionRefresh();
  }

  public loadData() {
    this.spinnerService.show();
    // clear User and UserAuthorization
    this.authorizationService.cleanUserAndUserAuthorization();
    this.centralServerService.login(this.user).subscribe({
      next: (result) => {
        this.centralServerService.loginSucceeded(result.token);
        this.centralServerService.getTransaction(this.currentTransactionID).subscribe({
          next: (transaction: Transaction) => {
            this.spinnerService.hide();
            this.transaction = transaction;
            if (this.transaction?.stop) {
              this.headerClass = 'card-header-success';
              this.title = 'settings.scan_pay.stop_success';
            }
          },
          error: (error) => {
            this.isSendClicked = true;
            this.spinnerService.hide();
            this.headerClass = 'card-header-danger';
            this.title = 'settings.scan_pay.unexpected_error_title';
            this.message = 'settings.scan_pay.load_transaction_error_message';
          }
        });
      },
      error: (error) => {
        this.isSendClicked = true;
        this.spinnerService.hide();
        this.headerClass = 'card-header-danger';
        this.title = 'settings.scan_pay.unexpected_error_title';
        this.message = 'settings.scan_pay.unexpected_error_payment_intend';
      }
    });
  }

  public scanPayStopTransaction() {
    this.isSendClicked = true;
    const data = {};
    this.spinnerService.show();
    data['email'] = this.transaction?.user?.email;
    data['transactionId'] = this.currentTransactionID;
    data['token'] = this.token;
    // launch capture and stop transaction
    this.centralServerService.chargingStationStopTransaction(this.transaction.chargeBoxID, this.currentTransactionID).subscribe({
      next: (response) => {
        this.spinnerService.hide();
        this.headerClass = 'card-header-success';
        this.title = 'settings.scan_pay.stop_success';
      },
      error: (error) => {
        this.spinnerService.hide();
        this.headerClass = 'card-header-danger';
        this.title = 'settings.scan_pay.unexpected_error_title';
        this.message = 'settings.scan_pay.stop_error';
      }
    });
  }

  private login(): void {
    this.spinnerService.show();
    // clear User and UserAuthorization
    this.authorizationService.cleanUserAndUserAuthorization();
    // Login
    this.centralServerService.login(this.user).subscribe({
      next: (result) => {
        this.spinnerService.hide();
        this.centralServerService.loginSucceeded(result.token);
      },
      error: (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          default:
            this.headerClass = 'card-header-danger';
            this.title = 'settings.scan_pay.unexpected_error_title';
            this.message = 'settings.scan_pay.unexpected_error_payment_intend';
        }
      }
    });
  }

  private destroyTransactionRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }
}
