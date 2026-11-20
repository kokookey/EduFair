document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. LOGIKA HALAMAN UNDANGAN (index.html)
    // ==========================================
    const guestNameEl = document.getElementById('guest-name');
    const guestCategoryEl = document.getElementById('guest-category');
    const rsvpInstansiInput = document.getElementById('rsvp-instansi');

    if (guestNameEl && guestCategoryEl) {
        // Membaca Query Parameter dari URL (?to=...&kategori=...)
        const urlParams = new URLSearchParams(window.location.search);
        const tujuan = urlParams.get('to');
        const kategori = urlParams.get('kategori');

        if (tujuan) {
            guestNameEl.textContent = tujuan;
            if (rsvpInstansiInput) {
                rsvpInstansiInput.value = tujuan; // Auto-fill form RSVP
            }
        }

        if (kategori) {
            guestCategoryEl.textContent = kategori;
        }
    }

    // Penanganan Submit Form RSVP
    const rsvpForm = document.getElementById('rsvp-form');
    const rsvpFeedback = document.getElementById('rsvp-feedback');

    if (rsvpForm) {
        rsvpForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const instansi = document.getElementById('rsvp-instansi').value;
            const status = document.getElementById('rsvp-status').value;
            const jumlah = document.getElementById('rsvp-jumlah').value;

            rsvpFeedback.textContent = `Terima kasih! Konfirmasi untuk "${instansi}" (${status} - ${jumlah} orang) telah tercatat.`;
            rsvpFeedback.classList.remove('hidden');
            rsvpForm.reset();
        });
    }

    // ==========================================
    // 2. LOGIKA HALAMAN ADMIN BLAST (admin.html)
    // ==========================================
    const csvInput = document.getElementById('csv-file-input');
    const tableBody = document.getElementById('guest-table-body');

    if (csvInput && tableBody) {
        csvInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(e) {
                const text = e.target.result;
                prosesDataCSV(text);
            };
            reader.readAsText(file);
        });
    }

    function prosesDataCSV(csvText) {
        // Memisahkan baris dan menghapus baris kosong
        const rows = csvText.split(/\r?\n/).filter(row => row.trim() !== '');
        tableBody.innerHTML = ''; // Bersihkan isi tabel sebelumnya

        // Mendapatkan base URL agar dinamis (baik di localhost maupun hosting)
        const currentUrl = window.location.href;
        const baseUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/')) + '/index.html';

        // Mulai dari index 1 untuk melewati baris header CSV
        for (let i = 1; i < rows.length; i++) {
            const cols = rows[i].split(',');
            if (cols.length < 5) continue;

            const id = cols[0].trim();
            const namaTamu = cols[1].trim();
            const instansi = cols[2].trim();
            const kategori = cols[3].trim();
            const noWa = cols[4].trim();

            // Membuat URL Personalisasi dengan encodeURIComponent
            const personalLink = `${baseUrl}?to=${encodeURIComponent(instansi)}&kategori=${encodeURIComponent(kategori)}`;

            // Membuat template pesan WhatsApp
            const pesanWa = `Yth. *${namaTamu}* (${instansi}),\n\n` +
                            `Kami mengundang Bapak/Ibu untuk berpartisipasi dalam acara tahunan *Edu Fair & Career Day 2026*.\n\n` +
                            `Informasi lengkap dan konfirmasi kehadiran (RSVP) dapat diakses melalui tautan undangan khusus berikut:\n` +
                            `${personalLink}\n\n` +
                            `Terima kasih atas perhatian dan kerja samanya.`;

            const waUrl = `https://wa.me/${noWa}?text=${encodeURIComponent(pesanWa)}`;

            // Render baris ke tabel HTML
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${id}</td>
                <td>${namaTamu}</td>
                <td>${instansi}</td>
                <td><span class="category-pill">${kategori}</span></td>
                <td>${noWa}</td>
                <td>
                    <a href="${waUrl}" target="_blank" class="btn-wa">Kirim Undangan WhatsApp</a>
                </td>
            `;
            tableBody.appendChild(tr);
        }
    }
});