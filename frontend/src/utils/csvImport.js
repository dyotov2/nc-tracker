/**
 * Parse CSV content to array of objects
 */
export function parseCSV(csvContent) {
  const lines = csvContent.split('\n').filter(line => line.trim());

  if (lines.length < 2) {
    throw new Error('CSV file must contain at least a header row and one data row');
  }

  // Parse header
  const headers = parseCSVLine(lines[0]);

  // Parse data rows
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0) continue; // Skip empty lines

    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    data.push(row);
  }

  return { headers, data };
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Push last field
  result.push(current.trim());

  return result;
}

/**
 * Map CSV columns to NC fields
 */
export function mapCSVColumns(headers) {
  const fieldMapping = {
    // Exact matches
    'id': 'id',
    'title': 'title',
    'description': 'description',
    'status': 'status',
    'severity': 'severity',
    'category': 'category',
    'department': 'department',
    'date_reported': 'date_reported',
    'root_cause': 'root_cause',
    'corrective_actions': 'corrective_actions',
    'responsible_person': 'responsible_person',
    'responsible_person_email': 'responsible_person_email',
    'due_date': 'due_date',
    'notes': 'notes',

    // Common variations
    'date reported': 'date_reported',
    'root cause': 'root_cause',
    'corrective actions': 'corrective_actions',
    'responsible person': 'responsible_person',
    'responsible email': 'responsible_person_email',
    'email': 'responsible_person_email',
    'due date': 'due_date',
    'assigned to': 'responsible_person',
    'assignee': 'responsible_person',
  };

  const mapping = {};
  headers.forEach(header => {
    const normalized = header.toLowerCase().trim();
    if (fieldMapping[normalized]) {
      mapping[header] = fieldMapping[normalized];
    } else {
      mapping[header] = null; // Unknown field
    }
  });

  return mapping;
}

/**
 * Convert CSV row to NC object using mapping
 */
export function convertRowToNC(row, mapping) {
  const nc = {
    title: '',
    description: '',
    date_reported: new Date().toISOString().split('T')[0],
    status: 'Open',
    severity: 'Medium',
    category: '',
    department: '',
    root_cause: '',
    corrective_actions: '',
    responsible_person: '',
    responsible_person_email: '',
    due_date: '',
    notes: ''
  };

  // Apply mapping
  Object.keys(row).forEach(csvColumn => {
    const ncField = mapping[csvColumn];
    if (ncField && row[csvColumn]) {
      nc[ncField] = row[csvColumn];
    }
  });

  return nc;
}

/**
 * Validate NC data
 */
export function validateNC(nc, rowIndex) {
  const errors = [];

  if (!nc.title || nc.title.trim() === '') {
    errors.push(`Row ${rowIndex}: Title is required`);
  }

  if (!nc.description || nc.description.trim() === '') {
    errors.push(`Row ${rowIndex}: Description is required`);
  }

  const validStatuses = ['Open', 'Under Investigation', 'Action Required', 'Closed'];
  if (nc.status && !validStatuses.includes(nc.status)) {
    errors.push(`Row ${rowIndex}: Invalid status "${nc.status}". Must be one of: ${validStatuses.join(', ')}`);
  }

  const validSeverities = ['Low', 'Medium', 'High', 'Critical'];
  if (nc.severity && !validSeverities.includes(nc.severity)) {
    errors.push(`Row ${rowIndex}: Invalid severity "${nc.severity}". Must be one of: ${validSeverities.join(', ')}`);
  }

  return errors;
}
