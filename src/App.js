import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import EntryPage from './pages/EntryPage';
import ExitPage from './pages/ExitPage';
import ViewPage from './pages/ViewPage';
import EditBatchPage from './pages/EditBatchPage'; // Add this import
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/entry" element={<EntryPage />} />
          <Route path="/exit" element={<ExitPage />} />
          <Route path="/view" element={<ViewPage />} />
          <Route path="/edit/:id" element={<EditBatchPage />} /> {/* Add this route */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;

