import { promises as fs } from 'fs';
import path from 'path';

// Fungsi load JSON di Vercel
const loadJSON = async (file) => {
  const filePath = path.join(process.cwd(), 'data', file);
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
};

// Fungsi parse NIK
const parseNIK = async (nik) => {
  if (!/^\d{16}$/.test(nik)) return { status: 'error', pesan: 'Format NIK tidak valid!' };

  // Ekstrak data dari NIK
  const kodeProv = nik.slice(0, 2);
  const kodeKab = nik.slice(0, 4);
  const kodeKec = nik.slice(0, 6);
  const birthDay = parseInt(nik.slice(6, 8));
  const birthMonth = nik.slice(8, 10);
  const birthYear = (parseInt(nik[10]) < 4 ? '19' : '20') + nik.slice(10, 12);
  const gender = birthDay > 40 ? 'PEREMPUAN' : 'LAKI-LAKI';
  const cleanDay = birthDay > 40 ? birthDay - 40 : birthDay;
  const uniqueCode = nik.slice(12, 16);
  const birthDate = `${cleanDay.toString().padStart(2, '0')}/${birthMonth}/${birthYear}`;

  // Load wilayah dari JSON
  const [provinces, regencies, districts] = await Promise.all([
    loadJSON('provinces.json'),
    loadJSON('regencies.json'),
    loadJSON('districts.json')
  ]);

  // Cari nama wilayah
  const provinsiNama = provinces.find(p => p.id === kodeProv)?.name || 'Tidak Diketahui';
  const kotakabNama = regencies.find(r => r.id === kodeKab)?.name || 'Tidak Diketahui';
  const kecamatanNama = districts.find(d => d["1101010"] === kodeKec) 
    ? Object.values(districts.find(d => d["1101010"] === kodeKec))[2]
    : 'Tidak Diketahui';

  // Hitung usia
  const age = new Date().getFullYear() - parseInt(birthYear);

  // Kalkulasi zodiak
  const zodiacSigns = [
    ['Capricorn', 19], ['Aquarius', 18], ['Pisces', 20], ['Aries', 19], ['Taurus', 20],
    ['Gemini', 20], ['Cancer', 22], ['Leo', 22], ['Virgo', 22], ['Libra', 22],
    ['Scorpio', 21], ['Sagittarius', 21], ['Capricorn', 31]
  ];
  const zodiac = zodiacSigns[birthMonth - 1][1] >= cleanDay
    ? zodiacSigns[birthMonth - 1][0]
    : zodiacSigns[birthMonth][0];

  // Hasil JSON
  return {
    status: 'success',
    pesan: 'NIK valid',
    author: 'RadzOffc',
    data: {
      nik,
      kelamin: gender,
      lahir: birthDate,
      provinsi: provinsiNama,
      kotakab: kotakabNama,
      kecamatan: kecamatanNama,
      uniquecode: uniqueCode,
      tambahan: {
        usia: `${age} Tahun`,
        zodiak: zodiac
      }
    }
  };
};

// API Handler Vercel
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const { nik } = req.query;
  if (!nik) return res.status(400).json({ error: 'NIK dibutuhkan' });

  try {
    const result = await parseNIK(nik);
    res.status(200).json(result);
  } catch (err) {
    console.error('Error parsing NIK:', err);
    res.status(500).json({ status: 'error', pesan: 'Terjadi kesalahan internal' });
  }
}
