const pug = require("pug");
const path = require("path");
const filesize = require("filesize");

const TEMPLATE_PATH = path.join(__dirname, "template.pug");

const template = pug.compileFile(TEMPLATE_PATH);
const { version } = require("../package.json");

module.exports = function(argv) {
  return function(locals, callback) {
    let vars = Object.assign({
      argv,
      zstatic: { version }
    }, locals);
    for (let file of vars.fileList) {
      file.sizeString = filesize(file.stat.size);
    }
    return callback(null, template(vars));
  };
};
