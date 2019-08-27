import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-no-support',
  template: `
  <div class="no-support-message-container">
    <span class="no-support-message">{{'general.no_support' | translate}}</span>
  </div>
`
})
export class NoSupportComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
