import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase.config.js';
import { collection, addDoc, deleteDoc, getDocs, doc, updateDoc } from 'firebase/firestore';

import './SongCatalog.css';

function SongCatalog() {
  const [noLyricsNoChordsSongs, setNoLyricsNoChordsSongs] = useState([]);
  const [lyricsNoChordsSongs, setLyricsNoChordsSongs] = useState([]);
  const [completeSongs, setCompleteSongs] = useState([]);
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
    const allSongs = data.docs.map((doc) => ({ ...doc.data(), id: doc.id })).sort((a, b) => a.title.localeCompare(b.title));
    
    const noLyricsNoChords = [];
    const lyricsNoChords = [];
    const complete = [];

    allSongs.forEach(song => {
      const hasLyrics = song.lyrics && song.lyrics.trim() !== '';
      const hasChords = song.chords && song.chords.trim() !== '';

      if (!hasLyrics && !hasChords) {
        noLyricsNoChords.push(song);
      } else if (hasLyrics && !hasChords) {
        lyricsNoChords.push(song);
      } else if (hasLyrics && hasChords) {
        complete.push(song);
      }
    });

    setNoLyricsNoChordsSongs(noLyricsNoChords.sort((a, b) => a.title.localeCompare(b.title)));
    setLyricsNoChordsSongs(lyricsNoChords.sort((a, b) => a.title.localeCompare(b.title)));
    setCompleteSongs(complete.sort((a, b) => a.title.localeCompare(b.title)));
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

      {[
        { title: 'Adicionar letra', songs: noLyricsNoChordsSongs },
        { title: 'Adicionar cifra', songs: lyricsNoChordsSongs },
        { title: 'Completas', songs: completeSongs },
      ].map(section => (
        <div key={section.title}>
          <h2>{section.title} ({section.songs.length})</h2>
          {section.songs.length === 0 ? (
            <p>Nenhuma música nesta seção.</p>
          ) : (
            <ul className="song-list">
              {section.songs.map((song) => (
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
                      >Nome</button>
                      <button onClick={() => navigate(`/edit-lyrics/${song.id}`)}>Letra</button>
                      <button onClick={() => navigate(`/edit-chords/${song.id}`)}>Cifra</button>
                      <button onClick={() => removeSong(song.id)} className='red-button'>×</button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </>
  );
}

export default SongCatalog;
