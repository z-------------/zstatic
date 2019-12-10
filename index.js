#!/usr/bin/env node

const path = require("path");
const fs = require("fs");
const express = require("express");
const serveIndex = require("serve-index");
const morgan = require("morgan");

const { argv } = require("yargs")
  .usage("Usage: $0 <root> [<options>]")
  .options({
    "port": {
      alias: "p",
      describe: "Specify port to listen on",
      type: "number",
      default: 8080,
    },
    "index": {
      describe: "Serve directory index pages",
      type: "boolean",
      default: true,
    },
    "footer": {
      describe: "Show footer on directory index pages",
      type: "boolean",
      default: true,
    },
  });

const app = express();

const port = !Number.isNaN(argv.port) && argv.port || 8080;
const root = path.resolve(process.cwd(), process.argv[2] || ".");

app.use(morgan(":remote-addr :user-agent\n\t:method :url HTTP/:http-version :status :res[content-length] - :response-time ms"));
if (argv.index) {
  app.use((req, res, next) => {
    if (req.url.endsWith("/")) next();
    else {
      fs.stat(path.join(__dirname, req.url), (err, stats) => {
        if (stats && stats.isDirectory()) {
          res.redirect(req.url + "/");
        } else next();
      });
    }
  });
  app.use(serveIndex(root, {
    template: require("./template/render")(argv),
    stylesheet: path.join(__dirname, "template/style.css")
  }));
}
app.use(express.static(root));

app.listen(port, () => {
  console.log(`Serving ${root} on :${port}`);
});
