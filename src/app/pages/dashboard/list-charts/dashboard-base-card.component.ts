import { ChartCard, NumberCard } from '../../../types/Dashboard';

export abstract class DashboardBaseCardComponent {
  protected details: NumberCard | ChartCard;

  private ongoingFetch: boolean;
  private timeoutId: any;

  public constructor(
    private refreshTimeInMilliSeconds: number
  ) {
    this.details = {
      display: false,
      title: '',
      description: '',
      icon: 'info',
      link: '',
    };
    this.ongoingFetch = false;
    this.timeoutId = setTimeout(() => {
      this.fetchDetails();
    }, refreshTimeInMilliSeconds);
  }

  protected abstract fetchDetails(): void;

}
