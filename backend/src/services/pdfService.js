const PDFDocument = require('pdfkit');
const fs = require('node:fs');
const path = require('node:path');

// Ensure the pdfs directory exists
const PDF_DIR = path.join(__dirname, '../../pdfs');
if (!fs.existsSync(PDF_DIR)) {
  fs.mkdirSync(PDF_DIR, { recursive: true });
}

/**
 * Generate a PDF document for a KYC application
 * @param {Object} kycData - The KYC data to include in the PDF
 * @returns {Promise<string>} - Path to the generated PDF file
 */
async function generateKycPdf(kycData) {
  return new Promise((resolve, reject) => {
    try {
      // Create a unique filename
      const timestamp = Date.now();
      const filename = `kyc_${kycData._id}_${timestamp}.pdf`;
      const filePath = path.join(PDF_DIR, filename);

      // Create a PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50
        }
      });

      // Pipe the PDF to a file
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Add header
      doc
        .fontSize(24)
        .fillColor('#2c3e50')
        .text('KYC Application Report', { align: 'center' })
        .moveDown(0.5);

      // Add a line separator
      doc
        .strokeColor('#3498db')
        .lineWidth(2)
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .stroke()
        .moveDown(1);

      // Add application ID and submission date
      doc
        .fontSize(10)
        .fillColor('#7f8c8d')
        .text(`Application ID: ${kycData._id}`, { align: 'right' })
        .text(`Generated: ${new Date().toLocaleString()}`, { align: 'right' })
        .moveDown(1.5);

      // Add personal information section
      addSection(doc, 'Personal Information');
      
      addField(doc, 'Full Name', kycData.name || 'N/A');
      addField(doc, 'Email Address', kycData.email || 'N/A');
      addField(doc, 'National ID (NID)', kycData.nid || 'N/A');
      addField(doc, 'Occupation', kycData.occupation || 'N/A');
      addField(doc, 'Address', kycData.address || 'N/A', true);

      doc.moveDown(1);

      // Add application status section
      addSection(doc, 'Application Status');
      
      const statusColors = {
        pending: '#f39c12',
        approved: '#27ae60',
        rejected: '#e74c3c',
        under_review: '#3498db'
      };

      const statusColor = statusColors[kycData.status] || '#95a5a6';
      
      doc
        .fontSize(12)
        .fillColor('#2c3e50')
        .text('Status: ', { continued: true })
        .fillColor(statusColor)
        .text(kycData.status.toUpperCase().replace('_', ' '));

      addField(doc, 'Submitted At', new Date(kycData.submittedAt).toLocaleString());
      
      if (kycData.reviewedAt) {
        addField(doc, 'Reviewed At', new Date(kycData.reviewedAt).toLocaleString());
      }

      if (kycData.reviewedBy) {
        addField(doc, 'Reviewed By', kycData.reviewedBy.name || kycData.reviewedBy);
      }

      if (kycData.reviewNotes) {
        doc.moveDown(0.5);
        addField(doc, 'Review Notes', kycData.reviewNotes, true);
      }

      doc.moveDown(1);

      // Add AI summary section if available
      if (kycData.aiSummary) {
        addSection(doc, 'AI-Generated Summary');
        
        doc
          .fontSize(11)
          .fillColor('#34495e')
          .text(kycData.aiSummary, {
            align: 'justify',
            lineGap: 5
          });

        doc.moveDown(1);
      }

      // Add footer
      const bottomY = doc.page.height - 70;
      doc
        .fontSize(8)
        .fillColor('#95a5a6')
        .text(
          'This is an auto-generated document. For verification, please contact the system administrator.',
          50,
          bottomY,
          {
            align: 'center',
            width: 495
          }
        );

      // Add page border
      doc
        .rect(40, 40, doc.page.width - 80, doc.page.height - 80)
        .strokeColor('#bdc3c7')
        .lineWidth(1)
        .stroke();

      // Finalize the PDF
      doc.end();

      // Wait for the stream to finish
      stream.on('finish', () => {
        console.log(`PDF generated successfully: ${filename}`);
        resolve(filePath);
      });

      stream.on('error', (err) => {
        console.error('Error writing PDF:', err);
        reject(err);
      });

    } catch (error) {
      console.error('Error generating PDF:', error);
      reject(error);
    }
  });
}

/**
 * Add a section header
 */
function addSection(doc, title) {
  doc
    .fontSize(16)
    .fillColor('#2c3e50')
    .text(title, { underline: true })
    .moveDown(0.5);
}

/**
 * Add a field with label and value
 */
function addField(doc, label, value, isLongText = false) {
  doc
    .fontSize(12)
    .fillColor('#2c3e50')
    .text(label + ': ', { continued: !isLongText })
    .fillColor('#34495e');

  if (isLongText) {
    doc.moveDown(0.3);
    doc.text(value, {
      align: 'left',
      indent: 20,
      lineGap: 3
    });
  } else {
    doc.text(value);
  }

  doc.moveDown(0.5);
}

/**
 * Delete a PDF file
 */
async function deletePdf(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`PDF deleted: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting PDF:', error);
    throw error;
  }
}

/**
 * Check if a PDF file exists
 */
function pdfExists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * Get PDF directory path
 */
function getPdfDirectory() {
  return PDF_DIR;
}

module.exports = {
  generateKycPdf,
  deletePdf,
  pdfExists,
  getPdfDirectory
};
