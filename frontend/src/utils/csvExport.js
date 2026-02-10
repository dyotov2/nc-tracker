/**
 * Convert array of objects to CSV format
 */
export function convertToCSV(data, columns) {
  if (!data || data.length === 0) {
    return '';
  }

  // Create header row
  const headers = columns.map(col => col.label).join(',');

  // Create data rows
  const rows = data.map(item => {
    return columns.map(col => {
      let value = item[col.key] || '';

      // Format dates
      if (col.format === 'date' && value) {
        value = new Date(value).toLocaleDateString();
      }

      // Escape quotes and wrap in quotes if contains comma, newline, or quote
      if (typeof value === 'string') {
        value = value.replace(/"/g, '""'); // Escape quotes
        if (value.includes(',') || value.includes('\n') || value.includes('"')) {
          value = `"${value}"`;
        }
      }

      return value;
    }).join(',');
  });

  return [headers, ...rows].join('\n');
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent, filename = 'export.csv') {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, filename);
  } else {
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = filename;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Export NCs to CSV
 */
export function exportNCs(ncs, filename) {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Title' },
    { key: 'description', label: 'Description' },
    { key: 'status', label: 'Status' },
    { key: 'severity', label: 'Severity' },
    { key: 'category', label: 'Category' },
    { key: 'department', label: 'Department' },
    { key: 'date_reported', label: 'Date Reported', format: 'date' },
    { key: 'root_cause', label: 'Root Cause' },
    { key: 'corrective_actions', label: 'Corrective Actions' },
    { key: 'responsible_person', label: 'Responsible Person' },
    { key: 'responsible_person_email', label: 'Responsible Email' },
    { key: 'due_date', label: 'Due Date', format: 'date' },
    { key: 'closure_date', label: 'Closure Date', format: 'date' },
    { key: 'effectiveness_score', label: 'Effectiveness Score' },
    { key: 'effectiveness_notes', label: 'Effectiveness Notes' },
    { key: 'notes', label: 'Notes' },
    { key: 'created_at', label: 'Created At', format: 'date' },
    { key: 'updated_at', label: 'Updated At', format: 'date' }
  ];

  const csv = convertToCSV(ncs, columns);
  const exportFilename = filename || `nc-export-${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csv, exportFilename);
}
