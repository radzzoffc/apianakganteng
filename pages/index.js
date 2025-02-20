import { useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [nik, setNik] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post('/api/parse', { nik });
      setResult(data);
    } catch (error) {
      alert('Gagal memproses NIK!');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>NIK Parser & Umur/Zodiak</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Masukkan NIK"
          value={nik}
          onChange={(e) => setNik(e.target.value)}
          required
          maxLength={16}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Memproses...' : 'Cek NIK'}
        </button>
      </form>
      {result && (
        <div>
          <h2>Hasil Parsing:</h2>
          <p><b>NIK:</b> {result.nik}</p>
          <p><b>Nama:</b> {result.nama}</p>
          <p><b>Umur:</b> {result.age} tahun</p>
          <p><b>Zodiak:</b> {result.zodiac}</p>
          <p><b>Kabupaten:</b> {result.kabupaten}</p>
        </div>
      )}
    </div>
  );
            }
