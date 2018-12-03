import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {AuthorizationService} from '../../../services/authorization-service';
import {TransactionsInProgressDataSource} from './transactions-in-progress-data-source-table';

@Component({
  selector: 'app-transactions-in-progress',
  templateUrl: 'transactions-in-progress.component.html'
})
export class TransactionsInProgressComponent implements OnInit {
  public isAdmin;
  private messages;

  constructor(
    public transactionsInProgressDataSource: TransactionsInProgressDataSource,
    private authorizationService: AuthorizationService,
    private translateService: TranslateService
  ) {
    // Get translated messages
    this.translateService.get('logs', {}).subscribe((messages) => {
      this.messages = messages;
    });
    this.isAdmin = this.authorizationService.isAdmin();
  }

  ngOnInit() {
    // Scroll up
    jQuery('html, body').animate({scrollTop: 0}, {duration: 500});
  }
}
