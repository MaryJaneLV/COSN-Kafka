const { Kafka } = require('kafkajs');

// Create a kafka client
const kafka = new Kafka({
  clientId: 'consumer',
  brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
});

// Register a consumer for messages you want to receive
const consumer = kafka.consumer({ groupId: 'test-group' });

// Register a producer if you want to return responses to received messages
const producer = kafka.producer();

// Example of receiving a message from a queue ("fire and forget")
const receiveInQueueExample = async () => {
  // Connect the consumer
  await consumer.connect();
  console.log('Consumer connected successfully');

  // Subscribe to a topic where the messages are sent to
  await consumer.subscribe({
    topic: 'test-topic',
    fromBeginning: true,
  });

  // Execute logic once a message is received in the topic
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const messageData = JSON.parse(message.value.toString());
      console.log('Received message:', {
        topic,
        partition,
        message: messageData,
        offset: message.offset,
      });
    },
  });
};

// Request/Response example
const requestResponseExample = async () => {
  // Connect the consumer
  await consumer.connect();
  console.log('Consumer connected successfully');

  // Connect a producer which will send responses
  await producer.connect();
  console.log('Producer connected to send responses');

  // Subscribe to the topic
  await consumer.subscribe({
    topic: 'request-topic',
    fromBeginning: true,
  });

  // Execute logic to be run when receiving a message
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const request = JSON.parse(message.value.toString());
      console.log('Received request:', request);

      // Simulate processing the request and creating a response
      let response;
      if (request.type === 'getTime') {
        response = {
          type: 'response',
          timestamp: new Date().toISOString(),
          data: 'Current server time',
        };
      } else {
        response = { type: 'error', message: 'Unknown request type' };
      }

      // Send response to response-topic
      await producer.send({
        topic: 'response-topic',
        messages: [{ value: JSON.stringify(response) }],
      });
      console.log('Response sent:', response);
    },
  });
};

// Uncomment whichever you want to test

// requestResponseExample().catch(console.error);
// receiveInQueueExample().catch(console.error);

// Graceful shutdown
process.on('SIGTERM', async () => {
  try {
    await consumer.disconnect();
    console.log('Consumer disconnected');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});
