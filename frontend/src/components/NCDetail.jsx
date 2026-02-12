import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useToast } from './Toast';
import CommentThread from './CommentThread';

function NCDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const showToast = useToast();
  const [nc, setNc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchNC();
  }, [id]);

  const fetchNC = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ncs/${id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch NC');
      }

      const data = await response.json();
      setNc(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching NC:', err);
      setError('Failed to load non-conformance. It may have been deleted.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const response = await fetch(`/api/ncs/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete NC');
      }

      showToast('NC deleted successfully', 'success');
      navigate('/ncs');
    } catch (err) {
      console.error('Error deleting NC:', err);
      showToast('Failed to delete non-conformance. Please try again.', 'error');
      setError('Failed to delete non-conformance. Please try again.');
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      const updatedData = { ...nc, status: newStatus };

      if (newStatus === 'Closed' && !nc.closure_date) {
        updatedData.closure_date = new Date().toISOString().split('T')[0];
      }

      const response = await fetch(`/api/ncs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      setNc({ ...nc, status: newStatus, closure_date: updatedData.closure_date });
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading non-conformance...</div>
      </div>
    );
  }

  if (error || !nc) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error || 'Non-conformance not found'}</p>
        <Link to="/ncs" className="mt-2 text-sm text-red-600 hover:text-red-800 underline inline-block">
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link to="/ncs" className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block">
            ← Back to list
          </Link>
          <h2 className="text-2xl font-bold text-gray-900">NC #{nc.id}</h2>
        </div>
        <div className="flex space-x-3">
          <Link
            to={`/ncs/${id}/edit`}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Edit
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this non-conformance? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white shadow rounded-lg">
        {/* Status and Severity Badges */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 text-sm font-semibold rounded-full
              ${nc.status === 'Open' ? 'bg-blue-100 text-blue-800' : ''}
              ${nc.status === 'Under Investigation' ? 'bg-yellow-100 text-yellow-800' : ''}
              ${nc.status === 'Action Required' ? 'bg-orange-100 text-orange-800' : ''}
              ${nc.status === 'Closed' ? 'bg-green-100 text-green-800' : ''}
            `}>
              {nc.status}
            </span>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full
              ${nc.severity === 'Low' ? 'bg-gray-100 text-gray-800' : ''}
              ${nc.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' : ''}
              ${nc.severity === 'High' ? 'bg-orange-100 text-orange-800' : ''}
              ${nc.severity === 'Critical' ? 'bg-red-100 text-red-800' : ''}
            `}>
              {nc.severity} Severity
            </span>
          </div>
        </div>

        {/* Effectiveness Check Alert */}
        {nc.needs_effectiveness_check && !nc.effectiveness_score && nc.effectiveness_check_date && (
          <div className="px-6 py-3 bg-yellow-50 border-b border-yellow-200">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-yellow-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Effectiveness Check Due: {new Date(nc.effectiveness_check_date).toLocaleDateString()}
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  This NC was closed on {new Date(nc.closure_date).toLocaleDateString()}.
                  Please review and rate the effectiveness of the corrective actions.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Details */}
        <div className="px-6 py-4">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Title</h3>
              <p className="text-lg font-medium text-gray-900">{nc.title}</p>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
              <p className="text-gray-900 whitespace-pre-wrap">{nc.description}</p>
            </div>

            {/* Grid of Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Date Reported</h3>
                <p className="text-gray-900">{new Date(nc.date_reported).toLocaleDateString()}</p>
              </div>

              {nc.category && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Category</h3>
                  <p className="text-gray-900">{nc.category}</p>
                </div>
              )}

              {nc.department && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Department</h3>
                  <p className="text-gray-900">{nc.department}</p>
                </div>
              )}

              {nc.responsible_person && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Responsible Person</h3>
                  <p className="text-gray-900">{nc.responsible_person}</p>
                </div>
              )}

              {nc.responsible_person_email && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Responsible Person Email</h3>
                  <p className="text-gray-900">
                    <a href={`mailto:${nc.responsible_person_email}`} className="text-blue-600 hover:underline">
                      {nc.responsible_person_email}
                    </a>
                  </p>
                </div>
              )}

              {nc.due_date && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Due Date</h3>
                  <p className="text-gray-900">{new Date(nc.due_date).toLocaleDateString()}</p>
                </div>
              )}

              {nc.closure_date && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Closure Date</h3>
                  <p className="text-gray-900">{new Date(nc.closure_date).toLocaleDateString()}</p>
                </div>
              )}
            </div>

            {/* Root Cause */}
            {nc.root_cause && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Root Cause</h3>
                <p className="text-gray-900 whitespace-pre-wrap">{nc.root_cause}</p>
              </div>
            )}

            {/* Corrective Actions */}
            {nc.corrective_actions && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Corrective Actions</h3>
                <p className="text-gray-900 whitespace-pre-wrap">{nc.corrective_actions}</p>
              </div>
            )}

            {/* Effectiveness Tracking */}
            {nc.status === 'Closed' && (nc.effectiveness_score || nc.effectiveness_notes || nc.effectiveness_check_date) && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Effectiveness Tracking</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {nc.effectiveness_check_date && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Effectiveness Check Date</h4>
                      <p className="text-gray-900">{new Date(nc.effectiveness_check_date).toLocaleDateString()}</p>
                    </div>
                  )}

                  {nc.effectiveness_score && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Effectiveness Score</h4>
                      <div className="flex items-center">
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                          nc.effectiveness_score >= 4 ? 'bg-green-100 text-green-800' :
                          nc.effectiveness_score === 3 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {nc.effectiveness_score}/5
                        </span>
                        <span className="ml-2 text-sm text-gray-600">
                          {nc.effectiveness_score === 5 ? '- Completely Effective' :
                           nc.effectiveness_score === 4 ? '- Very Effective' :
                           nc.effectiveness_score === 3 ? '- Moderately Effective' :
                           nc.effectiveness_score === 2 ? '- Minimally Effective' :
                           '- Not Effective'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {nc.effectiveness_notes && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Effectiveness Evaluation Notes</h4>
                    <p className="text-gray-900 whitespace-pre-wrap">{nc.effectiveness_notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            {nc.notes && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Notes</h3>
                <p className="text-gray-900 whitespace-pre-wrap">{nc.notes}</p>
              </div>
            )}

            {/* Timestamps */}
            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                <div>
                  <span className="font-medium">Created:</span> {new Date(nc.created_at).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span> {new Date(nc.updated_at).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comment Thread Section */}
        <div className="px-6 py-6 border-t border-gray-200">
          <CommentThread ncId={id} />
        </div>

        {/* Status Actions */}
        {nc.status !== 'Closed' && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Update Status</h3>
            <div className="flex flex-wrap gap-2">
              {nc.status !== 'Under Investigation' && (
                <button
                  onClick={() => handleStatusUpdate('Under Investigation')}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Mark as Under Investigation
                </button>
              )}
              {nc.status !== 'Action Required' && (
                <button
                  onClick={() => handleStatusUpdate('Action Required')}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Mark as Action Required
                </button>
              )}
              <button
                onClick={() => handleStatusUpdate('Closed')}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                Close NC
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default NCDetail;
