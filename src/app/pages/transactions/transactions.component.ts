import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {WindowService} from '../../services/window.service';
import {AbstractTabComponent} from '../../shared/component/tab/AbstractTab.component';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  encapsulation: ViewEncapsulation.None,
  styles: ['.transactions app-detail-component-container{width: 100%}']
})
export class TransactionsComponent extends AbstractTabComponent implements OnInit {

  constructor(
    activatedRoute: ActivatedRoute, windowService: WindowService) {
    super(activatedRoute, windowService, ['history', 'inprogress', 'inerror', 'chargeathome']);
  }

  ngOnInit() {
  }
}
