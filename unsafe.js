const http = require("http");
const { exec } = require("child_process");

http
  .createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    const name = url.searchParams.get("name");

    // Command injection: user input goes straight into a shell command
    exec("ls " + name, (err, output) => {
      // Cross-site scripting: user input goes straight into the HTML response
      res.setHeader("Content-Type", "text/html");
      res.end("<div>" + name + "</div><pre>" + output + "</pre>");
    });
  })
  .listen(3000);