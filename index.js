#!/usr/bin/env node

const path = require("path");
const express = require("express");
const serveIndex = require("serve-index");
const morgan = require("morgan");

const { argv } = require("yargs")
  .number("port")
    .alias("port", "p")
    .describe("port", "Specify port to listen on")
    .default("port", 8080)
  .boolean("index")
    .describe("index", "Serve directory index pages")
    .default("index", true)
  ;

const app = express();

const port = !Number.isNaN(argv.port) && argv.port || 8080;
const root = path.resolve(process.cwd(), process.argv[2] || ".");

app.use(morgan(":remote-addr :user-agent\n\t:method :url HTTP/:http-version :status :res[content-length] - :response-time ms"));
argv.index && app.use(serveIndex(root, {
  view: "details",
  icons: true
}));
app.use(express.static(root));

app.listen(port, () => {
  console.log(`Serving ${root} on :${port}`);
});
