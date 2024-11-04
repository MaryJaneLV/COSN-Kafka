const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'producer',
  brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
});

// Initialize the producer
const producer = kafka.producer();

// Needed for receiving responses
const consumer = kafka.consumer({ groupId: 'response-group' });

// An example of adding a message to a queue
const addToQueueExample = async () => {
  await producer.connect();
  console.log('Producer connected successfully');

  const message = {
    text: 'Hello Kafka!',
    timestamp: new Date().toISOString(),
  };

  // Send a message to the queue ("fire and forget")
  try {
    await producer.send({
      topic: 'test-topic',
      messages: [{ value: JSON.stringify(message) }],
    });
    console.log('Message sent:', message);
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

// An example of sending a request and receiving a response
const requestResponseExample = async () => {
  // The producer will send the message
  await producer.connect();
  console.log('Producer connected successfully');

  // Needed for receiving response to our message
  await consumer.connect();
  console.log('Consumer connected to response topic successfully');

  // Subscribe to response-topic to receive responses
  await consumer.subscribe({ topic: 'response-topic', fromBeginning: true });

  // Listen for responses
  consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const response = message.value.toString();
      console.log('Received response:', response);
    },
  });

  // Send a request message
  const request = {
    type: 'getTime',
    timestamp: new Date().toISOString(),
  };

  // Send the request
  try {
    await producer.send({
      topic: 'request-topic',
      messages: [{ value: JSON.stringify(request) }],
    });
    console.log('Request sent:', request);
  } catch (error) {
    console.error('Error sending request:', error);
  }
};

// Uncomment whichever you want to test

// requestResponseExample().catch(console.error);
// addToQueueExample().catch(console.error);

// Graceful shutdown
process.on('SIGTERM', async () => {
  try {
    await producer.disconnect();
    console.log('Producer disconnected');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});
