// All filter templates must be a derived class of this filter
export abstract class BaseTemplateFilter {

  public abstract reset(): void;

  public abstract filterUpdated(event: any): void;

}
