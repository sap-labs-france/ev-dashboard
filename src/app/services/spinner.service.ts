import { Injectable } from '@angular/core';

@Injectable()
export class SpinnerService {
  public static counter = 0;
  public visible = false;
  private spinner: HTMLElement | null;

  public constructor() {
    this.spinner = document.getElementById('spinner');
    if (this.spinner) {
      this.spinner.style['display'] = 'none';
    }
  }

  public isVisible(): boolean {
    return this.visible;
  }

  public show(): void {
    SpinnerService.counter++;
    if (this.spinner) {
      this.spinner.style['display'] = 'block';
      this.visible = true;
    }
  }

  public hide(): void {
    SpinnerService.counter--;
    if (SpinnerService.counter < 0) {
      console.log('SpinnerService - Unexpected situation - counter: ' + SpinnerService.counter);
      SpinnerService.counter = 0;
    }
    if (this.spinner && SpinnerService.counter === 0) {
      this.spinner.style['display'] = 'none';
      this.visible = false;
    }
  }
}
