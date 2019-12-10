const seppuku = msg => {
  process.stderr.write(`${msg || "Fatal error"}. Exiting.\n`);
  process.exit(1);
};

module.exports = seppuku;
