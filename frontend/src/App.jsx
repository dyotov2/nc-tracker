import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import KanbanBoard from './components/KanbanBoard';
import NCList from './components/NCList';
import NCForm from './components/NCForm';
import NCDetail from './components/NCDetail';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {/* Navigation Bar */}
        <nav className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <h1 className="text-xl font-bold text-gray-800">NC Tracker</h1>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link
                    to="/"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/board"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600"
                  >
                    Board
                  </Link>
                  <Link
                    to="/ncs"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600"
                  >
                    All NCs
                  </Link>
                  <Link
                    to="/ncs/new"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600"
                  >
                    Create NC
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/board" element={<KanbanBoard />} />
            <Route path="/ncs" element={<NCList />} />
            <Route path="/ncs/new" element={<NCForm />} />
            <Route path="/ncs/:id" element={<NCDetail />} />
            <Route path="/ncs/:id/edit" element={<NCForm />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
