import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  encapsulation: ViewEncapsulation.None,
  styles: ['.transactions app-detail-component-container{width: 100%}']
})
export class TransactionsComponent implements OnInit {
  public activeTabIndex = 0;

  constructor(
    private activatedRoute: ActivatedRoute) {
    activatedRoute.fragment.subscribe(fragment => {
      switch (fragment) {
        case 'history':
          this.activeTabIndex = 0;
          break;
        case 'inprogress':
          this.activeTabIndex = 1;
          break;
        case 'inerror':
          this.activeTabIndex = 2;
          break;
        case 'chargeathome':
          this.activeTabIndex = 3;
          break;
      }
    })
  }

  ngOnInit() {
  }

}
