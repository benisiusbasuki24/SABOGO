/**
 * Konversi angka ke kalimat terbilang Bahasa Indonesia
 * Contoh: 350000 -> "Tiga ratus lima puluh ribu rupiah"
 */
export function terbilang(n: number): string {
  const units = [
    '',
    'satu',
    'dua',
    'tiga',
    'empat',
    'lima',
    'enam',
    'tujuh',
    'delapan',
    'sembilan',
    'sepuluh',
    'sebelas',
  ];

  function convert(num: number): string {
    if (num < 12) {
      return units[num];
    } else if (num < 20) {
      return convert(num - 10) + ' belas';
    } else if (num < 100) {
      return convert(Math.floor(num / 10)) + ' puluh ' + convert(num % 10);
    } else if (num < 200) {
      return 'seratus ' + convert(num - 100);
    } else if (num < 1000) {
      return convert(Math.floor(num / 100)) + ' ratus ' + convert(num % 100);
    } else if (num < 2000) {
      return 'seribu ' + convert(num - 1000);
    } else if (num < 1000000) {
      return convert(Math.floor(num / 1000)) + ' ribu ' + convert(num % 1000);
    } else if (num < 1000000000) {
      return (
        convert(Math.floor(num / 1000000)) +
        ' juta ' +
        convert(num % 1000000)
      );
    } else if (num < 1000000000000) {
      return (
        convert(Math.floor(num / 1000000000)) +
        ' milyar ' +
        convert(num % 1000000000)
      );
    } else {
      return (
        convert(Math.floor(num / 1000000000000)) +
        ' triliun ' +
        convert(num % 1000000000000)
      );
    }
  }

  if (n === 0) return 'Nol rupiah';
  const clean = convert(Math.floor(Math.abs(n)))
    .replace(/\s+/g, ' ')
    .trim();
  const capitalized = clean.charAt(0).toUpperCase() + clean.slice(1);
  return `${capitalized} rupiah`;
}
