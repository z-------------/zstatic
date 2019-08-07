#!/usr/bin/env node

const path = require("path");
const express = require("express");
const serveIndex = require("serve-index");
const morgan = require("morgan");
const app = express();

const PORT = 8080; // TODO: make this configurable

const root = path.resolve(process.cwd(), process.argv[2] || ".");

app.use(morgan(":remote-addr (:user-agent)\n\t:method :url HTTP/:http-version :status :res[content-length] - :response-time ms"));

app.use(serveIndex(root));

app.use(express.static(root));

app.listen(PORT, () => console.log(`Listening on :${PORT}`));