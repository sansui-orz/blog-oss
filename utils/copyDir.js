const fs = require('fs');
const path = require('path');

module.exports = function copyDir(from, to) {
  const fromPath = path.resolve(from);
  const toPath = path.resolve(to);
  fs.access(toPath, function (err) {
    if (err) {
      fs.mkdirSync(toPath);
    }
  });
  fs.readdir(fromPath, function (err, paths) {
    if (err) {
      console.log(err);
      return;
    }
    paths.forEach(function (item) {
      const newFromPath = fromPath + '/' + item;
      const newToPath = path.resolve(toPath + '/' + item);

      fs.stat(newFromPath, function (err, stat) {
        if (err) return;
        if (stat.isFile()) {
          fs.copyFileSync(newFromPath, newToPath);
        }
        if (stat.isDirectory()) {
          copyDir(newFromPath, newToPath);
        }
      });
    });
  });
}
