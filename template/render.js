const pug = require("pug");
const path = require("path");

const TEMPLATE_PATH = path.join(__dirname, "template.pug");

const template = pug.compileFile(TEMPLATE_PATH);

const render = function(locals, callback) {
  return callback(null, template(locals));
};

module.exports = render;
