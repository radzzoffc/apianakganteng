// api/parse.js
const fs = require("fs");
const path = require("path");

// Load data wilayah dari JSON
const provinces = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/provinces.json")));
const regencies = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/regencies.json")));
const districts = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/districts.json")));

// Fungsi utama untuk parsing NIK
const parseNIK = (nik) => {
  if (!/^\d{16}$/.test(nik)) return { error: "Format NIK tidak valid" };

  // Ambil bagian dari NIK
  const kodeProvinsi = nik.slice(0, 2);
  const kodeKota = nik.slice(0, 4);
  const kodeKecamatan = nik.slice(0, 6);
  const tanggal = nik.slice(6, 8);
  const bulan = nik.slice(8, 10);
  const tahun = nik.slice(10, 12);
  const uniqCode = nik.slice(12, 16);

  // Cek jenis kelamin dan sesuaikan tanggal lahir
  let gender = "LAKI-LAKI";
  let tanggalLahir = parseInt(tanggal, 10);
  if (tanggalLahir > 40) {
    gender = "PEREMPUAN";
    tanggalLahir -= 40;
  }

  // Format tahun lahir
  const currentYear = new Date().getFullYear();
  const tahunLahir = (parseInt(tahun, 10) > currentYear % 100) ? `19${tahun}` : `20${tahun}`;

  // Cari data wilayah
  const provinsi = provinces.find((p) => p.id === kodeProvinsi)?.name || "Tidak Diketahui";
  const kota = regencies.find((r) => r.id === kodeKota)?.name || "Tidak Diketahui";
  const kecamatan = districts.find((d) => d.id === kodeKecamatan)?.name || "Tidak Diketahui";

  // Hitung umur
  const birthDate = new Date(`${tahunLahir}-${bulan}-${tanggalLahir}`);
  const age = new Date().getFullYear() - birthDate.getFullYear();

  // Hitung zodiak
  const zodiac = getZodiac(tanggalLahir, parseInt(bulan, 10));

  return {
    status: "success",
    pesan: "NIK valid",
    author: "RadzzOffc",
    data: {
      nik,
      kelamin: gender,
      lahir: `${tanggalLahir}/${bulan}/${tahunLahir}`,
      provinsi,
      kotakab: kota,
      kecamatan,
      uniqcode: uniqCode,
      tambahan: {
        usia: `${age} Tahun`,
        zodiak: zodiac
      }
    }
  };
};

// Fungsi cek zodiak berdasarkan tanggal lahir
const getZodiac = (day, month) => {
  const zodiacs = [
    ["Capricorn", 19], ["Aquarius", 18], ["Pisces", 20],
    ["Aries", 19], ["Taurus", 20], ["Gemini", 20],
    ["Cancer", 22], ["Leo", 22], ["Virgo", 22],
    ["Libra", 22], ["Scorpio", 21], ["Sagittarius", 21], ["Capricorn", 31]
  ];
  return day > zodiacs[month - 1][1] ? zodiacs[month][0] : zodiacs[month - 1][0];
};

// Handler Vercel API
export default function handler(req, res) {
  const { nik } = req.query;

  if (!nik) {
    return res.status(400).json({ error: "Parameter NIK dibutuhkan" });
  }

  const result = parseNIK(nik);
  return res.status(200).json(result);
}
