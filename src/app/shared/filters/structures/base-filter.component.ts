import { FilterDef } from "types/Filters";

// All filters must be a derived class of this filter
export abstract class BaseFilter {

  public abstract reset(): void;

  public abstract filterUpdated(event: any): void;

}
