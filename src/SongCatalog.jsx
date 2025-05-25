import React, { useState, useEffect, useMemo } from 'react'; // Added useMemo
import { useNavigate } from 'react-router-dom';
import { db } from './firebase.config.js';
import { collection, addDoc, deleteDoc, getDocs, doc, updateDoc, setDoc } from 'firebase/firestore'; // Added setDoc

import './SongCatalog.css';

function SongCatalog() {
  const [noLyricsNoChordsSongs, setNoLyricsNoChordsSongs] = useState([]);
  const [lyricsNoChordsSongs, setLyricsNoChordsSongs] = useState([]);
  const [completeSongs, setCompleteSongs] = useState([]);
  const [songTitle, setSongTitle] = useState('');
  
  // State for songs deleted from DB that can be undone in the current session
  const [songsAwaitingUndo, setSongsAwaitingUndo] = useState([]); 

  const [editId, setEditId] = useState(null);
  const [editSongTitle, setEditSongTitle] = useState('');

  const navigate = useNavigate();
  const songsCollectionRef = collection(db, 'songs');

  const addSong = async () => {
    try {
      if (!songTitle.trim()) return;
      await addDoc(songsCollectionRef, {
        title: songTitle,
        lyrics: '',
        chords: '',
      });
      fetchSongs(); // Fetch songs to include the new one
      setSongTitle('');
      // setSongsAwaitingUndo([]); // Clear any pending undos if a new song is added
    } catch (error) {
      console.error("Error adding song: ", error);
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
  
  useEffect(() => {
    fetchSongs();
  }, []);

  // Handles immediate deletion from Firestore and adds to list for potential undo
  const handleDeleteSong = async (songToDelete, categoryKey) => {
    if (!songToDelete || !songToDelete.id) {
      console.error("Invalid song object passed to handleDeleteSong:", songToDelete);
      return;
    }
    try {
      const songDoc = doc(db, 'songs', songToDelete.id);
      await deleteDoc(songDoc);
      // Add to songsAwaitingUndo, ensuring no duplicates if somehow clicked fast
      setSongsAwaitingUndo(prev => {
        if (prev.find(s => s.id === songToDelete.id)) return prev;
        return [...prev, { ...songToDelete, originalCategoryKey: categoryKey }];
      });
      fetchSongs(); // Refresh the base lists from Firestore
    } catch (error) {
      console.error(`Error deleting song ${songToDelete.id}: `, error);
    }
  };

  // Handles re-adding a specific song to Firestore
  const handleUndoDelete = async (songIdToUndo) => {
    const songToRestore = songsAwaitingUndo.find(s => s.id === songIdToUndo);
    if (!songToRestore) return;

    try {
      const songDocRef = doc(db, 'songs', songToRestore.id);
      const { originalCategoryKey, ...songData } = songToRestore; // Exclude temporary key
      await setDoc(songDocRef, songData); // Re-add with original data and ID
      
      setSongsAwaitingUndo(prev => prev.filter(s => s.id !== songIdToUndo));
      fetchSongs(); // Refresh lists, song will reappear normally
    } catch (error) {
      console.error(`Error undoing delete for song ${songIdToUndo}: `, error);
    }
  };

  const updateSongTitle = async (id) => {
    const songDoc = doc(db, 'songs', id);
    try {
      await updateDoc(songDoc, { title: editSongTitle });
      fetchSongs();
      setEditId(null);
      // setSongsAwaitingUndo([]); // Clear undos if a song is edited
    } catch (error) {
      console.error("Error updating song title: ", error);
    }
  };

  // Helper to generate display lists, incorporating songsAwaitingUndo
  const getDisplayList = (baseList, categoryKey) => {
    let displayList = [...baseList];
    const undoableSongsInThisCategory = songsAwaitingUndo.filter(
      s => s.originalCategoryKey === categoryKey
    );

    undoableSongsInThisCategory.forEach(undoableSong => {
      if (!displayList.find(s => s.id === undoableSong.id)) {
        displayList.push(undoableSong);
      }
    });
    
    return displayList.sort((a, b) => a.title.localeCompare(b.title));
  };

  const sections = useMemo(() => [
    { title: 'Adicionar letra', baseSongs: noLyricsNoChordsSongs, categoryKey: 'noLyricsNoChords' },
    { title: 'Adicionar cifra', baseSongs: lyricsNoChordsSongs, categoryKey: 'lyricsNoChords' },
    { title: 'Completas', baseSongs: completeSongs, categoryKey: 'complete' },
  ], [noLyricsNoChordsSongs, lyricsNoChordsSongs, completeSongs]);


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

      {sections.map(section => {
        const displaySongs = getDisplayList(section.baseSongs, section.categoryKey);
        return (
          <div key={section.title}>
            <h2>{section.title} ({displaySongs.length})</h2>
            {displaySongs.length === 0 ? (
              <p>Nenhuma música nesta seção.</p>
            ) : (
              <ul className="song-list">
                {displaySongs.map((song) => {
                  const isAwaitingUndo = songsAwaitingUndo.some(s => s.id === song.id);
                  return (
                    <li key={song.id}>
                      {editId === song.id && !isAwaitingUndo ? (
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
                          {isAwaitingUndo ? (
                            <button onClick={() => handleUndoDelete(song.id)} className='action-button'>+</button>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditId(song.id);
                                  setEditSongTitle(song.title);
                                }}
                              >Nome</button>
                              <button onClick={() => navigate(`/edit-lyrics/${song.id}`)}>Letra</button>
                              <button onClick={() => navigate(`/edit-chords/${song.id}`)}>Cifra</button>
                              <button onClick={() => handleDeleteSong(song, section.categoryKey)} className='red-button'>×</button>
                            </>
                          )}
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </>
  );
}

export default SongCatalog;
