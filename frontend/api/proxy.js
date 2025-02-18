export default async function handler(req, res) {
  const apiUrl =
    "http://expert-api.eu-west-2.elasticbeanstalk.com" +
    req.url.replace("/api/proxy", "");

  const response = await fetch(apiUrl, {
    method: req.method,
    headers: {
      "Content-Type": "application/json",
      ...req.headers, // Forward headers
    },
    body: req.method !== "GET" ? JSON.stringify(req.body) : null,
  });

  const data = await response.json();
  res.status(response.status).json(data);
}
