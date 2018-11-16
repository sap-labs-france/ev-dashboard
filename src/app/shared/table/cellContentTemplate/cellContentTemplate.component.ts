import { TableColumnDef } from "../../../common.types";
export interface CellContentTemplateComponent {

  setData(row: any, columnDef: TableColumnDef);

}