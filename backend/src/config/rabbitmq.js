const amqp = require('amqplib');
const logger = require('./logger');

let connection = null;
let channel = null;

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const PDF_QUEUE = 'pdf_generation_queue';

/**
 * Connect to RabbitMQ server
 */
async function connect() {
  try {
    if (connection) {
      logger.rabbitmq('Already connected to RabbitMQ');
      return connection;
    }

    logger.rabbitmq('Connecting to RabbitMQ...');
    connection = await amqp.connect(RABBITMQ_URL);
    
    logger.rabbitmq('RabbitMQ connected successfully');

    // Handle connection errors
    connection.on('error', (err) => {
      logger.error('RabbitMQ connection error', { error: err.message });
      connection = null;
      channel = null;
    });

    connection.on('close', () => {
      logger.rabbitmq('RabbitMQ connection closed');
      connection = null;
      channel = null;
    });

    return connection;
  } catch (error) {
    logger.error('Failed to connect to RabbitMQ', { error: error.message });
    throw error;
  }
}

/**
 * Get or create a channel
 */
async function getChannel() {
  try {
    if (channel) {
      return channel;
    }

    if (!connection) {
      await connect();
    }

    logger.rabbitmq('Creating RabbitMQ channel...');
    channel = await connection.createChannel();

    // Assert the queue exists
    await channel.assertQueue(PDF_QUEUE, {
      durable: true, // Queue survives broker restart
      maxPriority: 10 // Enable priority queue
    });

    logger.rabbitmq(`Queue "${PDF_QUEUE}" ready`);

    return channel;
  } catch (error) {
    logger.error('Failed to create channel', { error: error.message });
    throw error;
  }
}

/**
 * Send a message to the queue
 */
async function sendToQueue(queueName, message, options = {}) {
  try {
    const ch = await getChannel();
    const messageBuffer = Buffer.from(JSON.stringify(message));

    const defaultOptions = {
      persistent: true, // Message survives broker restart
      priority: options.priority || 5
    };

    ch.sendToQueue(queueName, messageBuffer, { ...defaultOptions, ...options });
    logger.rabbitmq(`Message sent to queue "${queueName}"`, { message });
    
    return true;
  } catch (error) {
    logger.error('Failed to send message to queue', { error: error.message, queueName });
    throw error;
  }
}

/**
 * Consume messages from the queue
 */
async function consumeQueue(queueName, callback, options = {}) {
  try {
    const ch = await getChannel();

    // Set prefetch to process one message at a time
    await ch.prefetch(options.prefetch || 1);

    logger.rabbitmq(`Waiting for messages in queue "${queueName}"...`);

    ch.consume(
      queueName,
      async (msg) => {
        if (msg) {
          try {
            const content = JSON.parse(msg.content.toString());
            logger.rabbitmq(`Received message from "${queueName}"`, { content });

            // Execute the callback
            await callback(content, msg);

            // Acknowledge the message
            ch.ack(msg);
            logger.rabbitmq('Message processed and acknowledged');
          } catch (error) {
            logger.error('Error processing message', { error: error.message, queueName });

            // Reject and requeue the message if processing fails
            if (options.requeue !== false) {
              ch.nack(msg, false, true);
              logger.rabbitmq('Message rejected and requeued');
            } else {
              ch.nack(msg, false, false);
              logger.rabbitmq('Message rejected without requeue');
            }
          }
        }
      },
      {
        noAck: false // Manual acknowledgment
      }
    );

    return ch;
  } catch (error) {
    logger.error('Failed to consume queue', { error: error.message, queueName });
    throw error;
  }
}

/**
 * Close the connection
 */
async function close() {
  try {
    if (channel) {
      await channel.close();
      channel = null;
    }

    if (connection) {
      await connection.close();
      connection = null;
    }

    logger.rabbitmq('RabbitMQ connection closed');
  } catch (error) {
    logger.error('Error closing RabbitMQ connection', { error: error.message });
  }
}

/**
 * Get queue statistics
 */
async function getQueueStats(queueName) {
  try {
    const ch = await getChannel();
    const queueInfo = await ch.checkQueue(queueName);
    
    return {
      queue: queueName,
      messageCount: queueInfo.messageCount,
      consumerCount: queueInfo.consumerCount
    };
  } catch (error) {
    logger.error('Failed to get queue stats', { error: error.message, queueName });
    throw error;
  }
}

module.exports = {
  connect,
  getChannel,
  sendToQueue,
  consumeQueue,
  close,
  getQueueStats,
  PDF_QUEUE
};
