import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Link } from 'react-router-dom';

const STATUS_COLUMNS = [
  { id: 'Open', title: 'Open', color: 'bg-blue-100 border-blue-300' },
  { id: 'Under Investigation', title: 'Under Investigation', color: 'bg-yellow-100 border-yellow-300' },
  { id: 'Action Required', title: 'Action Required', color: 'bg-orange-100 border-orange-300' },
  { id: 'Closed', title: 'Closed', color: 'bg-green-100 border-green-300' }
];

function KanbanBoard() {
  const [ncs, setNcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [effectivenessChecks, setEffectivenessChecks] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ncsResponse, effectivenessResponse] = await Promise.all([
        fetch('/api/ncs'),
        fetch('/api/ncs/effectiveness-checks')
      ]);

      if (!ncsResponse.ok) {
        throw new Error('Failed to fetch NCs');
      }

      const ncsData = await ncsResponse.json();
      const effectivenessData = effectivenessResponse.ok ? await effectivenessResponse.json() : [];

      setNcs(ncsData);
      setEffectivenessChecks(effectivenessData);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    // Dropped outside a valid droppable
    if (!destination) return;

    // No change in position
    if (source.droppableId === destination.droppableId) return;

    const ncId = parseInt(draggableId);
    const newStatus = destination.droppableId;

    // Optimistically update UI
    setNcs(prevNcs =>
      prevNcs.map(nc =>
        nc.id === ncId ? { ...nc, status: newStatus } : nc
      )
    );

    // Update on server
    try {
      const response = await fetch(`/api/ncs/${ncId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          closure_date: newStatus === 'Closed' ? new Date().toISOString().split('T')[0] : null
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update NC status');
      }

      // Refresh data to get updated effectiveness check info
      fetchData();
    } catch (err) {
      console.error('Error updating NC:', err);
      // Revert optimistic update
      fetchData();
    }
  };

  const getNCsForColumn = (status) => {
    return ncs.filter(nc => nc.status === status);
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'Low': 'bg-gray-200 text-gray-800',
      'Medium': 'bg-yellow-200 text-yellow-900',
      'High': 'bg-orange-200 text-orange-900',
      'Critical': 'bg-red-200 text-red-900'
    };
    return colors[severity] || 'bg-gray-200 text-gray-800';
  };

  const needsEffectivenessCheck = (ncId) => {
    return effectivenessChecks.some(check => check.id === ncId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading board...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button
          onClick={fetchData}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Kanban Board</h2>
        <Link
          to="/ncs/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Create New NC
        </Link>
      </div>

      {/* Effectiveness Check Alert */}
      {effectivenessChecks.length > 0 && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                {effectivenessChecks.length} NC{effectivenessChecks.length > 1 ? 's' : ''} Need Effectiveness Review
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                {effectivenessChecks.map(nc => (
                  <Link
                    key={nc.id}
                    to={`/ncs/${nc.id}`}
                    className="block hover:underline"
                  >
                    NC #{nc.id}: {nc.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {STATUS_COLUMNS.map(column => {
            const columnNCs = getNCsForColumn(column.id);

            return (
              <div key={column.id} className="flex flex-col">
                <div className={`${column.color} border-2 rounded-t-lg p-3`}>
                  <h3 className="font-semibold text-gray-800">
                    {column.title}
                    <span className="ml-2 text-sm text-gray-600">
                      ({columnNCs.length})
                    </span>
                  </h3>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 bg-gray-50 border-2 border-t-0 rounded-b-lg p-2 min-h-[500px] ${
                        snapshot.isDraggingOver ? 'bg-blue-50' : ''
                      }`}
                    >
                      {columnNCs.map((nc, index) => (
                        <Draggable
                          key={nc.id}
                          draggableId={nc.id.toString()}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white rounded-lg shadow p-3 mb-2 border border-gray-200 cursor-move hover:shadow-md transition-shadow ${
                                snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-500' : ''
                              }`}
                            >
                              <Link to={`/ncs/${nc.id}`} className="block">
                                <div className="flex items-start justify-between mb-2">
                                  <span className="text-xs font-medium text-gray-500">
                                    NC #{nc.id}
                                  </span>
                                  {needsEffectivenessCheck(nc.id) && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                      Check Due
                                    </span>
                                  )}
                                </div>

                                <h4 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                                  {nc.title}
                                </h4>

                                <div className="flex flex-wrap gap-1 mb-2">
                                  <span className={`px-2 py-0.5 text-xs font-semibold rounded ${getSeverityColor(nc.severity)}`}>
                                    {nc.severity}
                                  </span>
                                  {nc.department && (
                                    <span className="px-2 py-0.5 text-xs font-medium rounded bg-purple-100 text-purple-800">
                                      {nc.department}
                                    </span>
                                  )}
                                </div>

                                {nc.responsible_person && (
                                  <div className="text-xs text-gray-600 truncate">
                                    👤 {nc.responsible_person}
                                  </div>
                                )}

                                {nc.due_date && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Due: {new Date(nc.due_date).toLocaleDateString()}
                                  </div>
                                )}
                              </Link>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      {columnNCs.length === 0 && (
                        <div className="text-center text-gray-400 mt-8">
                          No items
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}

export default KanbanBoard;
