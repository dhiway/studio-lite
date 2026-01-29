import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const DEFAULT_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Credential Design</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        
        body { 
            font-family: 'Inter', sans-serif; 
            margin: 0;
            padding: 40px; 
            background: #ffffff;
            color: #000;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .container { 
            background: rgba(255, 255, 255, 0.05); 
            backdrop-filter: blur(10px);
            padding: 40px; 
            border-radius: 24px; 
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 20px 40px rgba(0,0,0,0.4); 
            max-width: 800px;
            width: 100%;
        }
        h1 { 
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 8px;
            color: #60a5fa;
        }

        p {
            color: #9ca3af;
            margin-bottom: 32px;
        }

        table { 
            width: 100%; 
            border-collapse: separate; 
            border-spacing: 0;
            margin-top: 20px;
            color: #000;
        }

        th, td { 
            padding: 16px; 
            text-align: left;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        th { 
            color: #60a5fa;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 12px;
            letter-spacing: 0.05em;
        }

        td {
            font-size: 15px;
            color: #000;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Credential Subject</h1>
        <p>Verified Information</p>
        {{subjectTable}}
    </div>
</body>
</html>`;

export const STORAGE_KEY = 'credential_design_template';

export const generateSubjectTable = (subject: any) => {
    if (!subject) return "<p>No subject data available</p>";

    let tableHtml = "<table><thead><tr><th>Attribute</th><th>Value</th></tr></thead><tbody>";

    Object.entries(subject).forEach(([key, value]) => {
        if (key !== '@context' && key !== 'id' && key !== 'type') {
            const displayKey = key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()).replace(/_/g, " ");
            const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
            tableHtml += `<tr><td style="color: #000">${displayKey}</td><td style="color: #000">${displayValue}</td></tr>`;
        }
    });

    tableHtml += "</tbody></table>";
    return tableHtml;
};

export const processTemplate = (template: string, subject: any, qrUrl?: string) => {
    const subjectTable = generateSubjectTable(subject);
    let processed = template.replace("{{subjectTable}}", subjectTable);
    
    if (qrUrl) {
        const qrImg = `<img src="${qrUrl}" alt="QR Code" style="width: 150px; height: 150px; margin-top: 20px;" />`;
        processed = processed.replace("{{qrCode}}", qrImg);
        
        if (!template.includes("{{qrCode}}")) {
             processed = processed.replace(subjectTable, subjectTable + `<div style="margin-top: 20px;">${qrImg}</div>`);
        }
    }
    
    return processed;
};

export const downloadHtml = (html: string, filename: string) => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
};

export const downloadPdf = async (html: string, filename: string) => {
    // Create an iframe to isolate styles (prevent oklch errors from global app styles)
    const iframe = document.createElement('iframe');
    iframe.style.position = "fixed";
    iframe.style.left = "-9999px";
    iframe.style.width = "800px";
    iframe.style.height = "1200px"; // Arbitrary height to fit content
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    // Write content to iframe
    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) {
        document.body.removeChild(iframe);
        throw new Error("Failed to access iframe document");
    }

    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();

    // Wait for images/fonts in iframe to load
    await new Promise((resolve) => {
        iframe.onload = resolve;
        // Fallback if onload doesn't fire (e.g. no external resources)
        setTimeout(resolve, 500);
    });

    try {
        const body = iframeDoc.body;
        const canvas = await html2canvas(body, {
            useCORS: true,
            scale: 2,
            windowWidth: 800, // Ensure consistent width
            logging: false,
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(filename);
    } catch (error) {
        console.error("Error generating PDF:", error);
        throw error;
    } finally {
        document.body.removeChild(iframe);
    }
};
