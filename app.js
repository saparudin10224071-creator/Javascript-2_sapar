
// =============================================================
// LAB 2 - app.js
// DOM + EVENT + ASYNC/AWAIT
// =============================================================

// ---------- Pilih elemen ----------
const tbody = document.querySelector('#tabel-body');
const form = document.querySelector('#form-mahasiswa');
const inputCari = document.querySelector('#cari');
const pesan = document.querySelector('#pesan');

let semuaData = [];

// =============================================================
// LANGKAH 3a: AMBIL DATA DARI API
// =============================================================

async function muatData() {
  try {
    const daftar = await ambilMahasiswa();

    semuaData = buatRekap(daftar);

    tampilkan();

  } catch (err) {
    tampilkanPesan(`Gagal memuat data: ${err.message}`, 'error');
  }
}

// =============================================================
// MENAMPILKAN DATA
// =============================================================

function tampilkan() {
  const hasilCari = cariMahasiswa(semuaData, inputCari.value);

  renderTabel(hasilCari);
  renderStatistik(semuaData);
}

// =============================================================
// LANGKAH 3b: TAMPILKAN DATA KE TABEL
// =============================================================

function renderTabel(data) {
  tbody.replaceChildren();

  if (data.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');

    td.colSpan = 8;
    td.textContent = 'Tidak ada data';

    tr.append(td);
    tbody.append(tr);

    return;
  }

  for (const m of data) {
    const tr = document.createElement('tr');

    if (m.lulus) {
      tr.classList.add('lulus');
    } else {
      tr.classList.add('tidak-lulus');
    }

    const nilai = [
      m.nim,
      m.nama,
      m.tugas,
      m.uts,
      m.uas,
      m.nilaiAkhir,
      m.grade
    ];

    for (const isi of nilai) {
      const td = document.createElement('td');

      td.textContent = isi;

      tr.append(td);
    }

    // Tombol hapus
    const tdHapus = document.createElement('td');
    const tombol = document.createElement('button');

    tombol.classList.add('btn-hapus');
    tombol.dataset.nim = m.nim;
    tombol.textContent = 'Hapus';

    tdHapus.append(tombol);
    tr.append(tdHapus);

    tbody.append(tr);
  }
}

// =============================================================
// LANGKAH 4: STATISTIK
// =============================================================

function renderStatistik(data) {

  // Jumlah mahasiswa
  document.querySelector('#stat-jumlah').textContent = data.length;

  // Jumlah mahasiswa lulus
  const jumlahLulus = data.filter(m => m.lulus).length;

  document.querySelector('#stat-lulus').textContent =
    `${jumlahLulus}/${data.length}`;

  // Rata-rata nilai
  document.querySelector('#stat-rata').textContent =
    hitungRataRata(data);

  // Nilai tertinggi
  const tertinggi = cariTertinggi(data);

  document.querySelector('#stat-tertinggi').textContent =
    tertinggi
      ? `${tertinggi.nama} (${tertinggi.nilaiAkhir})`
      : '-';

  // Distribusi grade
  const distribusi = hitungDistribusiGrade(data);

  const teksGrade = Object.entries(distribusi)
    .map(([g, n]) => `${g}: ${n}`)
    .join(' · ');

  document.querySelector('#stat-distribusi').textContent =
    teksGrade;
}

// =============================================================
// PESAN
// =============================================================

function tampilkanPesan(teks, jenis) {
  pesan.textContent = teks;
  pesan.className = jenis;
}

// =============================================================
// LANGKAH 5: PENCARIAN
// =============================================================

inputCari.addEventListener('input', () => {
  tampilkan();
});

// =============================================================
// LANGKAH 6: TAMBAH MAHASISWA
// =============================================================

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const f = new FormData(form);

  const baru = {
    nim: f.get('nim').trim(),
    nama: f.get('nama').trim(),
    tugas: f.get('tugas') === '' ? NaN : Number(f.get('tugas')),
    uts: f.get('uts') === '' ? NaN : Number(f.get('uts')),
    uas: f.get('uas') === '' ? NaN : Number(f.get('uas'))
  };

  // Validasi data
  const errors = validasiMahasiswa(baru);

  if (errors.length > 0) {
    tampilkanPesan(errors.join(', '), 'error');
    return;
  }

  try {
    // Simpan data melalui API
    const hasil = await tambahMahasiswa(baru);

    // Hitung nilai mahasiswa baru
    const [r] = buatRekap([hasil]);

    // Tampilkan pesan sukses
    tampilkanPesan(
      `${r.nama} tersimpan: nilai ${r.nilaiAkhir} (${r.grade})`,
      'sukses'
    );

    // Kosongkan form
    form.reset();

    // Muat ulang data
    await muatData();

  } catch (err) {
    tampilkanPesan(
      `Gagal menyimpan: ${err.message}`,
      'error'
    );
  }
});

// =============================================================
// LANGKAH 7: HAPUS MAHASISWA
// =============================================================

tbody.addEventListener('click', async (event) => {

  const tombol = event.target.closest('.btn-hapus');

  if (!tombol) return;

  const nim = tombol.dataset.nim;

  if (!confirm(`Yakin ingin menghapus mahasiswa dengan NIM ${nim}?`)) {
    return;
  }

  try {
    const teks = await hapusMahasiswa(nim);

    tampilkanPesan(teks, 'sukses');

    await muatData();

  } catch (err) {
    tampilkanPesan(
      `Gagal menghapus: ${err.message}`,
      'error'
    );
  }
});

// =============================================================
// MULAI PROGRAM
// =============================================================

muatData();
