import React from 'react'
import { Button } from '@/shared/components'
import {
  exportCsv,
  exportExcelPlaceholder,
  exportPdfPlaceholder,
  printReport,
  type ExportColumn,
} from '../utils/export.utils'

interface ExportToolbarProps {
  reportId: string
  containerId: string
  rows: Record<string, unknown>[]
  columns: ExportColumn[]
}

export const ExportToolbar: React.FC<ExportToolbarProps> = ({
  reportId,
  containerId,
  rows,
  columns,
}) => {
  const filename = `${reportId}-${new Date().toISOString().slice(0, 10)}.csv`

  return (
    <div className="flex flex-wrap gap-2" role="toolbar" aria-label="Export report">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => exportCsv(rows, columns, filename)}
        aria-label="Export report as CSV"
      >
        CSV
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => exportExcelPlaceholder(reportId)}
        aria-label="Export report as Excel"
      >
        Excel
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => exportPdfPlaceholder(reportId)}
        aria-label="Export report as PDF"
      >
        PDF
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => printReport(containerId)}
        aria-label="Print report"
      >
        Print
      </Button>
    </div>
  )
}
