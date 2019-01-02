import {Component, OnInit, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  encapsulation: ViewEncapsulation.None,
  styles: ['.transactions app-detail-component-container{width: 100%}']
})
export class TransactionsComponent implements OnInit {

  constructor() {
  }

  ngOnInit() {
  }

}
