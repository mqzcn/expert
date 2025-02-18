export default async function handler(req, res) {
  try {
    const apiUrl =
      "http://expert-api.eu-west-2.elasticbeanstalk.com" +
      req.url.replace("/api/proxy", "");
    console.log(req.body);
    console.log({ "req.config.data": req.config.data });
    console.log({ "req.config.headers": req.config.headers });
    console.log(req.headers.contentType);
    const body =
      req.method !== "GET" && req.body ? JSON.stringify(req.body) : null;
    console.log({ body });
    const response = await fetch(apiUrl, {
      method: req.method,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        ...req.config.headers, // Forward headers (includes Authorization)
      },
      body,
    });
    console.log({ response });
    const contentType = response.headers.get("content-type");
    const data =
      contentType && contentType.includes("application/json")
        ? await response.json()
        : await response.text();

    res.status(response.status).json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
