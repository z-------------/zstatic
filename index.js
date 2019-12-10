#!/usr/bin/env node

const fs = require("fs");
const Koa = require("koa");
const logger = require("./lib/logger");
const path = require("path");
const mapAsync = require("./lib/mapAsync");
const normalize = require("./lib/normalizePath");
const { promisify } = require("util");
const Render = require("./template/render");
const send = require("koa-send");
const seppuku = require("./lib/seppuku");
const yargs = require("yargs");

const resolve = pathname => path.join(__dirname, pathname.slice(1));

const { argv } = yargs
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

const app = new Koa();
const render = Render(argv);

const port = !Number.isNaN(argv.port) && argv.port || 8080;
const root = path.resolve(process.cwd(), process.argv[2] || ".");

try {
  const stat = fs.statSync(root);
  if (!stat.isDirectory()) seppuku(`'${root}' is not a directory`);
} catch (exp) {
  if (exp.code === "ENOENT") seppuku(`Could not access '${root}'`);
  else seppuku();
}

app.use(logger);

// error handling
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (exp) {
    ctx.status = 500;
    console.error(exp);
  }
});

// prevent path traversal
app.use((ctx, next) => {
  const frags = ctx.path.split("/");
  if (frags.includes(".") || frags.includes("..")) {
    ctx.status = 400;
  } else {
    return next();
  }
});

// normalize paths
app.use((ctx, next) => {
  const normalized = normalize(ctx.path) + (ctx.querystring ? "?" + ctx.querystring : "");
  if (ctx.url !== normalized) {
    ctx.redirect(normalized);
  } else {
    return next();
  }
});

// serve files and directory indexes
app.use(async (ctx, next) => {
  try {
    const pathname = resolve(ctx.path);
    if ((await promisify(fs.stat)(pathname)).isDirectory()) {
      const filenames = await promisify(fs.readdir)(pathname);
      if (pathname !== root) filenames.unshift("..");

      const fileList = (await mapAsync(filenames, async filename => ({
        name: filename,
        stat: await promisify(fs.stat)(path.resolve(pathname, filename)),
      })))
      .filter(file => file.name === ".." || !file.name.startsWith("."))
      .sort((a, b) => {
        const aIsDir = a.stat.isDirectory();
        const bIsDir = b.stat.isDirectory();
        if (aIsDir && !bIsDir) return -1;
        if (!aIsDir && bIsDir) return 1;
        return a.name.localeCompare(b.name);
      });

      const dirName = ctx.path.endsWith("/") ? ctx.path : ctx.path + "/";
      
      ctx.body = render({
        fileList,
        directory: dirName,
      });
    } else {
      await send(ctx, ctx.path);
    }
  } catch (exp) {
    if (exp.code !== "ENOENT") throw exp;
  }
  await next();
});

app.listen(port, () => {
  console.log(`Serving ${root} on :${port}`);
});
