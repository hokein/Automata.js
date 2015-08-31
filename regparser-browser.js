require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var DOTSCRIPTHEADER = 'digraph finite_state_machine {\n' + '  rankdir = LR;\n';
var DOTSCRIPTEND = '}\n';

function escapeCharacter(token) {
  switch (token)  {
    case ' ':
      return '[space]';
    case '\n':
      return '\\\\n';
    case '\t':
      return '\\\\t';
    case '\r':
      return '\\\\r';
    case '\\':
      return '[\\\\]';
  }
  return token;
}

exports.toDotScript = function(fsm) {
  var transitionDotScript = '  node [shape = circle];\n';
  for (var from_id in fsm.transitions) {
    for (var to_id in fsm.transitions[from_id]) {
    transitionDotScript += '  ' + [from_id] + '->' + to_id + ' [label="' +
        escapeCharacter(fsm.transitions[from_id][to_id]) + '"];\n';
    }
  }
  var initialStatesDotScript = '';
  var initialStatesStartDotScript = '  node [shape = plaintext];\n';
  var acceptStatesDotScript = '';
  for (var i = 0; i < fsm.numOfStates; ++i) {
    if (fsm.acceptStates.indexOf(i.toString()) != -1) {
      acceptStatesDotScript += '  node [shape = doublecircle]; ' + i + ';\n';
    }
    if (fsm.initialState == i.toString()) {
      initialStatesStartDotScript += '  "" -> ' + i + ' [label = "start"];\n';
      // accept is higher priority than initial state.
      if (fsm.acceptStates.indexOf(i.toString()) == -1)
        initialStatesDotScript += '  node [shape = circle]; ' + i + ';\n';
    }
  }
  return DOTSCRIPTHEADER + initialStatesDotScript + acceptStatesDotScript +
      initialStatesStartDotScript + transitionDotScript + DOTSCRIPTEND;
}

},{}],2:[function(require,module,exports){
var TOKEN_TYPE = {
  LBRACK: '(',
  RBRACK: ')',
  STAR: '*',
  PLUS: '+',
  OR: '|',
  ALTER: '?',
  END: 'EOF',
  EMPTY: 'ε',
  BLANK: ' ',
  ESCAPE: '\\',
  EXTEND: '\d\w',
  UNKNOWN: 'unknown',
  REGCHAR: 'a-z0-9_ \n\t\r',
};

function isRegChar(regChar) {
  return (regChar >= 'a' && regChar <= 'z') ||
         (regChar >= 'A' && regChar <= 'Z') ||
         (regChar >= '0' && regChar <= '9') ||
         regChar == ' ' || regChar == '_';
}

// class Token
function Token(type, text) {
  this.type = type;
  this.text = text;
}

var EMPTYTOKEN = new Token(TOKEN_TYPE.EMPTY, 'ε');

// class Lexer
function Lexer(regString) {
  this.regString = regString;
  this.index = 0;
};

Lexer.prototype.hasNext = function() {
  if (this.regString)
    return this.index < this.regString.length;
  return false;
}

Lexer.prototype.nextToken = function() {
  while (this.hasNext()) {
    switch (this.regString[this.index]) {
      case '\\':
        this._consume();
        if (this.hasNext()) {
          switch (this.regString[this.index]) {
            case 'n':
              ++this.index;
              return new Token(TOKEN_TYPE.REGCHAR, '\n');
            case 't':
              ++this.index;
              return new Token(TOKEN_TYPE.REGCHAR, '\t');
            case 'r':
              ++this.index;
              return new Token(TOKEN_TYPE.REGCHAR, '\r');
            case '\\':
              ++this.index;
              return new Token(TOKEN_TYPE.REGCHAR, '\\');
            case 'd':
              ++this.index;
              return new Token(TOKEN_TYPE.EXTEND, '\d');
            case 'w':
              ++this.index;
              return new Token(TOKEN_TYPE.EXTEND, '\w');
          }
        }
        throw new Error('Expect character after "\\".');
      case '(':
        this._consume();
        return new Token(TOKEN_TYPE.LBRACK, '(');
      case ')':
        this._consume();
        return new Token(TOKEN_TYPE.RBRACK, ')');
      case '+':
        this._consume();
        return new Token(TOKEN_TYPE.PLUS, '+');
      case '*':
        this._consume();
        return new Token(TOKEN_TYPE.STAR, '*');
      case '?':
        this._consume();
        return new Token(TOKEN_TYPE.ALTER, '?');
      case '|':
        this._consume();
        return new Token(TOKEN_TYPE.OR, '|');
      default:
        if (isRegChar(this.regString[this.index]))
           return new Token(TOKEN_TYPE.REGCHAR, this.regString[this.index++]);
        else
           throw new Error('Unknown type of ' + this.regString[this.index]);
    }
  }
  return new Token(TOKEN_TYPE.END, 'EOF');
}

Lexer.prototype._consume = function() {
  return ++this.index;
}

module.exports.Lexer = Lexer;
module.exports.EMPTYTOKEN = EMPTYTOKEN;
module.exports.TOKEN_TYPE = TOKEN_TYPE;

},{}],"regparser":[function(require,module,exports){
var DotConverter = require('./dot-converter');
var Lexer = require('./lexer').Lexer;
var EMPTYTOKEN = require('./lexer').EMPTYTOKEN;
var TOKEN_TYPE = require('./lexer').TOKEN_TYPE;

function constructGraph(startState) {
  var nfaGraph = {};
  var queue = [];
  queue.push(startState);
  var vis = {};
  while (queue.length) {
    var state = queue.shift();
    nfaGraph[state.id] = [];
    for (var i = 0; i < (state.nextStates).length; ++i) {
      var nextId = state.nextStates[i][1].id;
      var label = state.nextStates[i][0].text;
      var nextState = state.nextStates[i][1];
      nfaGraph[state.id].push([label, nextId]);
      if (nextId in vis)
        continue;
      vis[nextId] = 1;
      queue.push(state.nextStates[i][1]);
    }
  };
  return nfaGraph;
}

// class NFAState
function NFAState(id, isAccept) {
  this.id = id;
  this.isAccept = isAccept;
  this.nextStates = [];
};

NFAState.prototype.addStates = function(token, state) {
  this.nextStates.push([token, state]);
}

// class NFA
function NFA(startState, endState) {
  this.startState = startState;
  this.endState = endState;
};

NFA.prototype._emptyClosure = function(nfaStates, nfaGraph) {
  var closure = [];
  var stack = [];
  for (var i = 0; i < nfaStates.length; ++i) {
    stack.push(nfaStates[i]);
    closure.push(nfaStates[i]);
  }
  while (stack.length) {
    var stateId = stack.shift();
    for (var i = 0; i < nfaGraph[stateId].length; ++i) {
      var nextId = nfaGraph[stateId][i][1];
      var label = nfaGraph[stateId][i][0];
      if (label == TOKEN_TYPE.EMPTY &&
          closure.indexOf(nextId) == -1) {
        closure.push(nextId);
        stack.push(nextId);
      }
    }
  }
  closure.sort(function(a, b) {
    return a < b;
  });
  return closure;
}

NFA.prototype._move = function(dfaState, letter, id2States, nfaGraph) {
  var stateArray = id2States[dfaState.id];
  var result = [];
  for (var i = 0; i < stateArray.length; ++i) {
    var id = stateArray[i];
    for (var k = 0; k < nfaGraph[id].length; ++k) {
      var label = nfaGraph[id][k][0];
      if (label == letter) {
        result.push(nfaGraph[id][k][1]);
      }
    }
  }
  result.sort(function(a, b) {
    return a < b;
  });
  return result;
}

NFA.prototype.toDFA = function() {
  var nfaGraph = constructGraph(this.startState);
  var alphabetTable = {};
  for (var id in nfaGraph)
    for (var j = 0; j < nfaGraph[id].length; ++j) {
      var label = nfaGraph[id][j][0];
      if (!alphabetTable.hasOwnProperty(label) &&
          label != TOKEN_TYPE.EMPTY)
        alphabetTable[label] = 1;
    }

  // {id:
  //  nextStates: {
  //    label:"",
  //    nextStatesId: [id1, id2, id3],
  //    vis: true,
  //    accept: true
  //  }
  // }
  var dStates = [];
  var states2Id = {}; // [1, 2, 3] => id
  var id2States = {}; // id => [1, 2, 3]
  var id = 0;
  var closure = this._emptyClosure([this.startState.id], nfaGraph);
  states2Id[JSON.stringify(closure)] = id;
  id2States[id] = closure;
  dStates.push({id: id++, nextStates: {}, vis: false});

  dStates[dStates.length-1].accept =
      closure.indexOf(this.endState.id) != -1;
  dStates[dStates.length-1].initial =
      closure.indexOf(this.startState.id) != -1;
  var unvisCnt = 1;
  while (unvisCnt)  {
    var unvisState;
    unvisState = dStates.filter(function(state) {
      return !state.vis;
    })[0];
    unvisState.vis = true;
    --unvisCnt;
    for (var letter in alphabetTable) {
      if (letter == TOKEN_TYPE.EMPTY)
        continue;

      var nextStates = this._emptyClosure(
          this._move(unvisState, letter, id2States, nfaGraph), nfaGraph);

      if (!nextStates.length)
        continue;
      var nextStatesString = JSON.stringify(nextStates);
      if (!states2Id.hasOwnProperty(nextStatesString)) {
        states2Id[nextStatesString] = id;
        id2States[id] = nextStates;
        dStates.push({id: id++,
                      nextStates: {},
                      vis: false,
                      accept: nextStates.indexOf(this.endState.id) != -1,
                      initial: nextStates.indexOf(this.startState.id) != -1
                     });
        ++unvisCnt;
      }

      unvisState.nextStates[letter] = nextStates;
    }
  }

  var dfa = new FSM();
  dfa.type = 'DFA';
  dfa.numOfStates = id;
  for (var i = 0; i < dStates.length; ++i) {
    if (dStates[i].initial)
      dfa.initialState = dStates[i].id.toString();
    if (dStates[i].accept)
      dfa.acceptStates.push(dStates[i].id.toString());

    for (var letter in alphabetTable) {
      if (!dStates[i].nextStates[letter]) continue;
      var arrayId = [];
      for (var j = 0; j < dStates[i].nextStates[letter].length; ++j)
        arrayId.push(dStates[i].nextStates[letter][j]);
      if (arrayId.length) {
        if (!dfa.transitions[dStates[i].id])
          dfa.transitions[dStates[i].id] = {}
        dfa.transitions[dStates[i].id][states2Id[JSON.stringify(arrayId)]] =
            letter;
      }
    }
  }
  return dfa;
}

// class FSM, represent a finite state machine.
// format:
//   {
//     initialState: 'id',
//     acceptStates: ['id', ... ],
//     numOfStates: Integer,
//     type: 'DFA',
//     transitions: {
//       "id": { 'to_id': label, },
//       ...,
//     }
//   }
function FSM() {
  this.acceptStates = [];
  this.transitions = {};
};

FSM.prototype.toDotScript = function() {
  return DotConverter.toDotScript(this);
};

FSM.prototype.match = function(text) {
  if (this.type == 'NFA')
    throw new Error("match function doesn't support NFA.");
  var currentState = this.initialState;
  for (var i = 0; i < text.length; ++i) {
    if (!this.transitions[currentState])
      return false;
    var notFound = true;
    for (var nextState in this.transitions[currentState]) {
      if (this.transitions[currentState][nextState] == text[i]) {
        currentState = nextState;
        notFound = false;
        break;
      }
    }
    if (notFound) return false;
  }
  return this.acceptStates.indexOf(currentState) != -1;
}

// class Parser
function RegParser(regString) {
  this.nfa = null;
  this.id = 0;
  this.lexer = new Lexer(regString);
  this.lookHead = this.lexer.nextToken();
}

RegParser.prototype.clear = function() {
  this.nfa = null;
  this.id = 0;
  this.lexer = null;
  this.lookHead = null;
}

RegParser.prototype.reset = function(regString) {
  this.nfa = null;
  this.id = 0;
  this.lexer = new Lexer(regString);
  this.lookHead = this.lexer.nextToken();
}

RegParser.prototype.parseToNFA = function() {
  this.nfa = this._expression();
  this._reorderNFAStateId();
  return this._traversalFSM();
}

RegParser.prototype.parseToDFA = function() {
  var fsm = this.parseToNFA();
  return this.nfa.toDFA();
}

RegParser.prototype._traversalFSM = function() {
  var fsm = new FSM();
  var queue = [];
  var vis = {};
  queue.push(this.nfa.startState);

  fsm.initialState = this.nfa.startState.id.toString();
  fsm.numOfStates = this.id;
  fsm.type = 'NFA';
  vis[this.nfa.startState.id] = 1;
  while (queue.length) {
    var state = queue.shift();
    for (var i = 0; i < (state.nextStates).length; ++i) {
      var nextId = state.nextStates[i][1].id;
      var label = state.nextStates[i][0].text;
      var nextState = state.nextStates[i][1];
      if (!fsm.transitions[state.id])
        fsm.transitions[state.id] = {};
      fsm.transitions[state.id][nextId] = label;
      if (nextId in vis)
        continue;
      vis[nextId] = 1;
      if (nextState.isAccept)
        fsm.acceptStates.push(nextId.toString());
      queue.push(state.nextStates[i][1]);
    }
  }
  return fsm;
}

RegParser.prototype._reorderNFAStateId = function() {
  var queue = [];
  var vis = {};
  queue.push(this.nfa.startState);
  this.id = 0;
  vis[this.nfa.startState.id] = 1;
  while (queue.length) {
    var state = queue.shift();
    state.id = this.id++;
    for (var i = 0; i < (state.nextStates).length; ++i) {
      var nextId = state.nextStates[i][1].id;
      if (nextId in vis)
        continue;
      vis[nextId] = 1;
      queue.push(state.nextStates[i][1]);
    }
  }
}

function CombineNFAsForOR(subNFA1, subNFA2, parser) {
  var newNFA = new NFA(new NFAState(parser.id++, false),
                       new NFAState(parser.id++, true));
  subNFA1.endState.isAccept = false;
  subNFA2.endState.isAccept = false;

  newNFA.startState.addStates(EMPTYTOKEN, subNFA1.startState);
  newNFA.startState.addStates(EMPTYTOKEN, subNFA2.startState);
  subNFA1.endState.addStates(EMPTYTOKEN, newNFA.endState);
  subNFA2.endState.addStates(EMPTYTOKEN, newNFA.endState);
  return newNFA;
}

RegParser.prototype._expression = function() {
  var expressionNFA = this._expression_without_or();
  if (this.lookHead.type == TOKEN_TYPE.OR) {
    this._match(TOKEN_TYPE.OR);
    return CombineNFAsForOR(expressionNFA, this._expression(), this);
  }
  return expressionNFA;
}

RegParser.prototype._expression_without_or = function() {
  var factorNFA = this._factor();
  if (this.lookHead.type == TOKEN_TYPE.REGCHAR ||
      this.lookHead.type == TOKEN_TYPE.EXTEND ||
      this.lookHead.type == TOKEN_TYPE.LBRACK) {
    var subNFA = this._expression_without_or();
    factorNFA.endState.isAccept = false;
    factorNFA.endState.id = subNFA.startState.id;
    factorNFA.endState.nextStates = subNFA.startState.nextStates;
    subNFA.startState = null;

    return new NFA(factorNFA.startState, subNFA.endState);
  }
  return factorNFA;
}

RegParser.prototype._factor = function() {
  var termNFA = this._term();
  if (this.lookHead.type == TOKEN_TYPE.PLUS) { // case +
    var nfa = new NFA(new NFAState(this.id++, false),
                      new NFAState(this.id++, true));
    termNFA.endState.isAccept = false;
    nfa.startState.addStates(EMPTYTOKEN, termNFA.startState);
    termNFA.endState.addStates(EMPTYTOKEN, termNFA.startState);
    termNFA.endState.addStates(EMPTYTOKEN, nfa.endState);
    this._match(TOKEN_TYPE.PLUS);

    return nfa;
  } else if (this.lookHead.type == TOKEN_TYPE.STAR) { // case *
    var nfa = new NFA(new NFAState(this.id++, false),
                      new NFAState(this.id++, true));
    termNFA.endState.isAccept = false;

    nfa.startState.addStates(EMPTYTOKEN, termNFA.startState);
    nfa.startState.addStates(EMPTYTOKEN, nfa.endState);
    termNFA.endState.addStates(EMPTYTOKEN, nfa.endState);
    termNFA.endState.addStates(EMPTYTOKEN, termNFA.startState);

    this._match(TOKEN_TYPE.STAR);
    return nfa;
  } else if (this.lookHead.type == TOKEN_TYPE.ALTER) { // case ?
    var nfa = new NFA(new NFAState(this.id++, false),
                      new NFAState(this.id++, true));
    termNFA.endState.isAccept = false;

    nfa.startState.addStates(EMPTYTOKEN, termNFA.startState);
    nfa.startState.addStates(EMPTYTOKEN, nfa.endState);
    termNFA.endState.addStates(EMPTYTOKEN, nfa.endState);

    this._match(TOKEN_TYPE.ALTER);
    return nfa;
  } else if (this.lookHead.type == TOKEN_TYPE.Unknown) {
    throw new Error("Unknown symbol: " + this.lookHead.text);
  }
  return termNFA;
}

function constructCharacterNFA(characters, parser) {
  var nfa = new NFA(new NFAState(parser.id++, false),
                    new NFAState(parser.id++, true));
  for (var i = 0; i < characters.length; ++i) {
    var subNFA = new NFA(new NFAState(parser.id++, false),
                         new NFAState(parser.id++, false));

    subNFA.startState.addStates(EMPTYTOKEN, subNFA.endState);
    nfa.startState.addStates({text: characters[i]}, subNFA.startState);
    subNFA.endState.addStates(EMPTYTOKEN, nfa.endState);
  }
  return nfa;
}


RegParser.prototype._term = function() {
  if (this.lookHead.type == TOKEN_TYPE.REGCHAR) {
    var nfa = new NFA(new NFAState(this.id++, false),
                      new NFAState(this.id++, true));
    nfa.startState.addStates(this.lookHead, nfa.endState);
    this._match(TOKEN_TYPE.REGCHAR);
    return nfa;
  } else if (this.lookHead.type == TOKEN_TYPE.LBRACK) {
    this._match(TOKEN_TYPE.LBRACK);
    var nfa = this._expression();
    this._match(TOKEN_TYPE.RBRACK);
    return nfa;
  } else if (this.lookHead.type == TOKEN_TYPE.EXTEND) {
    // [0-9]
    var digitCharArray = Array.apply(null, {length: 10}).map(
        function (x,i) { return (i) });
    if (this.lookHead.text == '\d') {
      var nfa = constructCharacterNFA(digitCharArray, this);
      this._match(TOKEN_TYPE.EXTEND);
      return nfa;
    } else if (this.lookHead.text == '\w') {
      // [a-zA-Z0-9_]
      var allCharacters = (digitCharArray).concat(
          Array.apply(null, {length: 26}).map(
              function (x,i) { return String.fromCharCode(97 + i) }));
      allCharacters = allCharacters.concat(Array.apply(null, {length: 26})
           .map(function (x,i) { return String.fromCharCode(65 + i) }));
      allCharacters.push('_');

      var nfa = constructCharacterNFA(allCharacters, this);
      this._match(TOKEN_TYPE.EXTEND);
      return nfa;
    }
  }
  throw new Error('Invalid term: ' + this.lookHead.text);
}

RegParser.prototype._match = function(type) {
  if (this.lookHead.type == type)
    this._consume();
  else
    throw new Error('Cannot match type: ' + this.lookHead.text);
}

RegParser.prototype._consume = function(type) {
  this.lookHead = this.lexer.nextToken();
}

module.exports.RegParser = RegParser;
module.exports.FSM = FSM;

},{"./dot-converter":1,"./lexer":2}]},{},[]);
