const logger = async (ctx, next) => {
  const start = process.hrtime();
  await next();

  const onFinish = done.bind(null, "finish", ctx);
  const onClose = done.bind(null, "close", ctx);

  ctx.res.once("finish", onFinish);
  ctx.res.once("close", onClose);

  function done(e) {
    const end = process.hrtime(start);
    const ms = end[0] * 1e3 + end[1] / 1e6;

    ctx.res.removeListener("finish", onFinish);
    ctx.res.removeListener("close", onClose);

    log(ctx, ms);
  }
};

const log = (ctx, time) => {
  process.stdout.write(`${ctx.ip} ${ctx.get("User-Agent")}\n\t${ctx.method} ${ctx.url} HTTP/${ctx.req.httpVersion} ${ctx.status} ${ctx.response.get("Content-Length")} - ${time.toFixed(3)} ms\n`);
};

module.exports = logger;
