const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        let cvType = 'text';
        let cvData = '';
        let jdType = 'text';
        let jdData = '';

        if (req.body.cv && typeof req.body.cv === 'object') {
            cvType = req.body.cv.type || 'text';
            cvData = req.body.cv.data || '';
        } else if (req.body.markdown) {
            cvType = 'text';
            cvData = req.body.markdown;
        }

        if (req.body.jobDescription && typeof req.body.jobDescription === 'object') {
            jdType = req.body.jobDescription.type || 'text';
            jdData = req.body.jobDescription.data || '';
        } else if (typeof req.body.jobDescription === 'string') {
            jdType = 'text';
            jdData = req.body.jobDescription;
        }

        if (!cvData || !jdData) {
            return res.status(400).json({ error: 'CV dan Job Description wajib diisi.' });
        }

        console.log('Menerima permintaan review CV...');

        // Check if Gemini API key is configured
        if (!process.env.GEMINI_API_KEY) {
            console.log('GEMINI_API_KEY tidak disetel. Menggunakan simulasi data mock ATS...');
            await new Promise(resolve => setTimeout(resolve, 1500));

            return res.json({
                matchScore: 82,
                missingKeywords: [
                    "Nginx Configuration",
                    "Ubuntu Server Management",
                    "Server Monitoring (UFW/SSH)",
                    "RESTful API Integration",
                    "CI/CD / Docker Orchestration"
                ],
                redFlags: [
                    "Kurang menyertakan rincian metrik pencapaian (data kuantitatif/angka) pada proyek kerja.",
                    "Status mahasiswa aktif saat ini dapat memicu keraguan perekrut terkait ketersediaan waktu kerja penuh (Full-time).",
                    "Belum terlihat adanya sertifikasi administrasi sistem server/jaringan yang terstandarisasi industri."
                ],
                rewrittenExperience: `### Fullstack Developer & System Administrator | Contract / Independent  
*Des 2024 – Sekarang*  
* **[Fullstack Application Development]** Mengembangkan dan memelihara 3 aplikasi web modular berbasis React JS dan PHP Laravel, meningkatkan kecepatan respon API sebesar 30% dengan melakukan optimalisasi struktur basis data.
* **[Ubuntu Server & Nginx Management]** Mengonfigurasi dan mengamankan 5 instans Ubuntu Server menggunakan Nginx reverse proxy, menghemat biaya operasional server sebesar 15% melalui optimalisasi alokasi resource.
* **[Server Infrastructure Security]** Menerapkan standar pengerasan keamanan server meliputi SSH key-only authentication dan aturan firewall UFW yang menurunkan percobaan akses ilegal sebesar 95%.
* **[Database Administration & Backups]** Merancang skema basis data relasional (MySQL & PostgreSQL) dengan normalisasi tingkat ketiga dan mengotomatiskan routine backups yang menjamin pemulihan data 100% saat terjadi insiden.
* **[Docker Deployment & CLI]** Melakukan kontainerisasi aplikasi menggunakan Docker CLI yang mempercepat siklus deployment dari 40 menit menjadi 3 minute saja.
* **[Troubleshooting & Monitoring]** Menganalisis log sistem secara berkala untuk troubleshooting downtime, meningkatkan ketersediaan layanan (*system availability*) hingga mencapai target 99.9%.`,
                skippedSections: [
                    {
                        section: "Profil Profesional",
                        reason: "Terlalu deskriptif, bertele-tele, dan kurang menyajikan keahlian kunci server Linux di 3 baris awal.",
                        suggestion: "### PROFIL PROFESIONAL\nFullstack Developer & SysAdmin dengan 1.5+ tahun pengalaman mengelola infrastruktur Ubuntu Server (Nginx, SSH, UFW) dan membangun web app (React JS, Laravel). Mahir melakukan kontainerisasi Docker untuk memangkas waktu deployment sebesar 90% serta menjamin stabilitas sistem (99.9% uptime)."
                    },
                    {
                        section: "Sertifikasi & Pencapaian",
                        reason: "Hanya mencantumkan satu sertifikat basis data umum tanpa rincian keahlian server sistem yang ditekankan jobdesc.",
                        suggestion: "### SERTIFIKASI & PENCAPAIAN\n* **Sertifikat Kompetensi Sistem Basis Data** — Dikeluarkan oleh KOMUNITAS PHPID (Juli 2025)\n* **Linux System Administration Projects** — Berhasil mengelola & memantau server mandiri berbasis Ubuntu dengan sertifikat SSL otomatis Let's Encrypt."
                    }
                ],
                completeMarkdown: `# DARELL RANGGA PUTRA RACHMAN
**SYSTEM ADMINISTRATOR & FULLSTACK DEVELOPER**

Bekasi, Jawa Barat, Indonesia | darrelrangga@gmail.com | +62 8978638973
darellrangga.me | linkedin.com/in/darell-rangga-1320b634b/ | github.com/Rangga11268

---

## PROFIL PROFESIONAL
Fullstack Developer & SysAdmin dengan 1.5+ tahun pengalaman mengelola infrastruktur Ubuntu Server (Nginx, SSH, UFW) dan membangun web app (React JS, Laravel). Mahir melakukan kontainerisasi Docker untuk memangkas waktu deployment sebesar 90% serta menjamin stabilitas sistem (99.9% uptime).

---

## KUALIFIKASI TEKNIS
* **Fullstack Web Development:** HTML5, CSS3, JavaScript (ES6+), React JS, Vue.js, PHP (Laravel Framework), Node.js (Express.js), RESTful APIs.
* **Linux & System Administration:** Ubuntu Server management, Nginx configuration & optimization, Apache, CLI Shell Scripting.
* **Server Security:** Secure Shell (SSH hardening), Uncomplicated Firewall (UFW), SSL/TLS Certificates (Let's Encrypt).
* **Database Administration:** MySQL, PostgreSQL, MongoDB, normalisasi skema, indexing kueri, routine backups, transaction logs.
* **DevOps & Tools:** Docker containerization, Git, GitHub, GitLab, Postman, CLI deployment.
* **Soft Skills:** Analisis Troubleshooting, Logika Pemecahan Masalah, Kerja Sama Tim, Kemampuan Kerja Remote.

---

## PENGALAMAN KERJA

**Fullstack Developer & System Administrator | Contract / Independent**  
*Des 2024 – Sekarang*
* **[Fullstack Application Development]** Mengembangkan dan memelihara 3 aplikasi web modular berbasis React JS dan PHP Laravel, meningkatkan kecepatan respon API sebesar 30% dengan melakukan optimalisasi struktur basis data.
* **[Ubuntu Server & Nginx Management]** Mengonfigurasi dan mengamankan 5 instans Ubuntu Server menggunakan Nginx reverse proxy, menghemat biaya operasional server sebesar 15% melalui optimalisasi alokasi resource.
* **[Server Infrastructure Security]** Menerapkan standar pengerasan keamanan server meliputi SSH key-only authentication dan aturan firewall UFW yang menurunkan percobaan akses ilegal sebesar 95%.
* **[Database Administration & Backups]** Merancang skema basis data relasional (MySQL & PostgreSQL) dengan normalisasi tingkat ketiga dan mengotomatiskan routine backups yang menjamin pemulihan data 100% saat terjadi insiden.
* **[Docker Deployment & CLI]** Melakukan kontainerisasi aplikasi menggunakan Docker CLI yang mempercepat siklus deployment dari 40 menit menjadi 3 menit saja.
* **[Troubleshooting & Monitoring]** Menganalisis log sistem secara berkala untuk troubleshooting downtime, meningkatkan ketersediaan layanan (*system availability*) hingga mencapai target 99.9%.

---

## PROYEK PENGEMBANGAN APLIKASI & PORTFOLIO

### RestoApp | SaaS Restaurant Management Platform
*Tech Stack: Laravel 12 (PHP), React JS, Tailwind CSS, PostgreSQL/MySQL, Docker, Nginx, Ubuntu Server*  
**GitHub Repository:** github.com/Rangga11268/RestoApp
* Mengembangkan modul RESTful API backend dan dashboard administratif multi-tenant responsif berbasis React JS.
* Melakukan deployment kontainer aplikasi menggunakan Docker di atas instans Ubuntu Server dengan konfigurasi Nginx reverse proxy yang dioptimalkan.
* Menulis 63 unit test fungsional terautomasi menggunakan PHPUnit untuk menjamin keandalan data transaksi.

### SRB Motor V3 | Dealership Management System & Dashboard
*Tech Stack: Laravel 12, MySQL, REST API, Tailwind CSS, Docker, Nginx, Ubuntu*  
**GitHub Repository:** github.com/Rangga11268/SrbMotorV3
* Mengembangkan modul sistem stok dan penanganan pengajuan kredit dealer terintegrasi REST API.
* Mengonfigurasi server Ubuntu lokal/cloud, penanganan sertifikat SSL, penyiapan cron jobs untuk routine backups otomatis database MySQL.

### Tunggal Jaya Transport | Real-Time Bus Booking System
*Tech Stack: Laravel 11, Vue.js 3, Inertia.js, MySQL, Fonnte WhatsApp API*  
**GitHub Repository:** github.com/Rangga11268/TunggalJaya
* Membangun modul pemesanan tiket bus real-time berbasis basis data relasional MySQL dengan penulisan query teroptimasi untuk log transaksi penjualan.

---

## PENDIDIKAN
**S1 Sistem Informasi | Universitas Bina Sarana Informatika**  
*Sep 2024 – Sekarang*  
* Fokus Studi: Jaringan Komputer, Administrasi Server, Basis Data Relasional.
* **IPK: 4.00 / 4.00**

---

## SERTIFIKASI & PENCAPAIAN
* **Sertifikat Kompetensi Sistem Basis Data** — Dikeluarkan oleh KOMUNITAS PHPID (Juli 2025)
* **Linux System Administration Projects** — Berhasil mengelola & memantau server mandiri berbasis Ubuntu dengan sertifikat SSL otomatis Let's Encrypt.`
            });
        }

        console.log('Menghubungi Gemini API...');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const parts = [];
        let promptText = `
Anda adalah Recruiter Senior dan ATS (Applicant Tracking System) Filter untuk perusahaan target.
Tugas Anda adalah melakukan audit mendalam terhadap Resume/CV pelamar berdasarkan Deskripsi Pekerjaan (Job Description) yang dilampirkan.

`;

        if (cvType === 'text') {
            promptText += `Resume/CV Pelamar (Markdown):\n"""\n${cvData}\n"""\n\n`;
        } else {
            promptText += `Resume/CV Pelamar dilampirkan sebagai berkas PDF (binary part).\n\n`;
            parts.push({
                inlineData: {
                    data: cvData,
                    mimeType: "application/pdf"
                }
            });
        }

        if (jdType === 'text') {
            promptText += `Deskripsi Pekerjaan (Job Description):\n"""\n${jdData}\n"""\n\n`;
        } else {
            promptText += `Deskripsi Pekerjaan dilampirkan sebagai berkas PDF (binary part).\n\n`;
            parts.push({
                inlineData: {
                    data: jdData,
                    mimeType: "application/pdf"
                }
            });
        }

        promptText += `
Berikan respons Anda dalam format JSON yang valid. Skema JSON harus tepat seperti ini:
{
  "matchScore": <score_antara_0_dan_100>,
  "missingKeywords": [
    "<kata_kunci_1_yang_hilang>",
    "<kata_kunci_2_yang_hilang>",
    "<kata_kunci_3_yang_hilang>",
    "<kata_kunci_4_yang_hilang>",
    "<kata_kunci_5_yang_hilang>"
  ],
  "redFlags": [
    "<red_flag_1>",
    "<red_flag_2>",
    "<red_flag_3>"
  ],
  "rewrittenExperience": "<bagian_pengalaman_kerja_yang_ditulis_ulang_menggunakan_formula_Google_XYZ_Accomplish_X_as_measured_by_Y_by_doing_Z_secara_natural_dalam_format_markdown>",
  "skippedSections": [
    {
      "section": "<nama_bagian_1_yang_rawan_dilewati>",
      "reason": "<alasan_mengapa_dilewati>",
      "suggestion": "<saran_tulis_ulang_agar_menarik_scroll-stopping_dalam_format_markdown>"
    },
    {
      "section": "<nama_bagian_2_yang_rawan_dilewati>",
      "reason": "<alasan_mengapa_dilewati>",
      "suggestion": "<saran_tulis_ulang_agar_menarik_scroll-stopping_dalam_format_markdown>"
    }
  ],
  "completeMarkdown": "<seluruh_isi_CV_yang_baru_yang_telah_dioptimalkan_menggabungkan_bagian_pengalaman_kerja_yang_telah_ditulis_ulang_dan_saran_perbaikan_bagian_yang_dilewati_ke_dalam_layout_CV_utuh_dalam_format_markdown_yang_siap_disalin_dan_diterapkan_langsung_ke_editor_tanpa_kehilangan_informasi_kontak_atau_pendidikan>"
}

Ketentuan Tambahan:
- Nilai "rewrittenExperience" harus berisi penulisan ulang bagian Pengalaman Kerja (Experience) dari Resume pelamar dengan menerapkan formula Google XYZ secara ketat (Accomplish X, as measured by Y, by doing Z) dan memasukkan kata kunci penting yang sebelumnya hilang.
- Nilai "skippedSections" harus menganalisis bagian dari Resume pelamar yang berpotensi dilewati oleh recruiter yang sedang membaca cepat, lalu menyusun kembali tulisan tersebut agar menghentikan scroll pembaca.
- Nilai "completeMarkdown" harus merupakan versi lengkap dari CV pelamar (baik CV asal berupa teks markdown atau diekstrak dari PDF CV) yang telah diperbarui bagian Pengalaman Kerja-nya dan bagian yang dilewati-nya dengan hasil optimasi di atas. Format harus rapi dan lengkap sebagai resume markdown satu halaman.
- Pastikan output HANYA berupa JSON valid. Jangan tambahkan kata pengantar, penutup, atau tanda markdown block \`\`\`json ... \`\`\` dalam teks respon.
`;

        parts.unshift({ text: promptText });

        const result = await model.generateContent(parts);
        let responseText = result.response.text().trim();

        if (responseText.startsWith('```')) {
            responseText = responseText.replace(/^```(?:json)?/, '').replace(/```$/, '').trim();
        }

        console.log('Gemini API merespon sukses.');

        try {
            const jsonResult = JSON.parse(responseText);
            res.json(jsonResult);
        } catch (parseError) {
            console.error('Gagal memproses parsing JSON dari AI:', responseText);
            res.status(500).json({ error: 'Format respon kecerdasan buatan tidak sesuai format JSON.' });
        }

    } catch (error) {
        console.error('Error saat review CV server:', error);
        res.status(500).json({ error: error.message || 'Terjadi kesalahan sistem saat menganalisis CV.' });
    }
};
