import {Component, OnInit} from '@angular/core';
import {AuthorizationService} from '../../../services/authorization-service';
import {TransactionsInProgressDataSource} from './transactions-in-progress-data-source-table';

@Component({
  selector: 'app-transactions-in-progress',
  templateUrl: 'transactions-in-progress.component.html',
  providers: [
    TransactionsInProgressDataSource
  ]
})
export class TransactionsInProgressComponent implements OnInit {
  public isAdmin;

  constructor(
    public transactionsInProgressDataSource: TransactionsInProgressDataSource,
    private authorizationService: AuthorizationService
  ) {
    this.isAdmin = this.authorizationService.isAdmin();
  }

  ngOnInit() {
    // Scroll up
    jQuery('html, body').animate({scrollTop: 0}, {duration: 500});
  }
}
