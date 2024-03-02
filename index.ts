import axios, {
  AxiosHeaders,
  AxiosResponseHeaders,
  RawAxiosResponseHeaders,
} from "axios";
import { config } from "dotenv";
import express, { Request, Response } from "express";
import { IncomingHttpHeaders } from "undici-types/header";
import { db } from "./config";
import { Route } from "./models";

// Load environment variables
config();

// Connect to database
db.authenticate();

const app = express();

// Utility function to set headers
const setHeaders = (
  res: AxiosHeaders | Response,
  headers: IncomingHttpHeaders | RawAxiosResponseHeaders | AxiosResponseHeaders
) => {
  // Headers we don't want to pass through
  let blacklisted_header_keys = ["host"];

  for (const key in headers) {
    if (!blacklisted_header_keys.includes(key)) {
      const value = headers[key];
      res.set(key, value);
    }
  }
};

// Main proxy handler
const proxy = async (req: Request, res: Response) => {
  try {
    // Get route path
    let paths = req.path.split("/");
    let path = paths[1];

    delete paths[1];
    paths = paths.filter((p) => Boolean(p));

    // Get route config from database
    const route = await Route.findOne({ where: { path } });
    if (!route) return res.status(500).send("Unsupported");

    const url = paths.length ? "/" + paths.join("/") : "";

    const baseURL = route.baseUrl.replace(/\/$/, "");

    const method = req.method;
    const request_headers: AxiosHeaders = new AxiosHeaders();
    const params = req.query;
    const request_body = req.body;

    // Set request headers
    setHeaders(request_headers, req.headers);

    // Proxy request
    const {
      data,
      headers: response_headders,
      status,
    } = await axios.request({
      url,
      baseURL,
      method,
      headers: request_headers,
      data: request_body,
      params,
    });

    // Set response headers
    setHeaders(res, response_headders);

    // Send response
    res.status(status).send(data);
  } catch (err: any) {
    // Error from proxy
    if (err?.response) {
      // Set response headers
      setHeaders(res, err.response.headers);
      return res.status(err.response.status).send(err.response.data);
    }

    res.status(500).send("Gateway error");
  }
};

app.use("", proxy);

const port = parseInt(String(process.env.PORT)) || 8800;

app.listen(port, () => {
  console.log(`Gateway started on  http://localhost:${port}`);
});
