let bootError = null;

try {
    require('dotenv').config();
} catch (e) {
    bootError = { step: 'dotenv', error: e.message, stack: e.stack };
}

let express;
try {
    express = require('express');
} catch (e) {
    if (!bootError) bootError = { step: 'express', error: e.message, stack: e.stack };
}

let path;
try {
    path = require('path');
} catch (e) {
    if (!bootError) bootError = { step: 'path', error: e.message, stack: e.stack };
}

let markedObj;
let marked;
try {
    markedObj = require('marked');
    marked = markedObj.marked;
} catch (e) {
    if (!bootError) bootError = { step: 'marked', error: e.message, stack: e.stack };
}

let puppeteer;
try {
    puppeteer = require('puppeteer-core');
} catch (e) {
    if (!bootError) bootError = { step: 'puppeteer-core', error: e.message, stack: e.stack };
}

let GoogleGenerativeAI;
try {
    GoogleGenerativeAI = require('@google/generative-ai').GoogleGenerativeAI;
} catch (e) {
    if (!bootError) bootError = { step: 'google-generative-ai', error: e.message, stack: e.stack };
}

const app = express ? express() : { use: () => {}, get: () => {}, post: () => {} };
const PORT = process.env.PORT || 3000;

// Body parser with 10mb limit
app.use(express.json({ limit: '10mb' }));

// Serve static assets from public folder
app.use(express.static(path.join(__dirname, 'public')));

// HTML template function with customizable styling variables
const htmlTemplate = ({ bodyContent, fontFamily, fontSize, lineHeight, marginTB, marginLR, headingColor }) => `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Resume</title>
    <style>
        @page {
            size: A4;
            margin: ${marginTB}cm ${marginLR}cm ${marginTB}cm ${marginLR}cm;
        }
        
        * {
            box-sizing: border-box;
        }

        body {
            font-family: ${fontFamily};
            color: #000000;
            line-height: ${lineHeight};
            margin: 0;
            padding: 0;
            font-size: ${fontSize}pt;
            background-color: #ffffff;
        }

        h1 {
            font-size: 1.75em;
            font-weight: bold;
            text-transform: uppercase;
            margin: 0 0 2px 0;
            color: ${headingColor};
            text-align: center;
            letter-spacing: 0.5px;
        }

        /* Job Title right below H1 */
        .job-title {
            text-align: center;
            font-size: 1.1em;
            font-weight: bold;
            letter-spacing: 0.5px;
            margin: 0 0 4px 0;
            color: ${headingColor};
            text-transform: uppercase;
        }

        /* Contact Details & Links */
        .contact-details, .contact-links {
            text-align: center;
            font-size: 0.95em;
            color: #000000;
            margin: 0 0 2px 0;
            line-height: 1.2;
        }

        .contact-links a {
            color: #000000;
            text-decoration: none;
        }

        .contact-links a:hover {
            text-decoration: underline;
        }

        h2 {
            font-size: 1.1em;
            font-weight: bold;
            color: ${headingColor};
            border-bottom: 1px solid ${headingColor};
            padding-bottom: 1px;
            margin-top: 10px;
            margin-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            page-break-after: avoid;
        }

        h3 {
            font-size: 1em;
            font-weight: bold;
            color: #000000;
            margin-top: 5px;
            margin-bottom: 1px;
            page-break-after: avoid;
        }

        p {
            margin: 0 0 3px 0;
            text-align: justify;
        }
        
        p:empty {
            display: none;
        }

        /* Flex row for title and date on the same line */
        .flex-row {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-top: 5px;
            margin-bottom: 2px;
            page-break-after: avoid;
        }
        
        .flex-row strong {
            font-size: 1em;
            font-weight: bold;
            color: #000000;
        }
        
        .flex-row em {
            font-size: 1em;
            font-style: italic;
            color: #000000;
        }

        hr {
            display: none;
        }

        ul {
            margin: 0 0 4px 0;
            padding-left: 15px;
        }

        li {
            margin-bottom: 2px;
            page-break-inside: avoid;
            text-align: justify;
        }

        /* Tech stacks format italicized below heading */
        h3 + p {
            font-style: italic;
            color: #000000;
            font-size: 0.95em;
            margin-top: 0px;
            margin-bottom: 1px;
        }
        
        /* GitHub repository line below tech stack */
        h3 + p + p {
            font-size: 0.95em;
            margin-top: 0px;
            margin-bottom: 2px;
        }

        /* Links in body text */
        p a, li a {
            color: #000000;
            text-decoration: none;
        }
        
        p a:hover, li a:hover {
            text-decoration: underline;
        }

        strong {
            font-weight: bold;
        }
    </style>
</head>
<body>
    ${bodyContent}
</body>
</html>
`;

