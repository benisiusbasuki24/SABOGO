const fs = require('fs');

const list = JSON.parse(fs.readFileSync('extracted_students.json'));

const classDistribution = (no) => {
  if (no <= 42) return '4.1';
  if (no <= 85) return '4.2';
  if (no <= 128) return '5.1';
  if (no <= 170) return '6.1';
  return '6.2';
};

const activityFeeMap = {
  '1.1': 1000000,
  '1.2': 1000000,
  '2.1': 1100000,
  '2.2': 1100000,
  '3.1': 1200000,
  '3.2': 1200000,
  '4.1': 1300000,
  '4.2': 1300000,
  '5.1': 1400000,
  '5.2': 1400000,
  '6.1': 1500000,
  '6.2': 1500000,
};

const sppAmounts = [300000, 325000, 350000, 375000, 400000, 425000, 450000];

const femaleKeywords = ['putri', 'tiara', 'stella', 'elyssa', 'cairistiona', 'maria', 'theresia', 'angela', 'grace', 'christina', 'aurelia', 'vania', 'chloe', 'nadia', 'regina', 'bernadetta', 'clarissa', 'syeril', 'audrey', 'evelyn', 'keisha', 'michelle'];

const students = list.map((item, index) => {
  const grade = classDistribution(item.no);
  const spp = sppAmounts[index % sppAmounts.length];
  const actFee = activityFeeMap[grade] || 1300000;
  
  const nis = item.registrationNo && item.registrationNo.length >= 6 
    ? item.registrationNo 
    : (2023000 + item.no).toString();

  const isFemale = femaleKeywords.some(k => item.name.toLowerCase().includes(k));

  return {
    id: 'std-bri-' + item.customerId,
    nis: nis,
    nisn: '00' + (index + 1).toString().padStart(6, '0') + item.customerId.slice(-2),
    name: item.name,
    grade: grade,
    gender: isFemale ? 'P' : 'L',
    parentName: 'Orang Tua ' + item.name.split(' ')[0],
    parentPhone: item.phone || '081234567890',
    parentEmail: item.email || (item.name.toLowerCase().replace(/[^a-z]/g, '') + '@gmail.com'),
    address: item.address || 'Yogyakarta',
    vaNumber: item.brivaSpp || ('108102247000' + item.no.toString().padStart(3, '0')),
    brivaSpp: item.brivaSpp || '',
    brivaKegiatan: item.brivaKegiatan || '',
    brivaEkskul: item.brivaEkskul || '',
    customerIdBri: item.customerId,
    status: 'AKTIF',
    extracurriculars: item.brivaEkskul ? ['PADUS'] : [],
    extracurricularFee: item.brivaEkskul ? 200000 : 0, // Rp 200.000 / semester untuk 1 ekskul
    customSppAmount: spp,
    customActivityFee: actFee,
    createdAt: '2026-07-15T08:00:00.000Z',
  };
});

console.log('Processed students count:', students.length);
console.log('Sample student 0:', JSON.stringify(students[0], null, 2));

const tsCode = `import { Student } from '../types';

export const PDF_EXTRACTED_STUDENTS: Student[] = ${JSON.stringify(students, null, 2)};
`;

fs.writeFileSync('src/data/seedStudentsPdf.ts', tsCode);
console.log('Successfully wrote src/data/seedStudentsPdf.ts');
