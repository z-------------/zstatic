const normalizePath = pathname => "/" + pathname.split("/").filter(frag => frag.length).join("/");

module.exports = normalizePath;
