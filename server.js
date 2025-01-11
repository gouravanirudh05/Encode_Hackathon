import fs from "fs";
import path from "path";
import http from "http";
import HttpDispatcher from "httpdispatcher";
import { server as WebSocketServer } from "websocket";

// Constants
const HTTP_SERVER_PORT = 8080;
const REPEAT_THRESHOLD = 50;

// Dispatcher and HTTP server
const dispatcher = new HttpDispatcher();
const wsserver = http.createServer(handleRequest);

// WebSocket server
const mediaws = new WebSocketServer({
  httpServer: wsserver,
  autoAcceptConnections: true,
});

// Utility function for logging
function log(message, ...args) {
  console.log(new Date(), message, ...args);
}

// HTTP request handler
function handleRequest(request, response) {
  try {
    dispatcher.dispatch(request, response);
  } catch (err) {
    console.error("Error handling request:", err);
    response.writeHead(500, { "Content-Type": "text/plain" });
    response.end("Internal Server Error");
  }
}

// Dispatcher routes
dispatcher.onPost("/twiml", (req, res) => {
  log("POST /twiml request received");

  const filePath = path.join(process.cwd(), "templates", "streams.xml");

  fs.stat(filePath, (err, stat) => {
    if (err) {
      log("File not found:", err.message);
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("File not found");
      return;
    }

    res.writeHead(200, {
      "Content-Type": "text/xml",
      "Content-Length": stat.size,
    });

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  });
});

// WebSocket connection handling
mediaws.on("connect", (connection) => {
  log("WebSocket connection established");
  new MediaStream(connection);
});

// MediaStream class
class MediaStream {
  constructor(connection) {
    this.connection = connection;
    this.hasSeenMedia = false;
    this.messages = [];
    this.repeatCount = 0;

    connection.on("message", (message) => this.processMessage(message));
    connection.on("close", () => this.close());
  }

  processMessage(message) {
    if (message.type === "utf8") {
      const data = JSON.parse(message.utf8Data);
      switch (data.event) {
        case "connected":
          log("Connected event received:", data);
          break;
        case "start":
          log("Start event received:", data);
          break;
        case "media":
          this.handleMediaEvent(data);
          break;
        case "mark":
          log("Mark event received:", data);
          break;
        case "close":
          log("Close event received:", data);
          this.close();
          break;
        default:
          log("Unknown event received:", data);
      }
    } else if (message.type === "binary") {
      log("Binary message received (not supported)");
    }
  }

  handleMediaEvent(data) {
    if (!this.hasSeenMedia) {
      log("First media event received:", data);
      log("Suppressing additional messages...");
      this.hasSeenMedia = true;
    }
    this.messages.push(data);
    if (this.messages.length >= REPEAT_THRESHOLD) {
      log(`Omitted ${this.messages.length} media messages`);
      this.repeat();
    }
  }

  repeat() {
    const messages = [...this.messages];
    this.messages = [];
    const streamSid = messages[0].streamSid;

    const payload = Buffer.concat(
      messages.map((msg) => Buffer.from(msg.media.payload, "base64"))
    ).toString("base64");

    const message = {
      event: "media",
      streamSid,
      media: { payload },
    };

    const payloadRE = /"payload":"[^"]*"/gi;
    log(
      `Sending combined media event for ${messages.length} messages`,
      JSON.stringify(message).replace(
        payloadRE,
        `"payload":"an omitted base64 encoded string"`
      )
    );

    this.connection.sendUTF(JSON.stringify(message));

    const markMessage = {
      event: "mark",
      streamSid,
      mark: { name: `Repeat ${this.repeatCount}` },
    };

    log("Sending mark event:", markMessage);
    this.connection.sendUTF(JSON.stringify(markMessage));

    this.repeatCount++;
    if (this.repeatCount === 5) {
      log("Closing connection after 5 repeats");
      this.connection.close(1000, "Repeated 5 times");
    }
  }

  close() {
    log("WebSocket connection closed");
  }
}

// Start the server
wsserver.listen(HTTP_SERVER_PORT, () => {
  log(`Server listening on http://localhost:${HTTP_SERVER_PORT}`);
});
