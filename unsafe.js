const http = require("http");
const { execFile } = require("child_process");

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

http
  .createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    const name = url.searchParams.get("name") || "";

    // Allow only simple names: letters, numbers, dash, underscore
    if (!/^[A-Za-z0-9_-]{1,30}$/.test(name)) {
      res.statusCode = 400;
      res.end("Invalid name");
      return;
    }

    // execFile passes the input as data, not as part of a shell command
    execFile("ls", [name], (err, output) => {
      res.setHeader("Content-Type", "text/plain");
      res.end(escapeHtml(name) + "\n" + output);
    });
  })
  .listen(3000);