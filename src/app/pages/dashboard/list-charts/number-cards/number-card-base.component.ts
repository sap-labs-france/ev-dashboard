import { NumberCard } from 'types/Dashboard';

export abstract class NumberCardBaseComponent {
  protected details: NumberCard;

  private ongoingFetch: boolean;
  private timeoutId: any;

  public constructor(
    private refreshTimeInMilliSeconds: number
  ) {
    this.details = {
      display: false,
      title: '',
      description: '',
      icon: 'info'
    };
    this.ongoingFetch = false;
    this.timeoutId = setTimeout(() => {
      this.fetchDetails();
    }, refreshTimeInMilliSeconds);
  }

  protected abstract fetchDetails(): void;

}
