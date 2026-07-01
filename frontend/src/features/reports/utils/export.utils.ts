export interface ExportColumn {
  key: string
  header: string
}

export function rowsToCsv(rows: Record<string, unknown>[], columns: ExportColumn[]): string {
  const header = columns.map(c => escapeCsv(c.header)).join(',')
  const body = rows
    .map(row => columns.map(c => escapeCsv(String(row[c.key] ?? ''))).join(','))
    .join('\n')
  return `${header}\n${body}`
}

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function downloadBlob(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function exportCsv(
  rows: Record<string, unknown>[],
  columns: ExportColumn[],
  filename: string
): void {
  const csv = rowsToCsv(rows, columns)
  downloadBlob(csv, filename, 'text/csv;charset=utf-8;')
}

export function exportExcelPlaceholder(filename: string): void {
  window.alert(
    `Excel export for "${filename}" is not yet available from the backend. Use CSV export or print instead.`
  )
}

export function exportPdfPlaceholder(filename: string): void {
  window.alert(
    `PDF export for "${filename}" is not yet available from the backend. Use CSV export or print instead.`
  )
}

export function printReport(containerId: string): void {
  const element = document.getElementById(containerId)
  if (!element) return

  const printWindow = window.open('', '_blank', 'noopener,noreferrer')
  if (!printWindow) return

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Report</title>
        <style>
          body { font-family: system-ui, sans-serif; padding: 24px; color: #111; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #f5f5f5; }
          h1 { font-size: 1.5rem; margin-bottom: 8px; }
          .metric-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
          .metric { border: 1px solid #ddd; padding: 12px; border-radius: 4px; }
          .metric-label { font-size: 0.75rem; color: #666; }
          .metric-value { font-size: 1.25rem; font-weight: bold; }
        </style>
      </head>
      <body>${element.innerHTML}</body>
    </html>
  `)
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
}
