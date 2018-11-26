import {Component, OnInit} from '@angular/core';
import {LogsDataSource} from './logs-data-source-table';

@Component({
  selector: 'app-logs-cmp',
  templateUrl: 'logs.component.html'
})
export class LogsComponent implements OnInit {
  constructor(
    public logsDataSource: LogsDataSource) {
  }

  ngOnInit() {
    // Scroll up
    jQuery('html, body').animate({scrollTop: 0}, {duration: 500});
  }
}
