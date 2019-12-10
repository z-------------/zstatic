const mapAsync = (list, fn) => {
  return Promise.all(list.map(item => fn(item)));
};

module.exports = mapAsync;
