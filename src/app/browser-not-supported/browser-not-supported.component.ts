import { Component } from '@angular/core';

@Component({
  template: `
  <div class="browser-not-supported-message-container">
    <span class="browser-not-supported-message">{{'general.browser_not_supported' | translate}}</span>
  </div>
`,
})
export class BrowserNotSupportedComponent {
}
