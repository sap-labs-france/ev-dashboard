import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {AuthorizationService} from '../../../services/authorization-service';
import {TransactionsInErrorDataSource} from './transactions-in-error-data-source-table';

@Component({
  selector: 'app-transactions-in-error',
  templateUrl: 'transactions-in-error.component.html'
})
export class TransactionsInErrorComponent implements OnInit {
  public isAdmin;
  private messages;

  constructor(
    public transactionsInErrorDataSource: TransactionsInErrorDataSource,
    private authorizationService: AuthorizationService,
    private translateService: TranslateService
  ) {
    // Get translated messages
    this.translateService.get('logs', {}).subscribe((messages) => {
      this.messages = messages;
    });
    this.isAdmin = this.authorizationService.isAdmin();
    this.transactionsInErrorDataSource.forAdmin(this.isAdmin);
  }

  ngOnInit() {
    // Scroll up
    jQuery('html, body').animate({scrollTop: 0}, {duration: 500});
  }
}
