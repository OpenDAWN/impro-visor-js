'use strict';

module.exports = parse;

function lines(buffer) {
  return buffer.split('\n')
    .map(function(line) {
      return line.trim()
        .replace(/\/\/.*/, '')
        .replace(/\/\*.*/, '');
    })
    .filter(function(line) { return line; });
}

function directives(lines) {
  return lines.map(function(line) {
    var dir = {};
    dir.line = line;
    dir.type = /^\(.*\)$/gm.test(line) ? 'PAIR' :
      (/^\(.*$/gm.test(line) ? 'BLOCK' : (line == ')' ? 'CLOSE' : 'LIT'));

    return dir;
  });
}

function parsePair(line) {
  var clean = line
    .replace(/\s*\/\/.*/g, '')
    .replace(/^\(/, '').replace(/\)\s*$/, '');
  var first = clean.indexOf(' ');
  return {
    key: (first > 0) ? clean.slice(0, first) : clean,
    value: (first > 0) ? clean.substring(first + 1) : ""
  }
}

function parseList(line) {
  if(!/^\(.*\)$/m.test(line)) return null;
  // console.log("REDUCE", line);

  var pairs = line.split('(').map(parsePair).filter(function(p) { return p.key });
  return pairs.reduce(function(obj, pair) {
    obj[pair.key] = pair.value;
    return obj;
  }, {});
}

function tokens(directives) {
  return directives.map(function(dir) {
    var token = { type: dir.type, key: '', value: '' };
    if(dir.type == 'PAIR' || dir.type == 'BLOCK') {
      var pair = parsePair(dir.line);
      var list = parseList(pair.value);
      token.key = pair.key;
      token.value = list ? list : pair.value;
    } else if (dir.type == 'LIT') {
      token.value = dir.line;
    }
    return token;
  });
}

function parse(buffer) {
  return tokens(directives(lines(buffer)));
}
