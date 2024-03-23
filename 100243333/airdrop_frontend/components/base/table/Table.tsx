import { PuzzlePieceIcon } from "@heroicons/react/24/solid";
import { ReactNode, useEffect, useState } from "react";
import { CgSpinnerTwo } from "react-icons/cg";

export type TableRowData = {
  [key: string]: any;
};

export type TableData = TableRowData[];

export interface TableCol {
  label: ReactNode;
  prop: string;
  render?: (row: TableRowData) => ReactNode;
  sortable?: boolean;
  sortKey?: string;
}

interface TableProp {
  columns: TableCol[];
  data: TableData;
  loading?: boolean;
  isEmpty?: boolean;
  border?: boolean;
  stickyHeader?: boolean;
  onClickRow?: (rowData: TableRowData) => void;
}

const Table: React.FC<TableProp> = ({
  columns,
  data,
  loading,
  border,
  stickyHeader,
  onClickRow,
}: TableProp) => {
  return (
    <div className="relative mx-0 mt-0 md:mx-0 md:rounded-lg">
      <table className="divide-divider/20 min-w-full divide-y">
        <thead
          className={`dark:bg-light-gray bg-[#EEF1F3] ${
            stickyHeader ?? "sticky top-0"
          }`}
        >
          <tr className={`${border && "divide-divider/20 divide-x"}`}>
            {columns?.map(({ label, sortable, sortKey }: TableCol, index) => (
              <th
                key={`th-${index}`}
                scope="col"
                className={`dark:text-light max-w-lg py-3.5 px-2 text-left text-sm font-semibold text-gray-800 ${
                  index === 0
                    ? "pl-4 pr-3 sm:pl-6"
                    : columns.length > 1 && index === columns.length - 1
                    ? "pl-3 pr-4 sm:pr-6"
                    : ""
                }`}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-divider/20 dark:bg-dark-blue dark:text-light divide-y text-gray-800">
          {data?.length ? (
            <>
              {data?.map((row: TableRowData, rowIndex) => (
                <tr
                  key={`tr-${rowIndex}`}
                  className={`hover:bg-primary/10 dark:hover:bg-primary/10 ${
                    rowIndex % 2 !== 0 ? "" : ""
                  } ${border && "divide-divider/20 divide-x "} ${
                    onClickRow ? "cursor-pointer" : "cursor-default"
                  }`}
                  onClick={() => (onClickRow ? onClickRow(row) : null)}
                >
                  {columns?.map(({ prop, render }: TableCol, colIndex) => (
                    <td
                      key={`rd-${colIndex}`}
                      className={`dark:text-light max-w-lg break-all py-3 px-2 text-sm text-gray-800 ${
                        colIndex === 0
                          ? "pl-4 pr-3 sm:pl-6"
                          : columns.length > 1 &&
                            colIndex === columns.length - 1
                          ? "pl-3 pr-4 sm:pr-6"
                          : ""
                      }`}
                    >
                      {render ? render(row) : row[prop]}
                    </td>
                  ))}
                </tr>
              ))}
            </>
          ) : (
            <tr>
              <td colSpan={columns?.length}>
                <div className="flex min-h-[240px] items-center justify-center text-center text-xs text-slate-400">
                  <PuzzlePieceIcon className="inline-block h-4 w-4" /> No
                  results
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 text-sm text-primary dark:bg-black/60">
          <CgSpinnerTwo className="h-5 w-5 animate-spin" /> Loading...
        </div>
      )}
    </div>
  );
};

export default Table;

// 使用方法如下

// const columns: TableCol[] = [
//   { label: "名称", prop: "name" },
//   { label: "描述简介", prop: "description" },
//   {
//     label: "创建时间",
//     prop: "createTime",
//     render: (rowData) => (
//       <span>
//         {dayjs(rowData.createTime).isValid()
//           ? dayjs(rowData.createTime).format("YYYY-MM-DD HH:mm:ss")
//           : "-"}
//       </span>
//     ),
//   },
//   {
//     label: "操作",
//     prop: "",
//     render: (rowData) => (
//       <div className="flex space-x-2">
//         <button
//           className="rounded border border-danger px-2 py-1 text-xs text-danger hover:bg-danger hover:text-white"
//           onClick={() => onDelete(rowData)}
//         >
//           删除
//         </button>
//         <button
//           className="rounded border border-primary px-2 py-1 text-xs text-primary hover:bg-primary hover:text-white"
//           onClick={() => onEdit(rowData)}
//         >
//           编辑
//         </button>
//       </div>
//     ),
//   },
// ];

// <Table
//   columns={columns}
//   data={results as TableData}
//   loading={isPending}
// />
