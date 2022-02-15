import { FilterHttpIDs } from '../../types/Filters';
import { KeyValue } from '../../types/GlobalType';

export abstract class BaseFilter{

  public abstract id: string;
  public abstract label: string;
  public abstract visible: boolean;
  public abstract cssClass: string;
  public abstract name: string;

  public abstract reset(): void;

  protected abstract getCurrentValueAsKeyValue(): KeyValue[];

}
