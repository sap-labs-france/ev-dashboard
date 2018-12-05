import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {AuthorizationService} from '../../../services/authorization-service';
import {TransactionsHistoryDataSource} from './transactions-history-data-source-table';

@Component({
  selector: 'app-transactions-history',
  templateUrl: 'transactions-history.component.html'
})
export class TransactionsHistoryComponent implements OnInit {
  public isAdmin;
  private messages;

  constructor(
    public transactionsHistoryDataSource: TransactionsHistoryDataSource,
    private authorizationService: AuthorizationService,
    private translateService: TranslateService
  ) {
    // Get translated messages
    this.translateService.get('logs', {}).subscribe((messages) => {
      this.messages = messages;
    });
    this.isAdmin = this.authorizationService.isAdmin();
    this.transactionsHistoryDataSource.forAdmin(this.isAdmin);
  }

  ngOnInit() {
    // Scroll up
    jQuery('html, body').animate({scrollTop: 0}, {duration: 500});
  }
}
