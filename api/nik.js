// api/nik.js

// Hitung umur dari tanggal lahir
export function getAge(birthdate) {
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// Tentukan zodiak dari tanggal lahir
export function getZodiac(birthdate) {
  const [year, month, day] = birthdate.split('-').map(Number);
  const zodiacSigns = [
    'Capricorn', 'Aquarius', 'Pisces', 'Aries', 'Taurus', 'Gemini',
    'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius',
  ];
  const zodiacDates = [19, 18, 20, 19, 20, 20, 22, 22, 22, 22, 21, 21];
  return day > zodiacDates[month - 1] ? zodiacSigns[month] : zodiacSigns[month - 1];
}
