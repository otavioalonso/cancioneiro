import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from './firebase.config.js';
import { doc, updateDoc } from 'firebase/firestore';

function EditChords({ songs }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const song = songs.find(song => song.id === id);
  const [chords, setChords] = useState(song ? (song.chords ? song.chords : song.lyrics) : '');

  const updateChords = async () => {
    const songDoc = doc(db, 'songs', id);
    try {
      await updateDoc(songDoc, { chords });
      song.chords = chords;
      navigate('/');
    } catch (error) {
      console.error("Error updating chords: ", error);
    }
  };

  if (!song) return <p>Carregando...</p>;

  return (
    <div>
      <h2>{song.title}</h2>
      <textarea
        value={chords}
        onChange={(e) => setChords(e.target.value)}
        placeholder="Cifra"
        style={{
          minHeight: 400,
        }}
      />
      <div>
        <button onClick={updateChords}>Salvar</button>
        <button onClick={() => navigate('/')} className='red-button'>Cancelar</button>
      </div>
    </div>
  );
}

export default EditChords;