const express = require('express');
const axios = require('axios');
const csv = require('csvtojson');
const dayjs = require('dayjs');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// URL sumber data wilayah dari GitHub
const DATA_URLS = {
  provinces: 'https://raw.githubusercontent.com/emsifa/api-wilayah-indonesia/refs/heads/master/data/provinces.csv',
  regencies: 'https://raw.githubusercontent.com/emsifa/api-wilayah-indonesia/refs/heads/master/data/regencies.csv',
  districts: 'https://raw.githubusercontent.com/emsifa/api-wilayah-indonesia/refs/heads/master/data/districts.csv',
};

// Fungsi untuk mengambil dan mengonversi CSV dari URL
const fetchData = async (url) => {
  try {
    const response = await axios.get(url);
    return await csv().fromString(response.data);
  } catch (error) {
    console.error(`Gagal mengambil data dari: ${url}`, error.message);
    return [];
  }
};

// Fungsi bantu untuk mencari nama berdasarkan ID
const findNameById = (data, id) => {
  const result = data.find((item) => item.id === id);
  return result ? result.name : 'Tidak Diketahui';
};

// Fungsi untuk menghitung usia dan zodiak
const calculateAgeAndZodiac = (birthdate) => {
  const today = dayjs();
  const birth = dayjs(birthdate);
  const age = today.diff(birth, 'year');

  const zodiacSigns = [
    { sign: 'Capricorn', start: '12-22', end: '01-19' },
    { sign: 'Aquarius', start: '01-20', end: '02-18' },
    { sign: 'Pisces', start: '02-19', end: '03-20' },
    { sign: 'Aries', start: '03-21', end: '04-19' },
    { sign: 'Taurus', start: '04-20', end: '05-20' },
    { sign: 'Gemini', start: '05-21', end: '06-20' },
    { sign: 'Cancer', start: '06-21', end: '07-22' },
    { sign: 'Leo', start: '07-23', end: '08-22' },
    { sign: 'Virgo', start: '08-23', end: '09-22' },
    { sign: 'Libra', start: '09-23', end: '10-22' },
    { sign: 'Scorpio', start: '10-23', end: '11-21' },
    { sign: 'Sagittarius', start: '11-22', end: '12-21' },
  ];

  const birthMonthDay = birth.format('MM-DD');
  const zodiac = zodiacSigns.find(
    (z) =>
      (birthMonthDay >= z.start && birthMonthDay <= '12-31') ||
      (birthMonthDay >= '01-01' && birthMonthDay <= z.end)
  )?.sign || 'Tidak Diketahui';

  return { age, zodiac };
};

// Endpoint GET: Parsing NIK dari Query Parameter
app.get('/api/parse-nik', async (req, res) => {
  const { nik } = req.query;

  // Validasi NIK harus 16 digit
  if (!/^\d{16}$/.test(nik)) {
    return res.status(400).json({
      status: 'error',
      pesan: 'NIK harus terdiri dari 16 digit angka.',
    });
  }

  // Ambil data wilayah dari URL
  const [provinces, regencies, districts] = await Promise.all([
    fetchData(DATA_URLS.provinces),
    fetchData(DATA_URLS.regencies),
    fetchData(DATA_URLS.districts),
  ]);

  // Parsing NIK menjadi bagian-bagian
  const provinceId = nik.slice(0, 2);
  const regencyId = nik.slice(0, 4);
  const districtId = nik.slice(0, 6);
  const birthCode = nik.slice(6, 12);
  const uniqueCode = nik.slice(12, 16);

  const gender = parseInt(birthCode.slice(0, 2)) > 40 ? 'PEREMPUAN' : 'LAKI-LAKI';
  const birthDate = `${birthCode.slice(0, 2) > 40 ? birthCode.slice(0, 2) - 40 : birthCode.slice(0, 2)}/${birthCode.slice(2, 4)}/19${birthCode.slice(4)}`;

  const { age, zodiac } = calculateAgeAndZodiac(birthDate);

  // Respon JSON
  res.json({
    status: 'success',
    pesan: 'NIK valid',
    data: {
      nik,
      kelamin: gender,
      lahir: birthDate,
      provinsi: findNameById(provinces, provinceId),
      kotakab: findNameById(regencies, regencyId),
      kecamatan: findNameById(districts, districtId),
      uniqcode: uniqueCode,
      tambahan: {
        usia: `${age} Tahun`,
        zodiak: zodiac,
      },
    },
  });
});

// Jalankan server
app.listen(port, () => {
  console.log(`✅ Server berjalan di http://localhost:${port}`);
});
