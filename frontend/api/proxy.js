import axios from "axios";

export default async function handler(req, res) {
  try {
    const apiUrl =
      "http://expert-api.eu-west-2.elasticbeanstalk.com" +
      req.url.replace("/api/proxy", "");
    console.log("Request Body:", req.body);
    console.log("Request Headers:", req.headers);
    console.log(req.headers.contentType);
    const body =
      req.method !== "GET" && req.body ? JSON.stringify(req.body) : null;
    console.log({ body });

    const headers = {
      "Content-Type": req.headers["content-type"], // Forward Content-Type
      Authorization: req.headers["authorization"], // Forward Authorization header if needed
    };
    console.log({ headers });

    const response = await axios({
      method: req.method,
      url: apiUrl,
      headers: headers,
      data: req.method !== "GET" && req.body ? req.body : null, // Pass body if it's not a GET request
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
