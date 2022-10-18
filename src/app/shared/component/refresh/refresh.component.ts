import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ConfigService } from 'services/config.service';

@Component({
  selector: 'app-refresh',
  templateUrl: './refresh.component.html',
  styleUrls: ['refresh.component.scss']
})

export class RefreshComponent implements OnInit, OnChanges, OnDestroy {
  @Output() public refresh = new EventEmitter<void>();
  @Output() public autoRefresh = new EventEmitter<void>();
  @Input() public hideAutoRefresh = false;
  @Input() public hideRefresh = false;
  @Input() public loading = false;
  @Input() public color: string;
  @Input() public refreshName: string;
  @Input() public autoRefreshInitialValue = false;

  public autoRefreshChecked = false;
  public ongoingRefresh = false;

  private autoRefreshTimeout;
  private refreshIntervalSecs: number;

  public constructor(
    private configService: ConfigService
  ) {
    this.refreshIntervalSecs = this.configService.getCentralSystemServer().pollIntervalSecs;
  }

  public ngOnInit(): void {
    this.autoRefreshChecked = this.autoRefreshInitialValue;
    this.checkAndCreateAutoRefresh();
  }

  public ngOnChanges() {
    if (!this.loading) {
      this.ongoingRefresh = false;
      // Recreate the timeout
      this.destroyAutoRefresh();
      this.checkAndCreateAutoRefresh();
    }
  }

  public ngOnDestroy() {
    this.destroyAutoRefresh();
  }

  public triggerRefresh() {
    // Start refresh
    if (!this.ongoingRefresh) {
      this.ongoingRefresh = true;
      this.refresh.emit();
    }
  }

  public triggerAutoRefresh() {
    // Start refresh
    if (!this.ongoingRefresh) {
      this.ongoingRefresh = true;
      this.autoRefresh.emit();
    }
  }

  public toggleAutoRefresh(event: MatSlideToggleChange) {
    this.autoRefreshChecked = event.checked;
    if (event.checked) {
      this.checkAndCreateAutoRefresh();
    } else {
      this.destroyAutoRefresh();
    }
  }

  private checkAndCreateAutoRefresh() {
    if (!this.autoRefreshTimeout && this.refreshIntervalSecs && this.autoRefreshChecked) {
      // Create the timer
      this.autoRefreshTimeout = setTimeout(() => {
        if (!this.loading && !this.ongoingRefresh) {
          this.triggerAutoRefresh();
        }
      }, this.refreshIntervalSecs * 1000);
    }
  }

  private destroyAutoRefresh() {
    if (this.autoRefreshTimeout) {
      clearTimeout(this.autoRefreshTimeout);
      this.autoRefreshTimeout = null;
    }
  }
}
