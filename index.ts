// src/index.ts

import express from "express";
import { InfluxDB, Point } from "@influxdata/influxdb-client";

// Define your InfluxDB connection details
const url = "https://us-east-1-1.aws.cloud2.influxdata.com/"; // Replace with your InfluxDB URL
const token =
  "ClRG3jGUGWT2HFqBeSDrQ1oujOg8mgMxqf6DujpuyKwwyQ8u7cxK6Ksw09ehGhnfHN3oc0qv1rCJiyRv4bDlhA=="; // Replace with your InfluxDB token
const org = "Dev"; // Replace with your InfluxDB organization
const bucket = "tasks"; // Replace with your InfluxDB bucket

// Create an InfluxDB client instance
const client = new InfluxDB({ url, token });

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Route to write data to InfluxDB
app.post("/write-data", (req, res) => {
  // Create a write API instance
  const writeApi = client.getWriteApi(org, bucket);
  writeApi.useDefaultTags({ location: "mumbai" });
  const { measurement, tags, fields, timestamp } = req.body;

  if (!measurement || !fields) {
    return res.status(400).send("Measurement and fields are required.");
  }

  const point = new Point(measurement);

  if (tags) {
    for (const [key, value] of Object.entries(tags)) {
      point.tag(key, value as string);
    }
  }

  for (const [key, value] of Object.entries(fields)) {
    const val = typeof value === "object" ? JSON.stringify(value) : value;
    point.stringField(key, val);
  }

  if (timestamp) {
    point.timestamp(new Date(timestamp));
  } else {
    point.timestamp(new Date());
  }

  writeApi.writePoint(point);

  // Flush data and handle success/error response
  //   writeApi
  //     .close()
  //     .then(() => {
  writeApi.flush();
  res.send("Data written successfully.");
  // })
  // .catch((error) => {
  //   console.error("Error writing data:", error);
  //   res.status(500).send("Error writing data to InfluxDB.");
  // });
});

// app.get("/health", async (req, res) => {
//   await client.ping(5000);
// });

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
