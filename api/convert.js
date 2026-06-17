const path = require('path');
const { marked } = require('marked');

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

const localMarkedOptions = {
    renderer: renderer,
    gfm: true,
    breaks: true
};

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

    // Bypass Puppeteer on Vercel production environments
    if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_VERSION) {
        return res.status(500).json({ 
            error: 'Server-side PDF conversion is disabled on Vercel to maintain high performance. Please use client-side print layout.',
            fallback: true 
        });
    }

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
        const customRenderer = new marked.Renderer();
        customRenderer.paragraph = renderer.paragraph;
        const rawHtml = marked.parse(markdown, { renderer: customRenderer, gfm: true, breaks: true });
        
        const fullHtml = htmlTemplate({
            bodyContent: rawHtml,
            fontFamily,
            fontSize,
            lineHeight,
            marginTB,
            marginLR,
            headingColor
        });

        // Dynamic require of puppeteer-core to prevent static analyzer bundling
        const puppeteer = eval("require('puppeteer-core')");
        
        console.log('Menjalankan Puppeteer di lingkungan Lokal (Google Chrome)...');
        const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
        const browser = await puppeteer.launch({
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
};
