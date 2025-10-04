import morgan from "morgan";
import fs from "fs";
import path from "path";

// Ensure logs directory exists
const logDirectory = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

// Create a write stream (append mode)
const accessLogStream = fs.createWriteStream(
  path.join(logDirectory, "access.log"),
  { flags: "a" }
);

// Custom token for timestamp
morgan.token("timestamp", () => new Date().toISOString());

// Format: [timestamp] method url status response-time ms - user-agent
const logFormat =
  '[:timestamp] ":method :url" :status :res[content-length] - :response-time ms ":user-agent"';

const logger = morgan(logFormat, { stream: accessLogStream });

export default logger;
