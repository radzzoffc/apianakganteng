// pages/api/parse.js
import axios from 'axios';
import { getZodiac, getAge } from '../../api/nik';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { nik } = req.body;
  if (!nik || nik.length !== 16) {
    return res.status(400).json({ error: 'NIK tidak valid!' });
  }

  try {
    // Ambil data dari Emsifa API
    const { data } = await axios.get(`https://api-nik.vercel.app/v1/nik/${nik}`);

    // Hitung Umur & Zodiak
    const age = getAge(data.tanggal_lahir);
    const zodiac = getZodiac(data.tanggal_lahir);

    return res.status(200).json({
      nik,
      ...data,
      age,
      zodiac,
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Gagal memproses NIK!' });
  }
}
