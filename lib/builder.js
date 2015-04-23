'use strict';

function addBlock(parent, token) {
  var block = {};
  if(token.value) {
    parent[token.key + 's'] = parent[token.key + 's'] || {};
    parent[token.key + 's'][token.value] = block;
  } else {
    parent[token.key + 's'] = parent[token.key + 's'] || [];
    parent[token.key + 's'].push(block);
  }
  return block;
}

function vocab(tokens) {
  var obj = {};
  var parents = [];
  var parent = obj;

  tokens.forEach(function(token) {
    switch(token.type) {
      case 'PAIR':
        parent[token.key] = token.value;
        break;
      case 'BLOCK':
        parents.push(parent);
        parent = addBlock(parent, token);
        break;
      case 'CLOSE':
        parent = parents.pop();
    }
  });

  return obj;
}

function leadsheet(tokens) {
  var obj = {};
  var parent = obj;
  var part = null;

  tokens.forEach(function(token) {
    switch(token.type) {
      case 'PAIR':
        parent[token.key] = token.value;
        break;
      case 'BLOCK':
        parent = addBlock(obj, token);
        if(token.key == 'part') part = parent;
        break;
      case 'LIT':
        part.lit = part.lit || "";
        part.lit += token.value;
    }
  });
  return obj;
}

module.exports = {
  leadsheet: leadsheet,
  vocab: vocab
};