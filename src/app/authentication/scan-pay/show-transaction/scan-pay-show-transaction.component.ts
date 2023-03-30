import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerService } from '../../../services/central-server.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { TransactionHeaderComponent } from '../../../shared/dialogs/transaction/header/transaction-header.component';
import { Transaction } from '../../../types/Transaction';
import { User } from '../../../types/User';
import { Utils } from '../../../utils/Utils';

@Component({
  selector: 'app-scan-pay-show-transaction',
  templateUrl: 'scan-pay-show-transaction.component.html',
})
export class ScanPayShowTransactionComponent implements OnInit, OnDestroy {
  @ViewChild('transactionHeader') public transactionHeader!: TransactionHeaderComponent;

  @Input() public transactionID!: number;

  public currentTransactionID!: number;
  public transaction: Transaction;
  public isClicked: boolean;
  public token: string;
  public user: Partial<User>;
  public email: string;
  private refreshInterval;

  public constructor(
    private spinnerService: SpinnerService,
    private messageService: MessageService,
    private router: Router,
    private centralServerService: CentralServerService,
    private authorizationService: AuthorizationService,
    private activatedRoute: ActivatedRoute) {
    this.currentTransactionID = this.activatedRoute?.snapshot?.params['transactionID'];
    this.email = this.activatedRoute?.snapshot?.params['email'];
    this.token = this.activatedRoute?.snapshot?.params['token'];
    this.user = { email: this.email, verificationToken: this.token, password: this.token, acceptEula: true } as Partial<User>;
  }

  public ngOnInit(): void {
    this.login(this.user);
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
          },
          error: (error) => {
            this.spinnerService.hide();
            Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'transactions.load_transaction_error');
          }
        });
      },
      error: (error) => {
        this.spinnerService.hide();
        Utils.handleHttpError(error, this.router, this.messageService,
          this.centralServerService, 'general.unexpected_error_backend');
      }
    });
  }

  public scanPayStopTransaction() {
    this.isClicked = true;
    const data = {};
    this.spinnerService.show();
    data['email'] = this.transaction?.user?.email;
    data['transactionId'] = this.currentTransactionID;
    data['token'] = this.token;
    // launch capture and stop transaction
    this.centralServerService.chargingStationStopTransaction(this.transaction.chargeBoxID, this.currentTransactionID).subscribe({
      next: (response) => {
        this.spinnerService.hide();
        this.messageService.showSuccessMessage('settings.scan_pay.stop_success');
      },
      error: (error) => {
        this.spinnerService.hide();
        this.messageService.showErrorMessage('settings.scan_pay.stop_error');
      }
    });
  }

  private login(user: Partial<User>): void {
    this.spinnerService.show();
    // clear User and UserAuthorization
    this.authorizationService.cleanUserAndUserAuthorization();
    // Login
    this.centralServerService.login(user).subscribe({
      next: (result) => {
        this.spinnerService.hide();
        this.centralServerService.loginSucceeded(result.token);

      },
      error: (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          default:
            Utils.handleHttpError(error, this.router, this.messageService,
              this.centralServerService, 'general.unexpected_error_backend');
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
