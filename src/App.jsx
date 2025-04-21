import React, { useState, useEffect } from 'react';
import { db } from './firebase.config.js';
import { collection, addDoc, getDocs } from 'firebase/firestore';

function App() {
  const [songTitle, setSongTitle] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [songs, setSongs] = useState([]);

  const songsCollectionRef = collection(db, 'songs');

  const addSong = async () => {
    try {
      await addDoc(songsCollectionRef, {
        title: songTitle,
        lyrics: lyrics,
      });
      fetchSongs();
      setSongTitle('');
      setLyrics('');
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const fetchSongs = async () => {
    const data = await getDocs(songsCollectionRef);
    setSongs(data.docs.map(doc => ({ ...doc.data(), id: doc.id })));
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  return (
    <div className="App">
      <h1>Songs and Lyrics</h1>
      <input
        type="text"
        value={songTitle}
        placeholder="Song Title"
        onChange={(e) => setSongTitle(e.target.value)}
      />
      <textarea
        value={lyrics}
        placeholder="Lyrics"
        onChange={(e) => setLyrics(e.target.value)}
      />
      <button onClick={addSong}>Add Song</button>

      <h2>List of Songs</h2>
      <ul>
        {songs.map(song => (
          <li key={song.id}>
            <h3>{song.title}</h3>
            <p>{song.lyrics}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;