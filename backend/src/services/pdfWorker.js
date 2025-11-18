const rabbitmq = require('../config/rabbitmq');
const pdfService = require('./pdfService');
const Kyc = require('../models/Kyc');
const logger = require('../config/logger');

/**
 * Start the PDF generation worker
 * This worker listens for PDF generation requests on RabbitMQ
 */
async function startPdfWorker() {
  try {
    logger.pdf('Starting PDF Worker...');

    // Connect to RabbitMQ
    await rabbitmq.connect();

    // Start consuming messages from the PDF queue
    await rabbitmq.consumeQueue(
      rabbitmq.PDF_QUEUE,
      processPdfGenerationRequest,
      {
        prefetch: 1, // Process one PDF at a time
        requeue: true // Requeue failed messages
      }
    );

    logger.pdf('PDF Worker started successfully');
    logger.pdf(`Listening for PDF generation requests on queue: ${rabbitmq.PDF_QUEUE}`);
  } catch (error) {
    logger.error('Failed to start PDF Worker', { error: error.message });
    throw error;
  }
}

/**
 * Process a PDF generation request
 * @param {Object} message - The message from RabbitMQ
 */
async function processPdfGenerationRequest(message) {
  const { kycId, requestedBy, priority } = message;

  logger.pdf(`Processing PDF generation for KYC ID: ${kycId}`, { requestedBy, priority: priority || 'normal' });

  try {
    // Fetch the KYC data from database
    const kycData = await Kyc.findById(kycId).populate('reviewedBy', 'name email');

    if (!kycData) {
      logger.error(`KYC record not found: ${kycId}`);
      throw new Error('KYC record not found');
    }

    // Check if PDF already exists and is recent (less than 1 hour old)
    if (kycData.pdfPath && kycData.pdfGeneratedAt) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      if (new Date(kycData.pdfGeneratedAt) > oneHourAgo) {
        logger.pdf(`Recent PDF already exists for KYC ${kycId}, skipping generation`);
        return;
      }
    }

    // Generate the PDF
    logger.pdf('Generating PDF...', { kycId });
    const pdfPath = await pdfService.generateKycPdf(kycData);

    // Update the KYC record with PDF path
    kycData.pdfPath = pdfPath;
    kycData.pdfGeneratedAt = new Date();
    await kycData.save();

    logger.pdf(`PDF generated successfully for KYC ${kycId}`, { pdfPath });

    return {
      success: true,
      kycId,
      pdfPath,
      generatedAt: kycData.pdfGeneratedAt
    };

  } catch (error) {
    logger.error(`Error generating PDF for KYC ${kycId}`, { error: error.message });
    
    // Log the error to database (optional)
    try {
      const kycData = await Kyc.findById(kycId);
      if (kycData) {
        kycData.pdfError = error.message;
        kycData.pdfErrorAt = new Date();
        await kycData.save();
      }
    } catch (dbError) {
      logger.error('Failed to log PDF error to database', { error: dbError.message });
    }

    throw error;
  }
}

/**
 * Stop the PDF worker
 */
async function stopPdfWorker() {
  try {
    logger.pdf('Stopping PDF Worker...');
    await rabbitmq.close();
    logger.pdf('PDF Worker stopped');
  } catch (error) {
    logger.error('Error stopping PDF Worker', { error: error.message });
  }
}

/**
 * Get worker statistics
 */
async function getWorkerStats() {
  try {
    const stats = await rabbitmq.getQueueStats(rabbitmq.PDF_QUEUE);
    return stats;
  } catch (error) {
    logger.error('Error getting worker stats', { error: error.message });
    throw error;
  }
}

module.exports = {
  startPdfWorker,
  stopPdfWorker,
  getWorkerStats,
  processPdfGenerationRequest
};
