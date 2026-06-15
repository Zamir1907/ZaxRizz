/* ============================================================
   script.js — ZaxRizz
   ============================================================ */

'use strict';

/* ============================================================
   KONFIGURASI — edit di sini kalau mau ganti teks / link
   ============================================================ */
const CONFIG = {
  nomorWA:       '',                             // isi nomor WA (format: 628xxx)
  pesanWA:       'Aku mau kok jadi pacarmu ><',  // pesan default ke WA
  audioSrc:      '',                             // diisi otomatis dari elemen HTML
};

/* ============================================================
   STATE
   ============================================================ */
let state = {
  faseKlik:   0,   // 0 = belum buka, 1 = sudah buka, 5 = setelah diterima
  indexGif:   0,   // index gif yang sedang tampil
  bisaYa:     true,
  bisaTolak:  true,
};

/* ============================================================
   ELEMEN — ambil sekali, pakai berkali-kali
   ============================================================ */
const $ = (id) => document.getElementById(id);

const el = {
  suratin:         () => $('suratin'),
  ket:             () => $('ket'),
  content:         () => $('Content'),
  tombol:          () => $('Tombol'),
  tombolYa:        () => $('By'),
  tombolTidak:     () => $('Bn'),
  tombolTidakLari: () => $('Bn2'),
  pesanTolak:      () => $('pesanTolak'),
  foto:            (n) => n === 0 ? $('fotoakhir') : $(`fotoakhir${n > 1 ? n : ''}`),
  flowerContainer: () => $('flower-container'),
  audio:           () => $('linkmp3'),
};

/* ============================================================
   AUDIO
   ============================================================ */
let audio = null;

function initAudio() {
  const src = el.audio()?.textContent?.trim();
  if (src) {
    audio = new Audio(src);
    audio.preload = 'none';
  }
}

function mainkanAudio() {
  audio?.play().catch(() => {
    // autoplay diblokir browser — abaikan saja
  });
}

/* ============================================================
   SWAL — konfigurasi popup
   ============================================================ */
const swals = Swal.mixin({
  allowOutsideClick: false,
  cancelButtonColor: '#1a6fff',
  background:        '#111',
  color:             '#f0ede8',
  customClass: {
    popup:          'swal2-popup',
    confirmButton:  'swal2-confirm',
    cancelButton:   'swal2-cancel',
  },
});

/* ============================================================
   HELPERS
   ============================================================ */

/** Tampilkan elemen dengan animasi fade-in */
function tampilkanDenganAnimasi(elemen, displayVal = 'block') {
  elemen.style.display = displayVal;
  requestAnimationFrame(() =>
    requestAnimationFrame(() => elemen.classList.add('visible'))
  );
}

/** Sembunyikan elemen dengan animasi fade-out */
function sembunyikanDenganAnimasi(elemen, delay = 400) {
  elemen.style.opacity = '0';
  setTimeout(() => { elemen.style.display = 'none'; }, delay);
}

/* ============================================================
   FOTO / GIF
   ============================================================ */
function gifMuncul() {
  const foto = el.foto(0);
  if (state.indexGif > 0) {
    const sumber = el.foto(state.indexGif);
    if (sumber) foto.src = sumber.src;
  }
  foto.style.opacity   = '1';
  foto.style.transform = 'scale(1)';
}

function gifHilang() {
  const foto = el.foto(0);
  foto.style.transition = 'opacity .5s ease, transform .5s ease';
  foto.style.opacity    = '0';
  foto.style.transform  = 'scale(.1)';
}

/* ============================================================
   BUKA SURAT — klik avatar/profil
   ============================================================ */
function memulai() {
  const suratin = el.suratin();
  suratin.classList.add('bounce');
  suratin.style.pointerEvents = 'none'; // cegah double-klik

  setTimeout(() => {
    // Fade out label bawah avatar
    el.ket().style.opacity = '0';

    // Tampilkan card konten
    const content = el.content();
    tampilkanDenganAnimasi(content);

    // Tampilkan gif pertama
    const foto = el.foto(0);
    foto.style.display    = 'block';
    foto.style.opacity    = '0';
    foto.style.transform  = 'scale(.1)';
    foto.style.transition = 'opacity .7s ease, transform .7s ease';
    setTimeout(gifMuncul, 300);

    // Tampilkan tombol setelah sedikit delay
    setTimeout(() => {
      const tombol = el.tombol();
      tampilkanDenganAnimasi(tombol, 'flex');
      state.faseKlik = 1;
    }, 600);
  }, 900);
}

