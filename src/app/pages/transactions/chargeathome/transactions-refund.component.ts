import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {AuthorizationService} from '../../../services/authorization-service';
import {TransactionsRefundDataSource} from './transactions-refund-data-source-table';

@Component({
  selector: 'app-transactions-refund',
  templateUrl: 'transactions-refund.component.html'
})
export class TransactionsRefundComponent implements OnInit {
  public isAdmin;
  private messages;

  constructor(
    public transactionsRefundDataSource: TransactionsRefundDataSource,
    private authorizationService: AuthorizationService,
    private translateService: TranslateService
  ) {
    // Get translated messages
    this.translateService.get('logs', {}).subscribe((messages) => {
      this.messages = messages;
    });
    this.isAdmin = this.authorizationService.isAdmin();
    this.transactionsRefundDataSource.forAdmin(this.isAdmin);
  }

  ngOnInit() {
    // Scroll up
    jQuery('html, body').animate({scrollTop: 0}, {duration: 500});
  }
}
