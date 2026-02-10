import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function NCForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
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
    effectiveness_score: '',
    effectiveness_notes: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (isEditMode) {
      fetchNC();
    }
  }, [id]);

  const fetchNC = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ncs/${id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch NC');
      }

      const data = await response.json();
      setFormData({
        title: data.title || '',
        description: data.description || '',
        date_reported: data.date_reported || '',
        status: data.status || 'Open',
        severity: data.severity || 'Medium',
        category: data.category || '',
        department: data.department || '',
        root_cause: data.root_cause || '',
        corrective_actions: data.corrective_actions || '',
        responsible_person: data.responsible_person || '',
        responsible_person_email: data.responsible_person_email || '',
        due_date: data.due_date || '',
        effectiveness_score: data.effectiveness_score || '',
        effectiveness_notes: data.effectiveness_notes || '',
        notes: data.notes || ''
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching NC:', err);
      setError('Failed to load non-conformance data.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }

    if (!formData.date_reported) {
      errors.date_reported = 'Date reported is required';
    }

    if (!formData.status) {
      errors.status = 'Status is required';
    }

    if (!formData.severity) {
      errors.severity = 'Severity is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const url = isEditMode ? `/api/ncs/${id}` : '/api/ncs';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to save NC');
      }

      const savedNC = await response.json();
      navigate(`/ncs/${savedNC.id || id}`);
    } catch (err) {
      console.error('Error saving NC:', err);
      setError('Failed to save non-conformance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading form...</div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Edit Non-Conformance' : 'Create New Non-Conformance'}
        </h2>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.title ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.title && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.description && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
            )}
          </div>

          {/* Date Reported, Status, Severity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="date_reported" className="block text-sm font-medium text-gray-700 mb-1">
                Date Reported <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="date_reported"
                name="date_reported"
                value={formData.date_reported}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.date_reported ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {validationErrors.date_reported && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.date_reported}</p>
              )}
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.status ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="Open">Open</option>
                <option value="Under Investigation">Under Investigation</option>
                <option value="Action Required">Action Required</option>
                <option value="Closed">Closed</option>
              </select>
              {validationErrors.status && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.status}</p>
              )}
            </div>

            <div>
              <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-1">
                Severity <span className="text-red-500">*</span>
              </label>
              <select
                id="severity"
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.severity ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
              {validationErrors.severity && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.severity}</p>
              )}
            </div>
          </div>

          {/* Category and Department */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g., Product, Process, Documentation"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Department</option>
                <option value="Sales">Sales</option>
                <option value="Warehouse">Warehouse</option>
                <option value="Production Line A">Production Line A</option>
                <option value="Production Line B">Production Line B</option>
                <option value="Delivery">Delivery</option>
                <option value="Admin">Admin</option>
                <option value="Finance">Finance</option>
              </select>
            </div>
          </div>

          {/* Responsible Person and Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="responsible_person" className="block text-sm font-medium text-gray-700 mb-1">
                Responsible Person
              </label>
              <input
                type="text"
                id="responsible_person"
                name="responsible_person"
                value={formData.responsible_person}
                onChange={handleChange}
                placeholder="Name of person assigned"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="responsible_person_email" className="block text-sm font-medium text-gray-700 mb-1">
                Responsible Person Email
              </label>
              <input
                type="email"
                id="responsible_person_email"
                name="responsible_person_email"
                value={formData.responsible_person_email}
                onChange={handleChange}
                placeholder="email@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">Email notifications will be sent when assigned or status changes</p>
            </div>
          </div>

          {/* Root Cause */}
          <div>
            <label htmlFor="root_cause" className="block text-sm font-medium text-gray-700 mb-1">
              Root Cause
            </label>
            <textarea
              id="root_cause"
              name="root_cause"
              rows="3"
              value={formData.root_cause}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Corrective Actions */}
          <div>
            <label htmlFor="corrective_actions" className="block text-sm font-medium text-gray-700 mb-1">
              Corrective Actions
            </label>
            <textarea
              id="corrective_actions"
              name="corrective_actions"
              rows="3"
              value={formData.corrective_actions}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Due Date */}
          <div>
            <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              id="due_date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Effectiveness Tracking (for Closed NCs) */}
          {(isEditMode || formData.status === 'Closed') && (
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Effectiveness Tracking</h3>
              <p className="text-sm text-gray-600 mb-4">
                After closing an NC, track the effectiveness of the corrective actions (3-6 months after closure).
              </p>

              <div className="space-y-6">
                {/* Effectiveness Score */}
                <div>
                  <label htmlFor="effectiveness_score" className="block text-sm font-medium text-gray-700 mb-1">
                    Effectiveness Score (1-5)
                  </label>
                  <select
                    id="effectiveness_score"
                    name="effectiveness_score"
                    value={formData.effectiveness_score}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Not Yet Evaluated</option>
                    <option value="1">1 - Not Effective (Issue Recurred)</option>
                    <option value="2">2 - Minimally Effective</option>
                    <option value="3">3 - Moderately Effective</option>
                    <option value="4">4 - Very Effective</option>
                    <option value="5">5 - Completely Effective (No Recurrence)</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Rate how well the corrective actions prevented recurrence of the issue.
                  </p>
                </div>

                {/* Effectiveness Notes */}
                <div>
                  <label htmlFor="effectiveness_notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Effectiveness Evaluation Notes
                  </label>
                  <textarea
                    id="effectiveness_notes"
                    name="effectiveness_notes"
                    rows="3"
                    value={formData.effectiveness_notes}
                    onChange={handleChange}
                    placeholder="Document findings from the effectiveness review..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Has the issue recurred? Are additional actions needed?
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows="3"
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="mt-6 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate(isEditMode ? `/ncs/${id}` : '/ncs')}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : (isEditMode ? 'Update NC' : 'Create NC')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default NCForm;
