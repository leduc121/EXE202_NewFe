"use client"

import { useState } from 'react';
import { Plus, Settings, FileText, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { api } from "../../../../../lib/api"

const rangeLabels: Record<string, string> = {
  '30d': '30 ngày',
  '3m': '3 tháng',
  '1y': '12 tháng',
};

export function QuickActions() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportRange, setExportRange] = useState<'1y' | '3m' | '30d'>('1y');

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const blob = await api.downloadAdminDashboardExport(exportRange);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `uniwave-admin-export-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed', error);
      window.alert(
        error instanceof Error ? error.message : 'Could not export dashboard data. Please try again.',
      );
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Button className="cursor-pointer">
        <Plus className="h-4 w-4 mr-2" />
        New Sale
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="cursor-pointer">
            <Settings className="h-4 w-4 mr-2" />
            Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="cursor-pointer">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <div className="px-3 py-2 text-sm text-slate-500">Khoảng thời gian export</div>
          <DropdownMenuItem
            className={`cursor-pointer ${exportRange === '30d' ? 'font-semibold' : ''}`}
            onSelect={(event) => {
              event.preventDefault();
              setExportRange('30d');
            }}
          >
            30 ngày
          </DropdownMenuItem>
          <DropdownMenuItem
            className={`cursor-pointer ${exportRange === '3m' ? 'font-semibold' : ''}`}
            onSelect={(event) => {
              event.preventDefault();
              setExportRange('3m');
            }}
          >
            3 tháng
          </DropdownMenuItem>
          <DropdownMenuItem
            className={`cursor-pointer ${exportRange === '1y' ? 'font-semibold' : ''}`}
            onSelect={(event) => {
              event.preventDefault();
              setExportRange('1y');
            }}
          >
            12 tháng
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={(event) => {
              event.preventDefault();
              handleExport();
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : `Export Data (${rangeLabels[exportRange]})`}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer">
            <Settings className="h-4 w-4 mr-2" />
            Dashboard Settings
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
