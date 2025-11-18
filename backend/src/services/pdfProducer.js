const rabbitmq = require('../config/rabbitmq');
const logger = require('../config/logger');

/**
 * Request PDF generation for a KYC application
 * @param {string} kycId - The ID of the KYC application
 * @param {string} requestedBy - The admin ID who requested the PDF
 * @param {number} priority - Priority level (1-10, higher is more important)
 * @returns {Promise<boolean>}
 */
async function requestPdfGeneration(kycId, requestedBy, priority = 5) {
  try {
    logger.pdf(`Requesting PDF generation for KYC ${kycId}`, { requestedBy, priority });

    const message = {
      kycId,
      requestedBy,
      priority,
      requestedAt: new Date().toISOString()
    };

    await rabbitmq.sendToQueue(rabbitmq.PDF_QUEUE, message, { priority });

    logger.pdf(`PDF generation request sent to queue for KYC ${kycId}`);
    return true;

  } catch (error) {
    logger.error('Failed to request PDF generation', { error: error.message, kycId });
    throw error;
  }
}

/**
 * Request batch PDF generation for multiple KYC applications
 * @param {Array<string>} kycIds - Array of KYC IDs
 * @param {string} requestedBy - The admin ID who requested the PDFs
 * @param {number} priority - Priority level (1-10)
 * @returns {Promise<Object>}
 */
async function requestBatchPdfGeneration(kycIds, requestedBy, priority = 3) {
  try {
    logger.pdf(`Requesting batch PDF generation for ${kycIds.length} KYC applications`, { requestedBy, priority });

    const results = {
      total: kycIds.length,
      successful: 0,
      failed: 0,
      errors: []
    };

    for (const kycId of kycIds) {
      try {
        await requestPdfGeneration(kycId, requestedBy, priority);
        results.successful++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          kycId,
          error: error.message
        });
      }
    }

    logger.pdf(`Batch PDF generation: ${results.successful} successful, ${results.failed} failed`, { results });
    return results;

  } catch (error) {
    logger.error('Failed to request batch PDF generation', { error: error.message });
    throw error;
  }
}

/**
 * Get the queue statistics
 * @returns {Promise<Object>}
 */
async function getQueueStatus() {
  try {
    const stats = await rabbitmq.getQueueStats(rabbitmq.PDF_QUEUE);
    return {
      success: true,
      data: stats
    };
  } catch (error) {
    logger.error('Failed to get queue status', { error: error.message });
    throw error;
  }
}

module.exports = {
  requestPdfGeneration,
  requestBatchPdfGeneration,
  getQueueStatus
};
