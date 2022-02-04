import { FilterDef } from "types/Filters";

// All filters must be a derived class of this filter
export abstract class BaseFilter {

  constructor(){
  }

  public abstract initFilter(filterDef: FilterDef): void;

  public abstract reset(): void;

  public abstract filterUpdated(): void;

}
