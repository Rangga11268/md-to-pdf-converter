document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const markdownInput = document.getElementById('markdown-input');
    const btnClear = document.getElementById('btn-clear');
    const btnDownloadMd = document.getElementById('btn-download-md');
    const fileUpload = document.getElementById('file-upload');
    const dragZone = document.getElementById('drag-zone');
    const uploadedFilename = document.getElementById('uploaded-filename');
    const btnConvert = document.getElementById('btn-convert');
    const selectTemplate = document.getElementById('select-template');
    
    // Tabs
    const tabEditor = document.getElementById('tab-editor');
    const tabPreview = document.getElementById('tab-preview');
    const tabAiReviewer = document.getElementById('tab-ai-reviewer');
    const tabPricing = document.getElementById('tab-pricing');
    const livePreviewContainer = document.getElementById('live-preview-container');
    const aiReviewerContainer = document.getElementById('ai-reviewer-container');
    const pricingContainer = document.getElementById('pricing-container');
    const a4Sheet = document.getElementById('a4-sheet');

    // Pricing elements
    const btnBuyTokens = document.getElementById('btn-buy-tokens');
    const btnBuyUnlimited = document.getElementById('btn-buy-unlimited');

    // AI Reviewer Elements
    const jobDescriptionInput = document.getElementById('job-description-input');
    const btnReviewCv = document.getElementById('btn-review-cv');
    const aiResultsDashboard = document.getElementById('ai-results-dashboard');
    const aiScoreValue = document.getElementById('ai-score-value');
    const aiScoreComment = document.getElementById('ai-score-comment');
    const aiKeywordsList = document.getElementById('ai-keywords-list');
    const aiFlagsList = document.getElementById('ai-flags-list');
    const aiRewrittenExperience = document.getElementById('ai-rewritten-experience');
    const aiSkippedSectionsList = document.getElementById('ai-skipped-sections-list');
    const btnCopyRewritten = document.getElementById('btn-copy-rewritten');
    
    // File upload elements for AI Reviewer
    const aiCvDropzone = document.getElementById('ai-cv-dropzone');
    const aiCvFileInput = document.getElementById('ai-cv-file-input');
    const aiCvFileBadge = document.getElementById('ai-cv-file-badge');
    const aiCvFileName = document.getElementById('ai-cv-file-name');
    const btnRemoveAiCv = document.getElementById('btn-remove-ai-cv');
    
    const aiJdDropzone = document.getElementById('ai-jd-dropzone');
    const aiJdFileInput = document.getElementById('ai-jd-file-input');
    const aiJdFileBadge = document.getElementById('ai-jd-file-badge');
    const aiJdFileName = document.getElementById('ai-jd-file-name');
    const btnRemoveAiJd = document.getElementById('btn-remove-ai-jd');
    
    const btnApplyToEditor = document.getElementById('btn-apply-to-editor');
    
    // Settings elements
    const settingFont = document.getElementById('setting-font');
    const settingColor = document.getElementById('setting-color');
    const settingSize = document.getElementById('setting-size');
    const settingHeight = document.getElementById('setting-height');
    const settingMarginTB = document.getElementById('setting-margin-tb');
    const settingMarginLR = document.getElementById('setting-margin-lr');
    
    // Sliders UI output values
    const valSize = document.getElementById('val-size');
    const valHeight = document.getElementById('val-height');
    const valMargin = document.getElementById('val-margin');

    // Custom Dialog Elements
    const customLoader = document.getElementById('custom-loader');
    const loaderText = document.getElementById('loader-text');
    const customAlertEl = document.getElementById('custom-alert');
    const customAlertMsg = document.getElementById('custom-alert-message');
    const customAlertOkBtn = document.getElementById('custom-alert-btn-ok');
    const customAlertCloseX = document.getElementById('custom-alert-close-x');
    
    const customConfirmEl = document.getElementById('custom-confirm');
    const customConfirmMsg = document.getElementById('custom-confirm-message');
    const customConfirmConfirmBtn = document.getElementById('custom-confirm-btn-confirm');
    const customConfirmCancelBtn = document.getElementById('custom-confirm-btn-cancel');
    const customConfirmCloseX = document.getElementById('custom-confirm-close-x');

    // Helper functions for custom loader
    function showLoader(message = 'Sedang memproses dokumen...') {
        loaderText.textContent = message;
        customLoader.style.display = 'flex';
    }

    function hideLoader() {
        customLoader.style.display = 'none';
    }

    // Helper function for custom alert
    function customAlert(message) {
        return new Promise((resolve) => {
            customAlertMsg.textContent = message;
            customAlertEl.style.display = 'flex';

            const closeAlert = () => {
                customAlertEl.style.display = 'none';
                customAlertOkBtn.removeEventListener('click', closeAlert);
                customAlertCloseX.removeEventListener('click', closeAlert);
                resolve();
            };

            customAlertOkBtn.addEventListener('click', closeAlert);
            customAlertCloseX.addEventListener('click', closeAlert);
        });
    }

    // Helper function for custom confirm
    function customConfirm(message) {
        return new Promise((resolve) => {
            customConfirmMsg.textContent = message;
            customConfirmEl.style.display = 'flex';

            const onConfirm = () => {
                cleanup();
                resolve(true);
            };

            const onCancel = () => {
                cleanup();
                resolve(false);
            };

            const cleanup = () => {
                customConfirmEl.style.display = 'none';
                customConfirmConfirmBtn.removeEventListener('click', onConfirm);
                customConfirmCancelBtn.removeEventListener('click', onCancel);
                customConfirmCloseX.removeEventListener('click', onCancel);
            };

            customConfirmConfirmBtn.addEventListener('click', onConfirm);
            customConfirmCancelBtn.addEventListener('click', onCancel);
            customConfirmCloseX.addEventListener('click', onCancel);
        });
    }

    let currentFilename = '';

    // Templates definition
    const cvTemplate = `# DARELL RANGGA PUTRA RACHMAN
**SYSTEM ADMINISTRATOR & FULLSTACK DEVELOPER**

Bekasi, Jawa Barat, Indonesia | darrelrangga@gmail.com | +62 8978638973
darellrangga.me | linkedin.com/in/darell-rangga-1320b634b/ | github.com/Rangga11268

---

## PROFIL PROFESIONAL
Fullstack Developer dan System Administrator yang berdedikasi tinggi dengan pengalaman praktis selama lebih dari 1,5 tahun dalam merancang, membangun, dan memelihara aplikasi web modern serta mengelola infrastruktur server berbasis Linux (Ubuntu Server). Menguasai pengembangan front-end (HTML5, CSS3, JS, React JS) dan back-end (Node.js, PHP Laravel). Memiliki pemahaman kuat dalam konfigurasi server (Nginx), keamanan (SSH, UFW, SSL/TLS), pengelolaan database (MySQL, PostgreSQL, MongoDB), optimasi performa, serta orkestrasi deployment menggunakan Docker dan antarmuka CLI. Terbiasa melakukan pemantauan sistem (monitoring), pengelolaan rutin backup basis data, serta troubleshooting insiden sistem secara efisien.

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
* **[Fullstack Application Development]** Membangun dan memelihara aplikasi web modular (front-end dengan React JS, back-end dengan PHP Laravel & Node.js) dengan implementasi kode bersih dan aman (clean code).
* **[Ubuntu Server & Nginx Management]** Mengelola, mengoptimalkan, dan mengonfigurasi infrastruktur server berbasis Ubuntu Server menggunakan Nginx as reverse proxy serta optimasi konfigurasi server block.
* **[Server Infrastructure Security]** Menerapkan standar keamanan server meliputi pengerasan SSH (SSH key-only authentication), konfigurasi aturan firewall (UFW), dan pemasangan sertifikat enkripsi SSL/TLS.
* **[Database Administration & Backups]** Merancang skema basis data relasional (MySQL & PostgreSQL), mengoptimalkan query DDL/DML, serta mengelola penjadwalan backup data transaksi rutin.
* **[Docker Deployment & CLI]** Melakukan kontainerisasi aplikasi dan deployment layanan web menggunakan Docker secara efisien melalui antarmuka perintah CLI.
* **[Troubleshooting & Monitoring]** Menganalisis log sistem (troubleshooting downtime), memantau ketersediaan layanan, serta melakukan optimasi performa backend untuk menjamin ketersediaan tinggi (high availability).

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
* **Sertifikat Kompetensi Sistem Basis Data** — Dikeluarkan oleh KOMUNITAS PHPID (Juli 2025)`;

    const letterTemplate = `# DARELL RANGGA PUTRA RACHMAN
Bekasi, Jawa Barat, Indonesia | darrelrangga@gmail.com | +62 8978638973
darellrangga.me | linkedin.com/in/darell-rangga-1320b634b/ | github.com/Rangga11268

---

Hal: Lamaran Pekerjaan – System Administrator (Fullstack Developer)

Kepada Yth.
Tim Rekrutmen / HRD PT LINKIT
Mampang Prapatan, Jakarta Raya

Dengan hormat,

Sehubungan dengan informasi lowongan pekerjaan mengenai posisi System Administrator (Fullstack Developer) di PT LINKIT, melalui surat ini saya bermaksud mengajukan diri untuk bergabung dengan perusahaan yang Bapak/Ibu pimpin.

Saya adalah mahasiswa aktif S1 Sistem Informasi di Universitas Bina Sarana Informatika dengan IPK 4.00, yang memiliki pengalaman praktis selama lebih dari 1,5 tahun secara mandiri dalam pengembangan web fullstack (React JS, PHP Laravel, Node.js) sekaligus administrasi server Linux (Ubuntu Server). Kualifikasi dan kompetensi saya sangat selaras dengan kebutuhan operasional PT LINKIT, di antaranya:

1. Pengembangan Web Fullstack: Berpengalaman dalam merancang struktur basis data (MySQL, PostgreSQL, MongoDB), membangun RESTful API yang aman, serta mengintegrasikan sistem dengan layanan pihak ketiga (partner integrations).
2. Administrasi Server Linux & Nginx: Memiliki keahlian praktis dalam mengonfigurasi dan mengoptimalkan infrastruktur server berbasis Ubuntu Server, termasuk konfigurasi Nginx sebagai reverse proxy.
3. Keamanan & Keandalan Server: Menerapkan pengerasan keamanan jaringan server meliputi SSH hardening, firewall (UFW), pemasangan SSL/TLS, serta penyiapan cron jobs untuk routine backups database.
4. Kontainerisasi & DevOps: Mahir menggunakan Docker untuk deployment aplikasi secara rapi melalui perintah CLI, serta mengelola kode proyek menggunakan Git dan GitHub/GitLab.

Saya memiliki motivasi tinggi, logika pemecahan masalah yang kuat, serta dedikasi untuk menjaga keandalan sistem agar tetap memiliki performa tinggi (high availability) dan skalabilitas yang baik di PT LINKIT.

Sebagai bahan pertimbangan Bapak/Ibu, saya melampirkan CV terbaru saya. Terima kasih atas waktu dan perhatian yang Bapak/Ibu berikan. Saya sangat berharap mendapatkan kesempatan untuk berdiskusi lebih lanjut dalam sesi wawancara mengenai kontribusi yang dapat saya berikan bagi PT LINKIT.

Hormat saya,

Darell Rangga Putra Rachman`;

    // Load draft from LocalStorage if available
    const savedDraft = localStorage.getItem('md2cv_draft');
    if (savedDraft !== null) {
        markdownInput.value = savedDraft;
    } else {
        // Start empty on first run
        markdownInput.value = '';
    }

    // Save draft automatically to LocalStorage on typing
    markdownInput.addEventListener('input', () => {
        const value = markdownInput.value;
        localStorage.setItem('md2cv_draft', value);
        runATSChecklist();
        renderLivePreview();
    });

    // Handle template selector change
    selectTemplate.addEventListener('change', async (e) => {
        const selected = e.target.value;
        let content = '';
        if (selected === 'cv') {
            content = cvTemplate;
        } else if (selected === 'letter') {
            content = letterTemplate;
        }

        if (content) {
            const confirmed = await customConfirm('Muat template baru? Konten editor saat ini akan digantikan.');
            if (confirmed) {
                markdownInput.value = content;
                localStorage.setItem('md2cv_draft', content);
                currentFilename = '';
                uploadedFilename.style.display = 'none';
                uploadedFilename.textContent = '';
                runATSChecklist();
                renderLivePreview();
                // Reset select index
                selectTemplate.selectedIndex = 0;
            } else {
                selectTemplate.selectedIndex = 0;
            }
        }
    });

    // Update slider label values and live preview dynamically
    settingSize.addEventListener('input', (e) => {
        valSize.textContent = `${e.target.value}pt`;
        renderLivePreview();
    });

    settingHeight.addEventListener('input', (e) => {
        valHeight.textContent = e.target.value;
        renderLivePreview();
    });

    function updateMarginLabel() {
        valMargin.textContent = `${settingMarginTB.value}cm ${settingMarginLR.value}cm`;
        renderLivePreview();
    }

    settingMarginTB.addEventListener('input', updateMarginLabel);
    settingMarginLR.addEventListener('input', updateMarginLabel);
    settingFont.addEventListener('change', renderLivePreview);
    settingColor.addEventListener('change', renderLivePreview);

    // Clear input
    btnClear.addEventListener('click', async () => {
        const confirmed = await customConfirm('Apakah Anda yakin ingin mengosongkan editor? Draf lama akan dihapus.');
        if (confirmed) {
            markdownInput.value = '';
            currentFilename = '';
            localStorage.setItem('md2cv_draft', ''); // Set to empty string instead of removing to preserve empty state on reload
            uploadedFilename.style.display = 'none';
            uploadedFilename.textContent = '';
            runATSChecklist();
            renderLivePreview();
            markdownInput.focus();
        }
    });

    // Download MD file
    btnDownloadMd.addEventListener('click', async () => {
        const text = markdownInput.value.trim();
        if (!text) {
            await customAlert('Editor kosong! Tidak ada konten untuk diunduh.');
            return;
        }

        const blob = new Blob([text], { type: 'text/markdown;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = getDynamicFilename().replace(/\.pdf$/, '.md');
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
    });

    // File Drag & Drop
    dragZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dragZone.classList.add('dragover');
    });

    dragZone.addEventListener('dragleave', () => {
        dragZone.classList.remove('dragover');
    });

    dragZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dragZone.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    dragZone.addEventListener('click', (e) => {
        if (e.target !== fileUpload) {
            fileUpload.click();
        }
    });

    fileUpload.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    // Helper to read markdown file
    async function handleFile(file) {
        if (!file.name.endsWith('.md')) {
            await customAlert('Silakan unggah file dengan format .md saja.');
            return;
        }

        currentFilename = file.name;
        uploadedFilename.textContent = `File aktif: ${file.name}`;
        uploadedFilename.style.display = 'inline-block';

        const reader = new FileReader();
        reader.onload = (e) => {
            markdownInput.value = e.target.result;
            localStorage.setItem('md2cv_draft', e.target.result);
            runATSChecklist();
            renderLivePreview();
        };
        reader.readAsText(file);
    }

    // Helper to generate dynamic file name based on input markdown name heading
    function getDynamicFilename() {
        if (currentFilename) {
            return currentFilename.replace(/\.md$/, '.pdf');
        }

        const mdText = markdownInput.value.trim();
        const match = mdText.match(/^#\s+([^\r\n]+)/);
        if (match && match[1]) {
            const slug = match[1].trim()
                .replace(/[^a-zA-Z0-9\s-]/g, '')
                .replace(/\s+/g, '_');
            return `CV_${slug}.pdf`;
        }
        return 'CV_Darell_Rangga.pdf';
    }

    // Tabs switching logic
    tabEditor.addEventListener('click', () => {
        tabPreview.classList.remove('active');
        tabAiReviewer.classList.remove('active');
        tabPricing.classList.remove('active');
        tabEditor.classList.add('active');
        livePreviewContainer.style.display = 'none';
        aiReviewerContainer.style.display = 'none';
        pricingContainer.style.display = 'none';
        dragZone.style.display = 'flex';
        markdownInput.style.display = 'block';
    });

    tabPreview.addEventListener('click', () => {
        tabEditor.classList.remove('active');
        tabAiReviewer.classList.remove('active');
        tabPricing.classList.remove('active');
        tabPreview.classList.add('active');
        markdownInput.style.display = 'none';
        aiReviewerContainer.style.display = 'none';
        pricingContainer.style.display = 'none';
        dragZone.style.display = 'none';
        livePreviewContainer.style.display = 'block';
        renderLivePreview();
    });

    tabAiReviewer.addEventListener('click', () => {
        tabEditor.classList.remove('active');
        tabPreview.classList.remove('active');
        tabPricing.classList.remove('active');
        tabAiReviewer.classList.add('active');
        markdownInput.style.display = 'none';
        livePreviewContainer.style.display = 'none';
        pricingContainer.style.display = 'none';
        dragZone.style.display = 'none';
        aiReviewerContainer.style.display = 'block';
    });

    tabPricing.addEventListener('click', () => {
        tabEditor.classList.remove('active');
        tabPreview.classList.remove('active');
        tabAiReviewer.classList.remove('active');
        tabPricing.classList.add('active');
        markdownInput.style.display = 'none';
        livePreviewContainer.style.display = 'none';
        aiReviewerContainer.style.display = 'none';
        dragZone.style.display = 'none';
        pricingContainer.style.display = 'flex';
    });

    // Live Render compilation
    function renderLivePreview() {
        if (typeof marked === 'undefined') return;

        let md = markdownInput.value.trim();
        if (!md) {
            a4Sheet.innerHTML = '<p style="color: #6b7280; font-style: italic; text-align: center; margin-top: 40px;">Belum ada konten untuk ditampilkan. Silakan tulis sesuatu di Editor.</p>';
            return;
        }

        // Check if input is a letter or CV (CV has bold subtitle)
        const isCV = md.includes('\n**');

        // Apply HTML pre-processing matching the backend
        if (isCV) {
            md = md.replace(/^#\s+([^\r\n]+)\s*[\r\n]+\*\*([^\r\n]+)\*\*/m, (match, name, title) => {
                return `<h1>${name}</h1>\n<div class="job-title">${title}</div>`;
            });
        } else {
            md = md.replace(/^#\s+([^\r\n]+)/m, (match, name) => {
                return `<h1>${name}</h1>`;
            });
        }

        md = md.replace(/\*\*(.*?)\*\*\s*[\r\n]+\*([^*]+)\*(?=\s*[\r\n]|$)/g, (match, title, date) => {
            if (date.length > 40 || date.toLowerCase().includes('tech stack') || date.toLowerCase().includes('github')) {
                return match;
            }
            return `<div class="flex-row"><strong>${title}</strong><em>${date}</em></div>`;
        });

        // Set custom marked paragraph layout for contact/links
        const customRenderer = new marked.Renderer();
        customRenderer.paragraph = function({ tokens }) {
            const text = this.parser.parseInline(tokens);
            if (text.includes('@') && text.includes('|')) {
                return `<p class="contact-details">${text}</p>`;
            }
            if (text.includes('href') && text.includes('|')) {
                return `<p class="contact-links">${text}</p>`;
            }
            return `<p>${text}</p>`;
        };

        const htmlContent = marked.parse(md, { renderer: customRenderer, gfm: true, breaks: false });
        a4Sheet.innerHTML = htmlContent;

        // Apply dynamic custom styling directly to A4 Sheet elements
        a4Sheet.style.fontFamily = settingFont.value;
        a4Sheet.style.fontSize = `${settingSize.value}pt`;
        a4Sheet.style.lineHeight = settingHeight.value;
        a4Sheet.style.padding = `${settingMarginTB.value}cm ${settingMarginLR.value}cm`;

        // Apply Heading Colors Aksen
        const accentColor = settingColor.value;
        const h1 = a4Sheet.querySelector('h1');
        if (h1) h1.style.color = accentColor;

        const h2s = a4Sheet.querySelectorAll('h2');
        h2s.forEach(h2 => {
            h2.style.color = accentColor;
            h2.style.borderBottomColor = accentColor;
        });

        const jobTitle = a4Sheet.querySelector('.job-title');
        if (jobTitle) jobTitle.style.color = accentColor;
    }

    // ATS Checklist validation logic
    function runATSChecklist() {
        const text = markdownInput.value.trim();
        
        const hasContact = text.includes('@') && (text.match(/[\d+]{7,}/) || text.includes('|'));
        toggleCheck('chk-contact', hasContact);

        const hasProfile = /##\s*(PROFIL|RINGKASAN|SUMMARY|TENTANG)/i.test(text);
        toggleCheck('chk-profile', hasProfile);

        const hasSkills = /##\s*(KEAHLIAN|KUALIFIKASI|SKILLS|KEMAMPUAN)/i.test(text);
        toggleCheck('chk-skills', hasSkills);

        const hasExperience = /##\s*(PENGALAMAN|WORK|EXPERIENCE|PROYEK|PROJECT)/i.test(text);
        toggleCheck('chk-experience', hasExperience);

        const hasEducation = /##\s*(PENDIDIKAN|EDUCATION|RIWAYAT PENDIDIKAN)/i.test(text);
        toggleCheck('chk-education', hasEducation);
    }

    function toggleCheck(id, isValid) {
        const item = document.getElementById(id);
        if (isValid) {
            item.classList.add('checked');
        } else {
            item.classList.remove('checked');
        }
    }

    async function triggerNativePrint() {
        await customAlert('Server-side PDF generator tidak aktif di Vercel (Hobby limits). Kami akan mengalihkan Anda ke dialog Cetak Browser (Save as PDF).\n\n💡 TIPS: Centang opsi "Background graphics" di setelan cetak agar warna aksen desain Anda muncul sempurna.');
        
        // Switch to preview tab to make sure it's rendered and visible
        tabEditor.classList.remove('active');
        tabAiReviewer.classList.remove('active');
        tabPricing.classList.remove('active');
        tabPreview.classList.add('active');
        markdownInput.style.display = 'none';
        aiReviewerContainer.style.display = 'none';
        pricingContainer.style.display = 'none';
        dragZone.style.display = 'none';
        livePreviewContainer.style.display = 'block';
        renderLivePreview();
        
        // Let the DOM update, then open native print dialog
        setTimeout(() => {
            window.print();
        }, 300);
    }

    // Convert Button trigger
    btnConvert.addEventListener('click', async () => {
        const markdown = markdownInput.value.trim();
        if (!markdown) {
            await customAlert('Silakan tulis atau unggah konten Markdown terlebih dahulu!');
            return;
        }

        btnConvert.disabled = true;
        btnConvert.classList.add('loading');
        btnConvert.querySelector('.btn-text').textContent = 'Mengonversi...';
        showLoader('Sedang menyusun PDF Anda. Harap tunggu sebentar...');

        try {
            const response = await fetch('/api/convert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    markdown: markdown,
                    fontFamily: settingFont.value,
                    fontSize: settingSize.value,
                    lineHeight: settingHeight.value,
                    marginTB: settingMarginTB.value,
                    marginLR: settingMarginLR.value,
                    headingColor: settingColor.value
                })
            });

            if (!response.ok) {
                let hasFallback = false;
                try {
                    const errData = await response.json();
                    hasFallback = errData.fallback || false;
                } catch(e) {}
                
                if (hasFallback) {
                    hideLoader();
                    await triggerNativePrint();
                    return;
                }
                throw new Error('Gagal membuat PDF dari server.');
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = downloadUrl;
            a.download = getDynamicFilename();
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            document.body.removeChild(a);

        } catch (error) {
            console.error('Error saat konversi:', error);
            hideLoader();
            await triggerNativePrint();
        } finally {
            hideLoader();
            btnConvert.disabled = false;
            btnConvert.classList.remove('loading');
            btnConvert.querySelector('.btn-text').textContent = 'Unduh PDF';
        }
    });

    // --- AI REVIEWER FILE UPLOAD & ACTIONS STATE ---
    let uploadedAiCv = { type: '', name: '', data: '' };
    let uploadedAiJd = { type: '', name: '', data: '' };
    let completeMarkdownResult = '';

    // Handle CV file selection
    aiCvDropzone.addEventListener('click', (e) => {
        if (e.target.id !== 'btn-remove-ai-cv' && !e.target.closest('#btn-remove-ai-cv')) {
            aiCvFileInput.click();
        }
    });

    aiCvFileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleAiCvFile(e.target.files[0]);
        }
    });

    // Handle CV drag-drop
    aiCvDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        aiCvDropzone.classList.add('dragover');
    });
    aiCvDropzone.addEventListener('dragleave', () => {
        aiCvDropzone.classList.remove('dragover');
    });
    aiCvDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        aiCvDropzone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            handleAiCvFile(e.dataTransfer.files[0]);
        }
    });

    function handleAiCvFile(file) {
        const name = file.name;
        if (name.endsWith('.pdf')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64 = e.target.result.split(',')[1];
                uploadedAiCv = { type: 'pdf', name: name, data: base64 };
                aiCvFileName.textContent = name;
                aiCvFileBadge.style.display = 'flex';
            };
            reader.readAsDataURL(file);
        } else {
            customAlert('Unggah CV hanya mendukung berkas PDF saja.');
        }
    }

    // Remove CV file
    btnRemoveAiCv.addEventListener('click', (e) => {
        e.stopPropagation();
        uploadedAiCv = { type: '', name: '', data: '' };
        aiCvFileInput.value = '';
        aiCvFileBadge.style.display = 'none';
    });

    // Handle JD file selection
    aiJdDropzone.addEventListener('click', (e) => {
        if (e.target.id !== 'btn-remove-ai-jd' && !e.target.closest('#btn-remove-ai-jd')) {
            aiJdFileInput.click();
        }
    });

    aiJdFileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleAiJdFile(e.target.files[0]);
        }
    });

    // Handle JD drag-drop
    aiJdDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        aiJdDropzone.classList.add('dragover');
    });
    aiJdDropzone.addEventListener('dragleave', () => {
        aiJdDropzone.classList.remove('dragover');
    });
    aiJdDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        aiJdDropzone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            handleAiJdFile(e.dataTransfer.files[0]);
        }
    });

    function handleAiJdFile(file) {
        const name = file.name;
        if (name.endsWith('.pdf')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64 = e.target.result.split(',')[1];
                uploadedAiJd = { type: 'pdf', name: name, data: base64 };
                aiJdFileName.textContent = name;
                aiJdFileBadge.style.display = 'flex';
                
                // Clear text input since we uploaded a file
                jobDescriptionInput.value = '';
                jobDescriptionInput.disabled = true;
                jobDescriptionInput.placeholder = 'Menggunakan Job Description dari dokumen PDF yang diunggah...';
            };
            reader.readAsDataURL(file);
        } else {
            customAlert('Unggah Job Description hanya mendukung berkas PDF saja.');
        }
    }

    // Remove JD file
    btnRemoveAiJd.addEventListener('click', (e) => {
        e.stopPropagation();
        uploadedAiJd = { type: '', name: '', data: '' };
        aiJdFileInput.value = '';
        aiJdFileBadge.style.display = 'none';
        
        jobDescriptionInput.disabled = false;
        jobDescriptionInput.placeholder = 'Atau ketik/tempel persyaratan kerja, tanggung jawab, dan kualifikasi lowongan pekerjaan di sini...';
    });

    // AI CV Reviewer Action
    btnReviewCv.addEventListener('click', async () => {
        let cvPayload = null;
        let jdPayload = null;

        // 1. Prepare CV Payload
        if (uploadedAiCv.data) {
            cvPayload = { type: uploadedAiCv.type, data: uploadedAiCv.data };
        } else {
            const cvText = markdownInput.value.trim();
            if (!cvText) {
                await customAlert('Silakan isi CV Anda di Editor terlebih dahulu atau unggah file CV (PDF/MD) di atas.');
                return;
            }
            cvPayload = { type: 'text', data: cvText };
        }

        // 2. Prepare JD Payload
        if (uploadedAiJd.data) {
            jdPayload = { type: 'pdf', data: uploadedAiJd.data };
        } else {
            const jobDescText = jobDescriptionInput.value.trim();
            if (!jobDescText) {
                await customAlert('Silakan unggah dokumen PDF Job Description atau ketik/tempel detail lowongan pekerjaan.');
                return;
            }
            jdPayload = { type: 'text', data: jobDescText };
        }

        btnReviewCv.disabled = true;
        btnReviewCv.classList.add('loading');
        showLoader('Sedang melakukan analisis CV dengan AI. Harap tunggu sebentar...');

        try {
            const response = await fetch('/api/review-cv', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cv: cvPayload,
                    jobDescription: jdPayload
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Gagal melakukan analisis CV.');
            }

            const data = await response.json();

            // Store optimized markdown result
            completeMarkdownResult = data.completeMarkdown || '';

            // Populate ATS Match Score
            const score = typeof data.matchScore === 'number' ? data.matchScore : parseInt(data.matchScore) || 0;
            aiScoreValue.textContent = score;

            let scoreColor = '#ff5f56'; // Red (<50%)
            let scoreCommentText = 'Sangat Rendah (Banyak Red Flags & keywords yang terlewat)';
            
            if (score >= 75) {
                scoreColor = '#22c55e'; // Green (>75%)
                scoreCommentText = 'Sangat Tinggi (Kecocokan kuat dengan kualifikasi lowongan!)';
            } else if (score >= 50) {
                scoreColor = '#eab308'; // Yellow (50-75%)
                scoreCommentText = 'Kecocokan Sedang (Bisa ditingkatkan dengan rekomendasi di bawah)';
            }

            aiScoreValue.style.color = scoreColor;
            const scoreCircle = document.querySelector('.score-circle');
            if (scoreCircle) {
                scoreCircle.style.borderColor = scoreColor;
                scoreCircle.style.boxShadow = `4px 4px 0 ${scoreColor}`;
            }
            aiScoreComment.textContent = scoreCommentText;

            // Populate Missing Keywords
            aiKeywordsList.innerHTML = '';
            const keywords = Array.isArray(data.missingKeywords) ? data.missingKeywords : [];
            if (keywords.length > 0) {
                keywords.forEach(keyword => {
                    const li = document.createElement('li');
                    li.textContent = keyword;
                    aiKeywordsList.appendChild(li);
                });
            } else {
                const li = document.createElement('li');
                li.textContent = 'Tidak ada kata kunci penting yang terlewat!';
                aiKeywordsList.appendChild(li);
            }

            // Populate Red Flags
            aiFlagsList.innerHTML = '';
            const redFlags = Array.isArray(data.redFlags) ? data.redFlags : [];
            if (redFlags.length > 0) {
                redFlags.forEach(flag => {
                    const li = document.createElement('li');
                    li.textContent = flag;
                    aiFlagsList.appendChild(li);
                });
            } else {
                const li = document.createElement('li');
                li.textContent = 'Tidak ditemukan red flags kritis.';
                aiFlagsList.appendChild(li);
            }

            // Populate Rewritten Experience
            aiRewrittenExperience.value = data.rewrittenExperience || '';

            // Populate Skipped Sections
            aiSkippedSectionsList.innerHTML = '';
            const skippedSections = Array.isArray(data.skippedSections) ? data.skippedSections : [];
            if (skippedSections.length > 0) {
                skippedSections.forEach(item => {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'skipped-section-item';

                    const titleSpan = document.createElement('span');
                    titleSpan.className = 'skipped-section-title';
                    titleSpan.textContent = item.section || 'Bagian Dokumen';

                    const reasonSpan = document.createElement('span');
                    reasonSpan.className = 'skipped-section-reason';
                    reasonSpan.textContent = item.reason || 'Dilewati oleh recruiter/ATS.';

                    const suggestionDiv = document.createElement('div');
                    suggestionDiv.className = 'skipped-section-suggestion';

                    const suggestionTitle = document.createElement('span');
                    suggestionTitle.className = 'skipped-section-suggestion-title';
                    suggestionTitle.textContent = 'Saran Tulis Ulang (Scroll-Stopping):';

                    const suggestionBox = document.createElement('div');
                    suggestionBox.className = 'skipped-section-suggestion-box';
                    suggestionBox.textContent = item.suggestion || '';

                    suggestionDiv.appendChild(suggestionTitle);
                    suggestionDiv.appendChild(suggestionBox);

                    itemDiv.appendChild(titleSpan);
                    itemDiv.appendChild(reasonSpan);
                    itemDiv.appendChild(suggestionDiv);

                    aiSkippedSectionsList.appendChild(itemDiv);
                });
            } else {
                const emptyMsg = document.createElement('p');
                emptyMsg.style.fontStyle = 'italic';
                emptyMsg.style.fontSize = '12px';
                emptyMsg.style.color = '#6b7280';
                emptyMsg.textContent = 'Semua bagian resume Anda menarik dan terstruktur dengan baik!';
                aiSkippedSectionsList.appendChild(emptyMsg);
            }

            // Show Dashboard
            aiResultsDashboard.style.display = 'block';

            // Smooth scroll to the results dashboard
            setTimeout(() => {
                aiResultsDashboard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);

            await customAlert('Analisis CV selesai! Laporan audit ATS dan rekomendasi tulis ulang telah ditampilkan di bawah.');

        } catch (error) {
            console.error('Error saat melakukan review CV:', error);
            await customAlert(`Gagal melakukan review CV. Error: ${error.message}`);
        } finally {
            hideLoader();
            btnReviewCv.disabled = false;
            btnReviewCv.classList.remove('loading');
        }
    });

    // Copy Rewritten Experience to Clipboard
    btnCopyRewritten.addEventListener('click', async () => {
        const textToCopy = aiRewrittenExperience.value.trim();
        if (!textToCopy) {
            await customAlert('Tidak ada hasil tulis ulang untuk disalin!');
            return;
        }

        try {
            await navigator.clipboard.writeText(textToCopy);
            await customAlert('Bagian Pengalaman Kerja (Google XYZ) berhasil disalin ke clipboard! Silakan tempelkan kembali ke bagian Pengalaman Kerja Anda di tab EDITOR.');
        } catch (err) {
            console.error('Gagal menyalin:', err);
            // Fallback copy
            const textarea = document.createElement('textarea');
            textarea.value = textToCopy;
            textarea.style.position = 'fixed';
            textarea.style.top = '0';
            textarea.style.left = '0';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            try {
                document.execCommand('copy');
                await customAlert('Bagian Pengalaman Kerja (Google XYZ) berhasil disalin ke clipboard! Silakan tempelkan kembali ke bagian Pengalaman Kerja Anda di tab EDITOR.');
            } catch (copyErr) {
                await customAlert('Gagal menyalin teks secara otomatis. Silakan salin secara manual dari area teks.');
            }
            document.body.removeChild(textarea);
        }
    });

    // Apply Complete Markdown Result back to editor and redirect to Live Preview
    btnApplyToEditor.addEventListener('click', async () => {
        if (!completeMarkdownResult) {
            await customAlert('Tidak ada CV hasil optimasi AI untuk diterapkan. Silakan lakukan analisis terlebih dahulu!');
            return;
        }

        const confirmed = await customConfirm('Terapkan CV Markdown hasil optimasi AI ke Editor utama? Konten Editor Anda saat ini akan digantikan.');
        if (confirmed) {
            markdownInput.value = completeMarkdownResult;
            localStorage.setItem('md2cv_draft', completeMarkdownResult);
            
            // Clear current filename if any since CV is newly optimized
            currentFilename = '';
            uploadedFilename.style.display = 'none';
            uploadedFilename.textContent = '';
            
            runATSChecklist();
            renderLivePreview();

            // Auto-redirect to Live Preview tab
            tabEditor.classList.remove('active');
            tabAiReviewer.classList.remove('active');
            tabPricing.classList.remove('active');
            tabPreview.classList.add('active');
            markdownInput.style.display = 'none';
            aiReviewerContainer.style.display = 'none';
            pricingContainer.style.display = 'none';
            livePreviewContainer.style.display = 'block';
            
            await customAlert('CV hasil optimasi AI berhasil diterapkan ke Editor utama! Pratinjau dokumen PDF baru Anda sekarang aktif.');
        }
    });

    // Pricing plan mockup clicks
    btnBuyTokens.addEventListener('click', async () => {
        await customAlert('Fitur Pembayaran Simulasi: Anda akan diarahkan ke gerbang pembayaran Midtrans untuk membeli Paket Kredit AI (5 Kredit) seharga Rp 15.000 via QRIS / Transfer Bank.');
    });

    btnBuyUnlimited.addEventListener('click', async () => {
        await customAlert('Fitur Pembayaran Simulasi: Anda akan diarahkan ke gerbang pembayaran Midtrans untuk membeli Paket Akses Penuh 30 Hari seharga Rp 25.000 via QRIS / Transfer Bank.');
    });

    // Run initial checklist and preview render
    runATSChecklist();
    renderLivePreview();
});
