import { Download, FileText, FileJson, FileSpreadsheet, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ExportDropdownProps {
  onExportCSV: () => void;
  onExportJSON: () => void;
  onExportTXT?: () => void;
  isExporting: boolean;
  label?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'icon';
}

const ExportDropdown = ({
  onExportCSV,
  onExportJSON,
  onExportTXT,
  isExporting,
  label = 'Export',
  variant = 'outline',
  size = 'sm',
}: ExportDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={isExporting} className="gap-2">
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {size !== 'icon' && label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Export Format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onExportCSV} className="gap-2 cursor-pointer">
          <FileSpreadsheet className="h-4 w-4" />
          CSV (Spreadsheet)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExportJSON} className="gap-2 cursor-pointer">
          <FileJson className="h-4 w-4" />
          JSON (Data)
        </DropdownMenuItem>
        {onExportTXT && (
          <DropdownMenuItem onClick={onExportTXT} className="gap-2 cursor-pointer">
            <FileText className="h-4 w-4" />
            TXT (Text)
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportDropdown;
