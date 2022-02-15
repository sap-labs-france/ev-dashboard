import { FilterHttpIDs } from "../../../types/Filters";
import { KeyValue } from "../../../types/GlobalType";
import { BaseFilter } from "../base-filter.component";

export abstract class BaseDropdownFilterComponent extends BaseFilter{

  public abstract httpId: FilterHttpIDs;
  public abstract currentValue: KeyValue[];
  public abstract defaultValue: KeyValue[];
  public abstract items: KeyValue[];

  public abstract filterUpdated(event: any): void;

}
