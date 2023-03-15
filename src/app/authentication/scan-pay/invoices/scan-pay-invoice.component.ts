import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import FileSaver from 'file-saver';
import { ComponentService } from 'services/component.service';
import { TenantComponents } from 'types/Tenant';
import { User } from 'types/User';

import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerService } from '../../../services/central-server.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { WindowService } from '../../../services/window.service';
import { Utils } from '../../../utils/Utils';

@Component({
  selector: 'app-scan-pay-invoice',
  templateUrl: 'scan-pay-invoice.component.html',
})
export class ScanPayInvoiceComponent implements OnInit {
  public isBillingComponentActive: boolean;
  public token: string;
  public invoiceID: string;
  public user: Partial<User>;
  public email: string;

  public constructor(
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private router: Router,
    public translateService: TranslateService,
    public activatedRoute: ActivatedRoute,
    public windowService: WindowService,
    private authorizationService: AuthorizationService) {
    this.isBillingComponentActive = this.componentService.isActive(TenantComponents.BILLING);
    this.invoiceID = this.activatedRoute?.snapshot?.params['invoiceID'];
    this.email = this.activatedRoute?.snapshot?.queryParams['email'];
    this.token = this.activatedRoute?.snapshot?.queryParams['VerificationToken'];
    this.user = { email: this.email, verificationToken: this.token, password: this.token, acceptEula: true } as Partial<User>;
  }

  public ngOnInit(): void {
    try {
      this.spinnerService.show();
      // clear User and UserAuthorization
      this.authorizationService.cleanUserAndUserAuthorization();
      this.centralServerService.login(this.user).subscribe({
        next: (result) => {
          this.centralServerService.loginSucceeded(result.token);
          this.centralServerService.downloadInvoice(this.invoiceID).subscribe({
            next: (resultInvoice) => {
              FileSaver.saveAs(resultInvoice, `${this.invoiceID + '.pdf'}`);
              this.spinnerService.hide();
            },
            error: (error) => {
              this.spinnerService.hide();
              Utils.handleHttpError(error, this.router, this.messageService,
                this.centralServerService, this.translateService.instant('invoices.cannot_download_invoice'));
            }
          });
        },
        error: (error) => {
          this.spinnerService.hide();
          Utils.handleHttpError(error, this.router, this.messageService,
            this.centralServerService, 'general.unexpected_error_backend');
        }
      });
    } catch (error) {
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.unexpected_error_payment_intend');
    } finally {
      this.spinnerService.hide();
    }
  }
}
