const fs = require('fs');

const pages = JSON.parse(fs.readFileSync('parsed_pages.json'));

let allStudents = [];

for (let pageIdx = 0; pageIdx < pages.length; pageIdx++) {
  const page = pages[pageIdx];
  
  // Find all row markers (where x around 37.2 and text is a number)
  const noMarkers = page.filter(it => Math.abs(it.x - 37.2) < 5 && /^\d+$/.test(it.text.trim()) && it.y < 540);
  noMarkers.sort((a, b) => b.y - a.y); // top to bottom

  for (let i = 0; i < noMarkers.length; i++) {
    const currentNo = noMarkers[i];
    const topY = i === 0 ? Math.min(545, currentNo.y + 35) : (noMarkers[i - 1].y + currentNo.y) / 2;
    const bottomY = i === noMarkers.length - 1 ? 20 : (currentNo.y + noMarkers[i + 1].y) / 2;

    const rowItems = page.filter(it => it.y <= topY && it.y > bottomY);

    // ID Pelanggan (x ~ 56.2)
    const idItem = rowItems.find(it => Math.abs(it.x - 56.2) < 10 && /^\d+$/.test(it.text.trim()));

    // Nama (x ~ 106.5)
    const nameItems = rowItems
      .filter(it => Math.abs(it.x - 106.5) < 15)
      .sort((a, b) => b.y - a.y);
    const name = nameItems.map(it => it.text.trim()).join(' ');

    // BRIVA (x ~ 183.4)
    const brivaItems = rowItems
      .filter(it => Math.abs(it.x - 183.4) < 15)
      .sort((a, b) => b.y - a.y);
    
    let brivaSpp = '';
    let brivaKegiatan = '';
    let brivaEkskul = '';

    for (let k = 0; k < brivaItems.length; k++) {
      const txt = brivaItems[k].text;
      const nextTxt = k + 1 < brivaItems.length ? brivaItems[k + 1].text : '';
      
      const cleanNum = (s) => (s || '').replace(/[^0-9]/g, '');

      if (txt.includes('5733-SPP') || txt.includes('SPP TETAP') || txt.includes('SPP')) {
        brivaSpp = cleanNum(nextTxt);
      } else if (txt.includes('5747-UANG') || txt.includes('KEGIATAN')) {
        brivaKegiatan = cleanNum(nextTxt);
      } else if (txt.includes('14172-EKSKUL') || txt.includes('EKSKUL')) {
        brivaEkskul = cleanNum(nextTxt);
      }
    }

    // Email (x ~ 315.6)
    const emailItem = rowItems.find(it => Math.abs(it.x - 315.6) < 30 && it.text.includes('@'));
    const email = emailItem ? emailItem.text.trim() : '';

    // No Hp (x ~ 472.4)
    const phoneItem = rowItems.find(it => Math.abs(it.x - 472.4) < 25 && /^[0-9+]+$/.test(it.text.replace(/[-\s]/g, '')));
    const phone = phoneItem ? phoneItem.text.trim() : '';

    // Alamat (x ~ 534.4)
    const addrItems = rowItems
      .filter(it => Math.abs(it.x - 534.4) < 30)
      .sort((a, b) => b.y - a.y);
    const address = addrItems.map(it => it.text.trim()).join(' ');

    // Status (x ~ 676.0)
    const statusItem = rowItems.find(it => Math.abs(it.x - 676.0) < 15);
    const status = statusItem ? statusItem.text.trim() : 'Aktif';

    // Registration (x ~ 760.1)
    const regItem = rowItems.find(it => Math.abs(it.x - 760.1) < 20);
    const registrationNo = regItem ? regItem.text.trim() : '';

    allStudents.push({
      no: parseInt(currentNo.text.trim(), 10),
      customerId: idItem ? idItem.text.trim() : '',
      name,
      brivaSpp,
      brivaKegiatan,
      brivaEkskul,
      email,
      phone,
      address,
      status,
      registrationNo
    });
  }
}

console.log('Total students extracted:', allStudents.length);
fs.writeFileSync('extracted_students.json', JSON.stringify(allStudents, null, 2));
