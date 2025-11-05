import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DataTableProps {
  children: ReactNode;
  className?: string;
}

export function DataTable({ children, className }: DataTableProps) {
  return (
    <Card className={cn('rounded-xl shadow-sm overflow-hidden', className)}>
      {children}
    </Card>
  );
}

interface DataTableHeaderProps {
  children: ReactNode;
  className?: string;
}

export function DataTableHeader({ children, className }: DataTableHeaderProps) {
  return (
    <div
      className={cn(
        'sticky top-0 z-10 bg-muted/30 border-b border-border backdrop-blur-sm',
        className
      )}
    >
      {children}
    </div>
  );
}

interface DataTableContentProps {
  children: ReactNode;
  className?: string;
}

export function DataTableContent({ children, className }: DataTableContentProps) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      {children}
    </div>
  );
}

interface DataTableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
}

export function DataTableRow({ children, className, onClick, selected }: DataTableRowProps) {
  return (
    <tr
      className={cn(
        'h-20 border-b border-border transition-colors',
        'odd:bg-background even:bg-muted/[0.35]',
        'hover:bg-primary/5',
        onClick && 'cursor-pointer',
        selected && 'bg-primary/10',
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

interface DataTableCellProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

export function DataTableCell({ children, className, title }: DataTableCellProps) {
  return (
    <td
      className={cn('px-5 py-4 text-sm', className)}
      title={title}
    >
      {children}
    </td>
  );
}

interface DataTableHeaderCellProps {
  children: ReactNode;
  className?: string;
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc' | null;
  onSort?: () => void;
  'aria-sort'?: 'ascending' | 'descending' | 'none';
}

export function DataTableHeaderCell({
  children,
  className,
  sortable,
  sortDirection,
  onSort,
  'aria-sort': ariaSort,
}: DataTableHeaderCellProps) {
  const ArrowUpDown = () => <span className="text-muted-foreground">⇅</span>;
  const ArrowUp = () => <span className="text-foreground">↑</span>;
  const ArrowDown = () => <span className="text-foreground">↓</span>;

  return (
    <th
      className={cn(
        'px-5 py-4 text-left text-sm font-semibold',
        sortable && 'cursor-pointer select-none hover:bg-muted/50',
        sortDirection && 'text-foreground',
        className
      )}
      onClick={sortable ? onSort : undefined}
      aria-sort={ariaSort || (sortable ? 'none' : undefined)}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortable && (
          <span className="inline-flex items-center text-xs">
            {sortDirection === 'asc' ? <ArrowUp /> : sortDirection === 'desc' ? <ArrowDown /> : <ArrowUpDown />}
          </span>
        )}
      </div>
    </th>
  );
}

