import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from './firebase.config.js';
import { doc, updateDoc } from 'firebase/firestore';

function EditLyrics({ songs }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const song = songs.find(song => song.id === id);
  const [lyrics, setLyrics] = useState(song ? song.lyrics : '');
  const [authors, setAuthors] = useState(song ? song.authors : '');

  const updateLyrics = async () => {
    const songDoc = doc(db, 'songs', id);
    try {
      await updateDoc(songDoc, { lyrics, authors });
      song.lyrics = lyrics;
      song.authors = authors;
      navigate('/');
    } catch (error) {
      console.error("Error updating lyrics: ", error);
    }
  };

  if (!song) return <p>Carregando...</p>;

  return (
    <div>
      <h2>{song.title}</h2>
      <input
        type="text"
        value={authors}
        onChange={(e) => setAuthors(e.target.value)}
        placeholder="Autoria"
        style={{
          width: '96.5%',
        }}
      />
      <textarea
        value={lyrics}
        onChange={(e) => setLyrics(e.target.value)}
        placeholder="Letra"
        style={{
          minHeight: 400,
        }}
      />
      <div>
        <button onClick={updateLyrics}>Salvar</button>
        <button onClick={() => navigate('/')} className='red-button'>Cancelar</button>
      </div>
    </div>
  );
}

export default EditLyrics;