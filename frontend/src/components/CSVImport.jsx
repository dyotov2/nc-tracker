import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseCSV, mapCSVColumns, convertRowToNC, validateNC } from '../utils/csvImport';
import { useToast } from './Toast';

function CSVImport({ onClose }) {
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [csvData, setCsvData] = useState(null);
  const [columnMapping, setColumnMapping] = useState({});
  const [errors, setErrors] = useState([]);
  const [preview, setPreview] = useState([]);
  const navigate = useNavigate();
  const showToast = useToast();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setErrors([]);
      setCsvData(null);
      setColumnMapping({});
      setPreview([]);
    } else {
      setErrors(['Please select a valid CSV file']);
      setFile(null);
    }
  };

  const handleParse = async () => {
    if (!file) return;

    setParsing(true);
    setErrors([]);

    try {
      const content = await file.text();
      const { headers, data } = parseCSV(content);

      // Auto-map columns
      const mapping = mapCSVColumns(headers);

      setCsvData({ headers, data });
      setColumnMapping(mapping);

      // Generate preview (first 5 rows)
      const previewData = data.slice(0, 5).map((row, idx) =>
        convertRowToNC(row, mapping)
      );
      setPreview(previewData);

      showToast('CSV parsed successfully', 'success');
    } catch (err) {
      console.error('Error parsing CSV:', err);
      setErrors([err.message]);
      showToast('Failed to parse CSV file', 'error');
    } finally {
      setParsing(false);
    }
  };

  const handleColumnMappingChange = (csvColumn, ncField) => {
    const newMapping = { ...columnMapping, [csvColumn]: ncField };
    setColumnMapping(newMapping);

    // Update preview
    const previewData = csvData.data.slice(0, 5).map((row, idx) =>
      convertRowToNC(row, newMapping)
    );
    setPreview(previewData);
  };

  const handleImport = async () => {
    if (!csvData) return;

    setImporting(true);
    setErrors([]);

    try {
      // Convert all rows to NCs
      const ncs = csvData.data.map((row, idx) => {
        const nc = convertRowToNC(row, columnMapping);
        return { nc, rowIndex: idx + 2 }; // +2 because row 1 is header, index starts at 0
      });

      // Validate all NCs
      const validationErrors = [];
      ncs.forEach(({ nc, rowIndex }) => {
        const rowErrors = validateNC(nc, rowIndex);
        validationErrors.push(...rowErrors);
      });

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        showToast(`${validationErrors.length} validation error(s) found`, 'error');
        return;
      }

      // Import NCs one by one
      let successCount = 0;
      let failCount = 0;

      for (const { nc } of ncs) {
        try {
          const response = await fetch('/api/ncs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nc)
          });

          if (response.ok) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (err) {
          failCount++;
        }
      }

      if (successCount > 0) {
        showToast(`Successfully imported ${successCount} NC(s)`, 'success');
        if (failCount > 0) {
          showToast(`Failed to import ${failCount} NC(s)`, 'warning');
        }
        onClose();
        navigate('/ncs');
      } else {
        throw new Error('Failed to import any NCs');
      }
    } catch (err) {
      console.error('Error importing NCs:', err);
      setErrors([err.message]);
      showToast('Failed to import NCs', 'error');
    } finally {
      setImporting(false);
    }
  };

  const ncFields = [
    { value: '', label: '-- Do not import --' },
    { value: 'title', label: 'Title' },
    { value: 'description', label: 'Description' },
    { value: 'status', label: 'Status' },
    { value: 'severity', label: 'Severity' },
    { value: 'category', label: 'Category' },
    { value: 'department', label: 'Department' },
    { value: 'date_reported', label: 'Date Reported' },
    { value: 'root_cause', label: 'Root Cause' },
    { value: 'corrective_actions', label: 'Corrective Actions' },
    { value: 'responsible_person', label: 'Responsible Person' },
    { value: 'responsible_person_email', label: 'Responsible Email' },
    { value: 'due_date', label: 'Due Date' },
    { value: 'notes', label: 'Notes' }
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Import NCs from CSV</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-4">
          {/* Step 1: File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Step 1: Select CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 focus:outline-none"
            />
            {file && (
              <button
                onClick={handleParse}
                disabled={parsing}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {parsing ? 'Parsing...' : 'Parse CSV'}
              </button>
            )}
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">Errors:</h4>
              <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-400 space-y-1">
                {errors.slice(0, 10).map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
                {errors.length > 10 && (
                  <li className="font-medium">... and {errors.length - 10} more errors</li>
                )}
              </ul>
            </div>
          )}

          {/* Step 2: Column Mapping */}
          {csvData && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Step 2: Map CSV Columns to NC Fields
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                {csvData.headers.map(header => (
                  <div key={header} className="flex items-center gap-3">
                    <div className="w-1/3 text-sm text-gray-700 dark:text-gray-300 truncate" title={header}>
                      {header}
                    </div>
                    <div className="w-8 text-center text-gray-400">→</div>
                    <select
                      value={columnMapping[header] || ''}
                      onChange={(e) => handleColumnMappingChange(header, e.target.value)}
                      className="w-1/2 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {ncFields.map(field => (
                        <option key={field.value} value={field.value}>{field.label}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Preview */}
          {preview.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Step 3: Preview (First 5 rows)
              </label>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="max-h-60 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Title</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Description</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Status</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Severity</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {preview.map((nc, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2 text-gray-900 dark:text-white truncate max-w-[150px]">{nc.title}</td>
                          <td className="px-3 py-2 text-gray-900 dark:text-white truncate max-w-[200px]">{nc.description}</td>
                          <td className="px-3 py-2 text-gray-900 dark:text-white">{nc.status}</td>
                          <td className="px-3 py-2 text-gray-900 dark:text-white">{nc.severity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Total rows to import: {csvData.data.length}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={importing}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!csvData || importing || errors.length > 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {importing ? 'Importing...' : `Import ${csvData?.data.length || 0} NCs`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CSVImport;
