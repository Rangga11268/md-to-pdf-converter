document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const markdownInput = document.getElementById('markdown-input');
    const btnClear = document.getElementById('btn-clear');
    const btnDownloadMd = document.getElementById('btn-download-md');
    const fileUpload = document.getElementById('file-upload');
    const dragZone = document.getElementById('drag-zone');
    const uploadedFilename = document.getElementById('uploaded-filename');
    const btnConvert = document.getElementById('btn-convert');
    
    // Tabs
    const tabEditor = document.getElementById('tab-editor');
    const tabPreview = document.getElementById('tab-preview');
    const livePreviewContainer = document.getElementById('live-preview-container');
    const a4Sheet = document.getElementById('a4-sheet');
    
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

    let currentFilename = '';

    // Load draft from LocalStorage if available
    const savedDraft = localStorage.getItem('md2cv_draft');
    if (savedDraft) {
        markdownInput.value = savedDraft;
    }

    // Save draf automatically to LocalStorage on typing
    markdownInput.addEventListener('input', () => {
        const value = markdownInput.value;
        localStorage.setItem('md2cv_draft', value);
        runATSChecklist();
        renderLivePreview();
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
    btnClear.addEventListener('click', () => {
        if (confirm('Apakah Anda yakin ingin mengosongkan editor? Draf lama akan dihapus.')) {
            markdownInput.value = '';
            currentFilename = '';
            localStorage.removeItem('md2cv_draft');
            uploadedFilename.style.display = 'none';
            uploadedFilename.textContent = '';
            runATSChecklist();
            renderLivePreview();
            markdownInput.focus();
        }
    });

    // Download MD file
    btnDownloadMd.addEventListener('click', () => {
        const text = markdownInput.value.trim();
        if (!text) {
            alert('Editor kosong! Tidak ada konten untuk diunduh.');
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
    function handleFile(file) {
        if (!file.name.endsWith('.md')) {
            alert('Silakan unggah file CV dengan format .md saja.');
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
        tabEditor.classList.add('active');
        livePreviewContainer.style.display = 'none';
        markdownInput.style.display = 'block';
    });

    tabPreview.addEventListener('click', () => {
        tabEditor.classList.remove('active');
        tabPreview.classList.add('active');
        markdownInput.style.display = 'none';
        livePreviewContainer.style.display = 'block';
        renderLivePreview();
    });

    // Live Render compilation
    function renderLivePreview() {
        if (typeof marked === 'undefined') return;

        let md = markdownInput.value.trim();
        if (!md) {
            a4Sheet.innerHTML = '<p style="color: #6b7280; font-style: italic; text-align: center; margin-top: 40px;">Belum ada konten untuk ditampilkan. Silakan tulis sesuatu di Editor.</p>';
            return;
        }

        // Apply HTML pre-processing matching the backend
        md = md.replace(/^#\s+([^\r\n]+)\s*[\r\n]+\*\*([^\r\n]+)\*\*/m, (match, name, title) => {
            return `<h1>${name}</h1>\n<div class="job-title">${title}</div>`;
        });

        md = md.replace(/\*\*(.*?)\*\*\s*[\r\n]+\*([^*]+)\*(?=\s*[\r\n]|$)/g, (match, title, date) => {
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

        const htmlContent = marked.parse(md, { renderer: customRenderer });
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
        
        // 1. Contact: Check if it has email (contains @) and phone number or similar
        const hasContact = text.includes('@') && (text.match(/[\d+]{7,}/) || text.includes('|'));
        toggleCheck('chk-contact', hasContact);

        // 2. Profile: Check for "PROFIL", "RINGKASAN", "SUMMARY", or "TENTANG" headings
        const hasProfile = /##\s*(PROFIL|RINGKASAN|SUMMARY|TENTANG)/i.test(text);
        toggleCheck('chk-profile', hasProfile);

        // 3. Skills: Check for "KEAHLIAN", "KUALIFIKASI", or "SKILLS" headings
        const hasSkills = /##\s*(KEAHLIAN|KUALIFIKASI|SKILLS|KEMAMPUAN)/i.test(text);
        toggleCheck('chk-skills', hasSkills);

        // 4. Experience: Check for "PENGALAMAN", "WORK", "EXPERIENCE", or "PROYEK" headings
        const hasExperience = /##\s*(PENGALAMAN|WORK|EXPERIENCE|PROYEK|PROJECT)/i.test(text);
        toggleCheck('chk-experience', hasExperience);

        // 5. Education: Check for "PENDIDIKAN" or "EDUCATION" headings
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

    // Convert Button trigger
    btnConvert.addEventListener('click', async () => {
        const markdown = markdownInput.value.trim();
        if (!markdown) {
            alert('Silakan tulis atau unggah konten CV Markdown terlebih dahulu!');
            return;
        }

        // Disable button & show loading
        btnConvert.disabled = true;
        btnConvert.classList.add('loading');
        btnConvert.querySelector('.btn-text').textContent = 'Mengonversi CV...';

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
                    headingColor: settingColor.value // Send selected color accent to the backend
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Gagal membuat PDF CV.');
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
            alert(`Error: ${error.message}`);
        } finally {
            btnConvert.disabled = false;
            btnConvert.classList.remove('loading');
            btnConvert.querySelector('.btn-text').textContent = 'Unduh PDF CV';
        }
    });

    // Run initial checklist and preview render
    runATSChecklist();
    renderLivePreview();
});
