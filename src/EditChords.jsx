import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from './firebase.config.js';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

function EditChords() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [song, setSong] = useState(null);
  const [chords, setChords] = useState('');

  useEffect(() => {
    const fetchSong = async () => {
      if (id) {
        const songDocRef = doc(db, 'songs', id);
        try {
          const songSnap = await getDoc(songDocRef);
          if (songSnap.exists()) {
            const songData = songSnap.data();
            setSong({ id: songSnap.id, ...songData });
            setChords(songData.chords || songData.lyrics || '');
          } else {
            console.log("No such document!");
            navigate('/');
          }
        } catch (error) {
          console.error("Error fetching song:", error);
          navigate('/');
        }
      }
    };
    fetchSong();
  }, [id, navigate]);

  const updateChords = async () => {
    if (!song) return;
    const songDoc = doc(db, 'songs', song.id);
    try {
      await updateDoc(songDoc, { chords });
      // Optimistic update or refetch can be done here if needed
      // For simplicity, we'll navigate away, assuming data consistency or refetch on the target page.
      navigate('/');
    } catch (error) {
      console.error("Error updating chords: ", error);
    }
  };

  if (!song) return <p>Carregando...</p>;

  return (
    <div>
      <h2>Editar cifra</h2>
      <h3>{song.title}<br/>
      <i>{song.authors}</i></h3>
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