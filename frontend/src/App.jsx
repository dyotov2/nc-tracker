import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import KanbanBoard from './components/KanbanBoard';
import NCList from './components/NCList';
import NCForm from './components/NCForm';
import NCDetail from './components/NCDetail';
import Analytics from './components/Analytics';
import DarkModeToggle from './components/DarkModeToggle';
import { ToastProvider } from './components/Toast';

function App() {
  return (
    <ToastProvider>
      <Router>
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
          {/* Navigation Bar */}
          <nav className="bg-white dark:bg-gray-800 shadow-lg transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center">
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white">NC Tracker</h1>
                  </div>
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                    <Link
                      to="/"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/board"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      Board
                    </Link>
                    <Link
                      to="/ncs"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      All NCs
                    </Link>
                    <Link
                      to="/ncs/new"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      Create NC
                    </Link>
                    <Link
                      to="/analytics"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      Analytics
                    </Link>
                  </div>
                </div>
                <div className="flex items-center">
                  <DarkModeToggle />
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
              <Route path="/analytics" element={<Analytics />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;
