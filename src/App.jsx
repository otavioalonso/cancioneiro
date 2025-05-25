import React from 'react';
import { Routes, Route } from 'react-router-dom';

import SongCatalog from './SongCatalog';
import EditLyrics from './EditLyrics';
import EditChords from './EditChords';

import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<SongCatalog />} />
        <Route path="/edit-lyrics/:id" element={<EditLyrics />} />
        <Route path="/edit-chords/:id" element={<EditChords />} />
      </Routes>
    </div>
  );
}

export default App;