const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const puppeteer = require('puppeteer-core');

// Custom marked renderer to output clean tags
const renderer = new marked.Renderer();

// Custom paragraph renderer
renderer.paragraph = function({ tokens }) {
    const text = this.parser.parseInline(tokens);
    
    // Check if paragraph contains contact details (contains email or phone or pipe signs)
    if (text.includes('@') && text.includes('|')) {
        return `<p class="contact-details">${text}</p>`;
    }
    // Check if paragraph contains links to portfolio/linkedin
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

const htmlTemplate = (bodyContent) => `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Resume</title>
    <style>
        @page {
            size: A4;
            margin: 0.8cm 1.2cm 0.8cm 1.2cm;
        }
        
        * {
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            color: #000000;
            line-height: 1.25;
            margin: 0;
            padding: 0;
            font-size: 8.5pt;
            background-color: #ffffff;
        }

        h1 {
            font-size: 15pt;
            font-weight: bold;
            text-transform: uppercase;
            margin: 0 0 1px 0;
            color: #000000;
            text-align: center;
            letter-spacing: 0.5px;
        }

        /* Job Title right below H1 */
        .job-title {
            text-align: center;
            font-size: 9.5pt;
            font-weight: bold;
            letter-spacing: 0.5px;
            margin: 0 0 4px 0;
            color: #000000;
            text-transform: uppercase;
        }

        /* Contact Details & Links */
        .contact-details, .contact-links {
            text-align: center;
            font-size: 8pt;
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
            font-size: 9.5pt;
            font-weight: bold;
            color: #000000;
            border-bottom: 1px solid #000000;
            padding-bottom: 1px;
            margin-top: 10px;
            margin-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            page-break-after: avoid;
        }

        h3 {
            font-size: 8.5pt;
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
            font-size: 8.5pt;
            font-weight: bold;
            color: #000000;
        }
        
        .flex-row em {
            font-size: 8.5pt;
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
            font-size: 8pt;
            margin-top: 0px;
            margin-bottom: 1px;
        }
        
        /* GitHub repository line below tech stack */
        h3 + p + p {
            font-size: 8pt;
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

async function convertMdToPdf(inputPath, outputPath) {
    try {
        console.log(`Membaca file Markdown: ${inputPath}...`);
        let mdContent = fs.readFileSync(inputPath, 'utf-8');
        
        console.log('Pre-processing header block (Name and Job Title)...');
        // Match name heading (# NAME) and job title (**JOB TITLE**) at the start of the file
        mdContent = mdContent.replace(/^#\s+([^\r\n]+)\s*[\r\n]+\*\*([^\r\n]+)\*\*/m, (match, name, title) => {
            return `<h1>${name}</h1>\n<div class="job-title">${title}</div>`;
        });

        console.log('Pre-processing title & date rows...');
        // Match: **Title** followed by newline/carriage return and *Date*
        // Make sure it doesn't match list items starting with asterisks
        mdContent = mdContent.replace(/\*\*(.*?)\*\*\s*[\r\n]+\*([^*]+)\*(?=\s*[\r\n]|$)/g, (match, title, date) => {
            return `<div class="flex-row"><strong>${title}</strong><em>${date}</em></div>`;
        });
        
        console.log('Mengonversi Markdown ke HTML...');
        const rawHtml = marked.parse(mdContent);
        const fullHtml = htmlTemplate(rawHtml);
        
        console.log('Menjalankan Puppeteer (menggunakan Google Chrome lokal)...');
        const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
        
        const browser = await puppeteer.launch({
            executablePath: executablePath,
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        console.log('Merender konten...');
        await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
        
        console.log(`Menyimpan PDF ke: ${outputPath}...`);
        await page.pdf({
            path: outputPath,
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
        console.log('Selesai! Konversi berhasil dilakukan.');
    } catch (error) {
        console.error('Error saat konversi:', error);
    }
}

// Check arguments
const args = process.argv.slice(2);
if (args.length >= 2) {
    const input = path.resolve(args[0]);
    const output = path.resolve(args[1]);
    convertMdToPdf(input, output);
} else {
    console.log('Penggunaan: node convert.js <input_path.md> <output_path.pdf>');
}
