import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { db } from './firebase.config.js';
import { collection, addDoc, deleteDoc, getDocs, doc, updateDoc } from 'firebase/firestore';
import './App.css'; // Import the CSS file
import EditLyrics from './EditLyrics';
import EditChords from './EditChords';

function App() {
  const [songs, setSongs] = useState([]);
  const [songTitle, setSongTitle] = useState('');
  
  const [editId, setEditId] = useState(null);
  const [editSongTitle, setEditSongTitle] = useState('');

  const navigate = useNavigate();

  const songsCollectionRef = collection(db, 'songs');

  const addSong = async () => {
    try {
      if (!songTitle.trim()) return; // Prevent adding empty titles
      await addDoc(songsCollectionRef, {
        title: songTitle,
        lyrics: '',
        chords: '',
      });
      fetchSongs();
      setSongTitle('');
    } catch (error) {
      console.error("Error adding song: ", error);
    }
  };

  const removeSong = async (id) => {
    const songDoc = doc(db, 'songs', id);
    try {
      await deleteDoc(songDoc);
      fetchSongs();
    } catch (error) {
      console.error("Error removing song: ", error);
    }
  };

  const fetchSongs = async () => {
    const data = await getDocs(songsCollectionRef);
    setSongs(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  const updateSongTitle = async (id) => {
    const songDoc = doc(db, 'songs', id);
    try {
      await updateDoc(songDoc, { title: editSongTitle });
      fetchSongs();
      setEditId(null);
    } catch (error) {
      console.error("Error updating song title: ", error);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  return (
    <div className="App">
      <Routes>
        <Route
          path="/"
          element={
            <>
              <h1>Músicas</h1>
              <div className="add-song">
                <input
                  type="text"
                  value={songTitle}
                  placeholder="Título"
                  onChange={(e) => setSongTitle(e.target.value)}
                />
                <button onClick={addSong} style={{
                  borderRadius: '50%',
                  width: 40,
                  height: 40,
                  padding: 0,
                  marginLeft: 0,
                  fontSize: 20,
                }}>+</button>
              </div>
              <ul>
                {songs.map((song) => (
                  <li key={song.id}>
                    {editId === song.id ? (
                      <>
                        <input
                          type="text"
                          value={editSongTitle}
                          onChange={(e) => setEditSongTitle(e.target.value)}
                        />
                        <button onClick={() => updateSongTitle(song.id)}>Salvar</button>
                        <button onClick={() => setEditId(null)} className='red-button'>Cancelar</button>
                      </>
                    ) : (
                      <>
                        <span>{song.title}</span>
                        <button
                          onClick={() => {
                            setEditId(song.id);
                            setEditSongTitle(song.title);
                          }}
                        >💬</button>

                        <button onClick={() => navigate(`/edit-lyrics/${song.id}`)}>📝</button>
                        <button onClick={() => navigate(`/edit-chords/${song.id}`)}>🎹</button>

                        <button onClick={() => removeSong(song.id)} style={{
                          // borderRadius: '50%',
                          width: 40,
                          height: 40,
                          padding: 0,
                          fontSize: 20,
                        }} className='red-button'>×</button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </>
          }
        />
        <Route path="/edit-lyrics/:id" element={<EditLyrics songs={songs} />} />
        <Route path="/edit-chords/:id" element={<EditChords songs={songs} />} />
      </Routes>
    </div>
  );
}

export default App;