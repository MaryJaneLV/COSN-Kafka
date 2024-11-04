## 📨 Connect to Message Broker

To test the connection, there are two example applications provided: **Consumer** and **Producer**. These examples are in **Node.js**, but most other languages likely have client libraries available for connecting to the message broker.

> **Tip:** Some frameworks, such as **NestJS**, offer built-in support for request/response messaging. In this case, manual producer and consumer configuration isn’t necessary, unlike in a plain Node.js setup.

---

### 📝 TODO

- **Implement authentication** for Kafka before deploying to a server.

---

### 🚀 Start the Message Broker Locally

To start the message broker locally, run the following command:

```bash
docker compose up -d --build
```
