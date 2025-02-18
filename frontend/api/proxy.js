export default async function handler(req, res) {
  try {
    const apiUrl =
      "http://expert-api.eu-west-2.elasticbeanstalk.com" +
      req.url.replace("/api/proxy", "");
    console.log(req.body);
    console.log(req.data);
    console.log(req.method);
    const response = await fetch(apiUrl, {
      method: req.method,
      headers: {
        ...req.headers, // Forward headers (includes Authorization)
      },
      body: req.method === "POST" ? req.body : null,
    });
    console.log({ response });
    // const contentType = response.headers.get("content-type");
    // const data =
    //   contentType && contentType.includes("application/json")
    //     ? await response.json()
    //     : await response.text();

    res.status(response.status).json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
