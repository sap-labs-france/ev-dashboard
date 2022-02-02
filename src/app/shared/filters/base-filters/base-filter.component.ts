import { FilterDef, FilterValue } from "../../../types/Filters";

export abstract class BaseFilter {
  protected filterDef!: FilterDef;

  public abstract filterUpdated(): FilterValue;
}
