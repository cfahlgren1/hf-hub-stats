import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

interface TableData {
  [key: string]: string | number;
}

interface TableProps {
  data: TableData[] | undefined;
  caption?: string;
}

export function GenericTable({ data, caption }: TableProps) {
  const headers = data && data.length > 0 ? ['#', ...Object.keys(data[0])] : [];
  const isLoading = !data;
  const isEmpty = data && data.length === 0;

  const renderSkeleton = (count: number) => (
    [...Array(count)].map((_, index) => (
      <TableCell key={index}>
        <Skeleton className="h-4 w-full" />
      </TableCell>
    ))
  );

  const renderHeaders = () => headers.map((header, index) => (
    <TableHead
      key={header}
      className={`${index === 0 ? 'text-right' : 'text-left'} text-black font-bold`}
    >
      {header.toUpperCase()}
    </TableHead>
  ));

  const renderRows = () => {
    if (isLoading) {
      return [...Array(10)].map((_, index) => <TableRow key={index}>{renderSkeleton(5)}</TableRow>);
    }
    if (isEmpty) {
      return (
        <TableRow>
          <TableCell colSpan={headers.length || 1} className="text-center py-4">
            No results found
          </TableCell>
        </TableRow>
      );
    }
    return data.map((row, index) => (
      <TableRow key={index}>
        <TableCell className="text-right font-medium">{index + 1}</TableCell>
        {Object.entries(row).map(([key, value]) => (
          <TableCell
            key={`${index}-${key}`}
            className={key.toLowerCase().includes('amount') ? 'text-right' : ''}
          >
            {value}
          </TableCell>
        ))}
      </TableRow>
    ));
  };

  return (
    <Table>
      {caption && <TableCaption>{caption}</TableCaption>}
      <TableHeader>
        <TableRow>
          {isLoading ? renderSkeleton(5) : isEmpty ? null : renderHeaders()}
        </TableRow>
      </TableHeader>
      <TableBody>
        {renderRows()}
      </TableBody>
    </Table>
  );
}
