import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DataTableProps {
  children: ReactNode;
  className?: string;
}

export function DataTable({ children, className }: DataTableProps) {
  return (
    <div className={cn('glass-card overflow-hidden', className)}>
      {children}
    </div>
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
        'sticky top-0 z-10 bg-gradient-to-r from-slate-50/80 to-slate-100/50 border-b border-slate-200/60',
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

interface DataTableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
  className?: string;
  selected?: boolean;
}

export function DataTableRow({ children, className, selected, ...props }: DataTableRowProps) {
  return (
    <tr
      className={cn(
        'h-20 border-b border-slate-100 transition-all duration-200',
        'bg-white/50',
        'hover:bg-white hover:shadow-sm',
        selected && 'bg-blue-50/50 hover:bg-blue-50',
        'group',
        className
      )}
      {...props}
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
  const ArrowUpDown = () => <span className="text-slate-400 text-xs">⇅</span>;
  const ArrowUp = () => <span className="text-blue-600 text-xs font-bold">↑</span>;
  const ArrowDown = () => <span className="text-blue-600 text-xs font-bold">↓</span>;

  return (
    <th
      className={cn(
        'px-5 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider',
        sortable && 'cursor-pointer select-none hover:bg-slate-100/50 transition-colors',
        sortDirection && 'text-blue-600',
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

