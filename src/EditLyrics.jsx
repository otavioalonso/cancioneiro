import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from './firebase.config.js';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

function EditLyrics() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [song, setSong] = useState(null);
  const [lyrics, setLyrics] = useState('');
  const [authors, setAuthors] = useState('');

  useEffect(() => {
    const fetchSong = async () => {
      if (id) {
        const songDocRef = doc(db, 'songs', id);
        try {
          const songSnap = await getDoc(songDocRef);
          if (songSnap.exists()) {
            const songData = songSnap.data();
            setSong({ id: songSnap.id, ...songData });
            setLyrics(songData.lyrics || '');
            setAuthors(songData.authors || '');
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

  const updateLyrics = async () => {
    if (!song) return;
    const songDoc = doc(db, 'songs', id);
    try {
      await updateDoc(songDoc, { lyrics, authors });
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