/* ============================================================
   MULTIFUNGSI — tombol "Mau ✨"
   Tombol ini punya 2 peran tergantung fase
   ============================================================ */
function multifungsi() {
  if (state.faseKlik === 1) diterima();
  if (state.faseKlik === 5) menuju();
}

/* ============================================================
   MENUJU — buka WhatsApp setelah konfirmasi
   ============================================================ */
async function menuju() {
  const hasil = await swals.fire({
    title:             'OK! 🎉',
    text:              'Kirim pesan ke WhatsApp aku, ya!',
    icon:              'success',
    confirmButtonText: 'Ayo! 💬',
  });

  if (hasil.isConfirmed) {
    const url = `https://api.whatsapp.com/send?phone=${CONFIG.nomorWA}&text=${encodeURIComponent(CONFIG.pesanWA)}`;
    window.location.href = url;
  }
}

/* ============================================================
   DITOLAK — tombol "Gamau" diklik
   Tombol Bn2 akan "lari" menghindari kursor / jari
   ============================================================ */
function ditolak() {
  if (!state.bisaTolak) return;
  state.bisaTolak = false;

  // Sembunyikan tombol asli, munculkan tombol pelarian
  el.tombolTidak().style.display = 'none';

  const Bn2 = el.tombolTidakLari();
  Object.assign(Bn2.style, {
    display:         'inline-flex',
    alignItems:      'center',
    justifyContent:  'center',
    cursor:          'pointer',
    width:           '80px',
    height:          '36px',
    borderRadius:    '50px',
    border:          '1.5px solid rgba(57,198,214,.5)',
    background:      'transparent',
    color:           'rgba(57,198,214,.7)',
    fontSize:        '13px',
    fontFamily:      'ProductSans, sans-serif',
    letterSpacing:   '.03em',
    position:        'fixed',
    zIndex:          '9999',
    transition:      'border-color .2s',
    userSelect:      'none',
  });

  const pindahBtn = () => {
    const maxX = window.innerWidth  - 100;
    const maxY = window.innerHeight -  50;
    Bn2.style.left = Math.max(0, Math.random() * maxX) + 'px';
    Bn2.style.top  = Math.max(0, Math.random() * maxY) + 'px';
  };

  Bn2.onmouseover  = pindahBtn;
  Bn2.ontouchstart = (e) => { e.preventDefault(); pindahBtn(); };
  pindahBtn();

  // Aktifkan lagi setelah delay singkat (anti spam)
  setTimeout(() => { state.bisaTolak = true; }, 350);
}

/* ============================================================
   DITERIMA — tombol "Mau ✨" diklik (fase pertama)
   ============================================================ */
function diterima() {
  if (!state.bisaYa) return;
  state.bisaYa   = false;
  state.faseKlik = 0;

  // Sembunyikan tombol
  sembunyikanDenganAnimasi(el.tombol());

  // Ganti ke gif kedua
  gifHilang();
  setTimeout(() => {
    state.indexGif = 1;
    gifMuncul();
  }, 700);

  // Pergi ke halaman bunga
  setTimeout(goFlower, 2000);
}

/* ============================================================
   GO FLOWER — tampilkan halaman animasi bunga
   ============================================================ */
function goFlower() {
  const fc = el.flowerContainer();
  fc.style.display = 'flex';
  requestAnimationFrame(() => fc.classList.add('active'));
  mainkanAudio();
}

/* ============================================================
   INIT — jalankan saat DOM siap
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initAudio();

  // Set teks tombol Bn2 dan sembunyikan
  const Bn2 = el.tombolTidakLari();
  if (Bn2) {
    Bn2.textContent  = 'Gamau';
    Bn2.style.display = 'none';
  }
});
