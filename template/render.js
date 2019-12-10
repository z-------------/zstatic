const path = require("path");
const filesize = require("filesize");
const esc = require("../lib/escape");

const { version } = require("../package.json");

const template = vars => {
  const rowHTMLs = [];
  for (const file of vars.fileList) {
    const isDir = file.stat.isDirectory();
    const trailingSlash = isDir ? "/" : "";
    rowHTMLs.push(`
<tr>
  <td class="listing_name">
    <a href="${encodeURIComponent(file.name)}${trailingSlash}">
      ${esc(file.name)}${trailingSlash}
    </a>
  </td>
  <td class="listing_size">${isDir ? "-" : esc(file.sizeString)}</td>
  <td class="listing_mtime">
    ${esc(file.stat.mtime.toISOString().replace(/T|Z/g, " ").replace(/\.\d{3}/, ""))}
  </td>
</tr>
    `);
  }
  const rowsHTML = rowHTMLs.join("");

  const footerHTML = vars.argv.footer
    ? `<footer><p>zstatic ${esc(vars.zstatic.version)}</p></footer>`
    : "";

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8"/>
    <title>Index of ${esc(vars.directory)}</title>
    <style>${vars.style}</style>
  </head>
  <body>
    <h1 id="path">${esc(vars.directory)}</h1>
    <table id="listing">
      <tr>
        <th class="listing_name">Name</th>
        <th class="listing_size">Size</th>
        <th class="listing_mtime">Modified</th>
      </tr>
      ${rowsHTML}
    </table>
    ${footerHTML}
  </body>
</html>
  `;
};

const render = argv => {
  return function(locals, callback) {
    const vars = Object.assign({
      argv,
      zstatic: { version }
    }, locals);
    for (const file of vars.fileList) {
      file.sizeString = filesize(file.stat.size);
    }
    return callback(null, template(vars));
  };
};

module.exports = render;