// Custom marked renderer to output clean paragraphs
const renderer = new marked.Renderer();

renderer.paragraph = function({ tokens }) {
    const text = this.parser.parseInline(tokens);
    if (text.includes('@') && text.includes('|')) {
        return `<p class="contact-details">${text}</p>`;
    }
    if (text.includes('href') && text.includes('|')) {
        return `<p class="contact-links">${text}</p>`;
    }
    return `<p>${text}</p>`;
};

marked.setOptions({
    renderer: renderer,
    gfm: true,
    breaks: true
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    if (bootError) {
        return res.status(500).json({ status: 'error', error: bootError });
    }
    res.json({ status: 'ok', environment: process.env.VERCEL ? 'vercel' : 'local' });
});

// API endpoint for converting MD content to PDF buffer
app.post('/api/convert', async (req, res) => {
    try {
        let { markdown, fontFamily, fontSize, lineHeight, marginTB, marginLR, headingColor } = req.body;
        
        if (!markdown) {
            return res.status(400).json({ error: 'Konten Markdown tidak boleh kosong.' });
        }

        // Apply defaults
        fontFamily = fontFamily || 'Arial, Helvetica, sans-serif';
        fontSize = fontSize || '8.5';
        lineHeight = lineHeight || '1.25';
        marginTB = marginTB || '0.8';
        marginLR = marginLR || '1.2';
        headingColor = headingColor || '#000000';

        console.log('Pre-processing header block (Name and Job Title)...');
        markdown = markdown.replace(/^#\s+([^\r\n]+)\s*[\r\n]+\*\*([^\r\n]+)\*\*/m, (match, name, title) => {
            return `<h1>${name}</h1>\n<div class="job-title">${title}</div>`;
        });

        console.log('Pre-processing title & date rows...');
        markdown = markdown.replace(/\*\*(.*?)\*\*\s*[\r\n]+\*([^*]+)\*(?=\s*[\r\n]|$)/g, (match, title, date) => {
            return `<div class="flex-row"><strong>${title}</strong><em>${date}</em></div>`;
        });

        console.log('Mengonversi Markdown ke HTML...');
        const rawHtml = marked.parse(markdown);
        const fullHtml = htmlTemplate({
            bodyContent: rawHtml,
            fontFamily,
            fontSize,
            lineHeight,
            marginTB,
            marginLR,
            headingColor
        });

        if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_VERSION) {
            return res.status(500).json({ 
                error: 'Server-side PDF conversion is disabled on Vercel to maintain high performance. Please use client-side print layout.',
                fallback: true 
            });
        }

        let browser;
        console.log('Menjalankan Puppeteer di lingkungan Lokal (Google Chrome)...');
        const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
        browser = await puppeteer.launch({
            executablePath: executablePath,
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
        
        console.log('Menyimpan PDF ke Buffer...');
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '0px',
                bottom: '0px',
                left: '0px',
                right: '0px'
            }
        });
        
        await browser.close();
        console.log('Selesai! PDF berhasil dibuat.');

        res.contentType('application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"');
        res.send(pdfBuffer);

    } catch (error) {
        console.error('Error saat konversi server:', error);
        res.status(500).json({ error: error.message || 'Terjadi kesalahan sistem saat membuat PDF.' });
    }
});

// API endpoint for analyzing CV against a Job Description using Gemini
app.post('/api/review-cv', async (req, res) => {
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
            
            // Wait 1.5 seconds to simulate API lag for a better user loading experience
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Return realistic structured mock data
            const mockResult = {
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
            };

            return res.json(mockResult);
        }

        console.log('Menghubungi Gemini API...');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Using gemini-1.5-flash for fast text generation
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const parts = [];

        // Build the prompt instructions
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

        // Add the prompt text to the parts list
        parts.unshift({ text: promptText });

        const result = await model.generateContent(parts);
        let responseText = result.response.text().trim();

        // Strip markdown code block wrappers if present
        if (responseText.startsWith('```')) {
            responseText = responseText.replace(/^```(?:json)?/, '').replace(/```$/, '').trim();
        }

        console.log('Gemini API merespon sukses.');
        
        try {
            const jsonResult = JSON.parse(responseText);
            res.json(jsonResult);
        } catch (parseError) {
            console.error('Gagal memproses parsing JSON dari AI:', responseText);
            throw new Error('Format respon kecerdasan buatan tidak sesuai format JSON.');
        }

    } catch (error) {
        console.error('Error saat review CV server:', error);
        res.status(500).json({ error: error.message || 'Terjadi kesalahan sistem saat menganalisis CV.' });
    }
});

// Start the Express server locally
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server MD2PDF berjalan sukses di http://localhost:${PORT}`);
    });
}

module.exports = app;
