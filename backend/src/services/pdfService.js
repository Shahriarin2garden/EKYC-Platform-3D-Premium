const PDFDocument = require('pdfkit');
const fs = require('node:fs');
const path = require('node:path');
const logger = require('../config/logger');

// Ensure the pdfs directory exists
const PDF_DIR = path.join(__dirname, '../../pdfs');
try {
  if (!fs.existsSync(PDF_DIR)) {
    fs.mkdirSync(PDF_DIR, { recursive: true });
    logger.info('PDF directory created', { path: PDF_DIR });
  } else {
    logger.info('PDF directory exists', { path: PDF_DIR });
  }
} catch (error) {
  logger.error('Failed to create PDF directory', { error: error.message, path: PDF_DIR });
}

/**
 * Generate a PDF document for a KYC application
 * @param {Object} kycData - The KYC data to include in the PDF
 * @returns {Promise<string>} - Path to the generated PDF file
 */
async function generateKycPdf(kycData) {
  return new Promise((resolve, reject) => {
    try {
      logger.pdf('Starting PDF generation', { kycId: kycData._id });
      
      // Create a unique filename
      const timestamp = Date.now();
      const filename = `kyc_${kycData._id}_${timestamp}.pdf`;
      const filePath = path.join(PDF_DIR, filename);

      logger.pdf('PDF path created', { filename, filePath });

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
        logger.pdf(`PDF generated successfully: ${filename}`);
        resolve(filePath);
      });

      stream.on('error', (err) => {
        logger.error('Error writing PDF', { error: err.message, filename });
        reject(err);
      });

    } catch (error) {
      logger.error('Error generating PDF', { error: error.message });
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
      logger.pdf(`PDF deleted: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    logger.error('Error deleting PDF', { error: error.message, filePath });
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

/**
 * Generate PDF as a buffer (for streaming without saving to disk)
 * This is useful for ephemeral filesystems like Railway
 * @param {Object} kycData - The KYC data to include in the PDF
 * @returns {Promise<Buffer>} - Buffer containing the PDF data
 */
async function generateKycPdfBuffer(kycData) {
  return new Promise((resolve, reject) => {
    try {
      logger.pdf('Generating PDF buffer (in-memory)', { kycId: kycData._id });
      
      const buffers = [];
      
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

      // Collect data chunks
      doc.on('data', (chunk) => buffers.push(chunk));
      
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        logger.pdf('PDF buffer generated successfully', { 
          kycId: kycData._id, 
          size: pdfBuffer.length 
        });
        resolve(pdfBuffer);
      });

      doc.on('error', (err) => {
        logger.error('Error generating PDF buffer', { error: err.message });
        reject(err);
      });

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
        .lineTo(doc.page.width - 50, doc.y)
        .stroke()
        .moveDown(1);

      // Application Details Section
      doc
        .fontSize(18)
        .fillColor('#2c3e50')
        .text('Application Details', { underline: true })
        .moveDown(0.5);

      // Personal Information
      doc.fontSize(12).fillColor('#34495e');

      const details = [
        { label: 'Applicant Name', value: kycData.name || 'N/A' },
        { label: 'Email Address', value: kycData.email || 'N/A' },
        { label: 'National ID', value: kycData.nid || 'Not Provided' },
        { label: 'Address', value: kycData.address || 'Not Provided' },
        { label: 'Occupation', value: kycData.occupation || 'Not Provided' },
        { label: 'Application Status', value: (kycData.status || 'pending').toUpperCase() },
        { label: 'Submission Date', value: kycData.submittedAt ? new Date(kycData.submittedAt).toLocaleString() : 'N/A' }
      ];

      details.forEach(detail => {
        doc
          .fontSize(11)
          .fillColor('#7f8c8d')
          .text(`${detail.label}:`, { continued: true })
          .fillColor('#2c3e50')
          .text(` ${detail.value}`)
          .moveDown(0.3);
      });

      // AI Summary Section
      if (kycData.aiSummary) {
        doc
          .moveDown(1)
          .fontSize(18)
          .fillColor('#2c3e50')
          .text('AI-Generated Summary', { underline: true })
          .moveDown(0.5);

        doc
          .fontSize(11)
          .fillColor('#34495e')
          .text(kycData.aiSummary, {
            align: 'justify',
            lineGap: 3
          })
          .moveDown(1);
      }

      // Review Information
      if (kycData.reviewedBy || kycData.reviewNotes) {
        doc
          .fontSize(18)
          .fillColor('#2c3e50')
          .text('Review Information', { underline: true })
          .moveDown(0.5);

        if (kycData.reviewedBy) {
          doc
            .fontSize(11)
            .fillColor('#7f8c8d')
            .text('Reviewed By:', { continued: true })
            .fillColor('#2c3e50')
            .text(` ${kycData.reviewedBy.name || kycData.reviewedBy.email}`)
            .moveDown(0.3);
        }

        if (kycData.reviewedAt) {
          doc
            .fontSize(11)
            .fillColor('#7f8c8d')
            .text('Review Date:', { continued: true })
            .fillColor('#2c3e50')
            .text(` ${new Date(kycData.reviewedAt).toLocaleString()}`)
            .moveDown(0.3);
        }

        if (kycData.reviewNotes) {
          doc
            .moveDown(0.3)
            .fontSize(11)
            .fillColor('#7f8c8d')
            .text('Review Notes:')
            .fillColor('#34495e')
            .text(kycData.reviewNotes, {
              align: 'justify',
              lineGap: 3
            });
        }
      }

      // Footer
      doc
        .moveDown(2)
        .fontSize(9)
        .fillColor('#95a5a6')
        .text(
          `Generated on ${new Date().toLocaleString()} | EKYC System`,
          50,
          doc.page.height - 50,
          { align: 'center' }
        );

      // Add page border
      doc
        .rect(40, 40, doc.page.width - 80, doc.page.height - 80)
        .strokeColor('#bdc3c7')
        .lineWidth(1)
        .stroke();

      // Finalize the PDF
      doc.end();

    } catch (error) {
      logger.error('Error generating PDF buffer', { error: error.message, stack: error.stack });
      reject(error);
    }
  });
}

module.exports = {
  generateKycPdf,
  generateKycPdfBuffer,
  deletePdf,
  pdfExists,
  getPdfDirectory
};
