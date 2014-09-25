var DOTSCRIPTBEGIN = 'digraph finite_state_machine {\n' + 
                     '  rankdir = LR;\n' +
                     '  node [shape = doublecircle];0;\n';
var DOTSCRIPTNODESETTING = '  node [shape = plaintext];\n' +
                           '  "" ->0 [label =\"start\"];\n' +
                           '  node [shape = circle];\n';
var DOTSCRIPTEND = '}\n';

var TOKEN_TYPE = {
  LBRACK: '(',
  RBRACK: ')',
  STAR: '*',
  PLUS: '+',
  OR: '|',
  ALTER: '?',
  END: 'EOF',
  EMPTY: 'empty',
  UNKNOWN: 'unknown',
  LETTER: 'a-z0-9',
};

function isLetterOrDigit(regChar) {
  return (regChar >= 'a' && regChar <= 'z') ||
         (regChar >= 'A' && regChar <= 'Z') ||
         (regChar >= '0' && regChar <= '9');
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
      case ' ':
        this._consume();
        continue;
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
        if (isLetterOrDigit(this.regString[this.index])) 
           return new Token(TOKEN_TYPE.LETTER, this.regString[this.index++]);
        else
           throw new Error('Unknown type of ' + this.regString[this.index]);
    }
  }
  return new Token(TOKEN_TYPE.END, 'EOF'); 
}

Lexer.prototype._consume = function() {
  return ++this.index;
}

// class NFAState
function NFAState(id, isEnd) {
  this.id = id;
  this.isEnd = isEnd;
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

// class FSM, represent a finite state machine.
// format:
//   {
//      state: [{name:"xx", initial: true},
//              {name:"XX"}, ...,
//              {name:"XX", end, true} ],
//      transition: [{from: "", to: "", label:""}]
//   }
function FSM() {
  this.states = [];
  this.transitions = [];
};

FSM.prototype.toDotScript = function() {
  var dotScript = "";
  for (var i = 0; i < this.transitions.length; ++i) {
    dotScript += '  ' + this.transitions[i].from + '->' + 
        this.transitions[i].to + ' [label="' + 
        this.transitions[i].label  + '"];\n';
  }
  var endStateId;
  for (var i = 0; i < this.states[i].length; ++i) {
    if (this.states[i].end) {
      endStateId = this.states[i].name;
    }
  }
  return DOTSCRIPTBEGIN + "  node [shape = doublecircle];" + endStateId + ";\n"
      + DOTSCRIPTNODESETTING + dotScript + DOTSCRIPTEND;
};

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
  try {
    this.nfa = this._expression();
  } catch (e) {
    console.log(e);
    return new FSM();
  }
  this._reorderNFAStateId();
  return this._traversalFSM();
}

RegParser.prototype._traversalFSM = function() {
  var fsm = new FSM();
  var queue = []; 
  var vis = {};
  queue.push(this.nfa.startState);
  fsm.states.push({name: this.nfa.startState.id, initial: true});
  vis[this.nfa.startState.id] = 1;
  while (queue.length) {
    var state = queue.shift();
    for (var i = 0; i < (state.nextStates).length; ++i) {
      var nextId = state.nextStates[i][1].id;
      var label = state.nextStates[i][0].text;
      var nextState = state.nextStates[i][1];
      fsm.transitions.push({from: state.id, to: nextId, label: label});
      if (nextId in vis)
        continue;
      vis[nextId] = 1;
      if (nextState.isEnd)
        fsm.states.push({name: nextId, end: true});
      else
        fsm.states.push({name: nextId});
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

//RegParser.prototype.traversalAllEdges = function(state, vis) {
  //vis[state.id] = 1;
  //var result = "";
  //for (var i = 0; i < state.nextStates.length; ++i) {
    //var token = state.nextStates[i][0];
    //var nextState = state.nextStates[i][1]; 
    //if (token.type != TOKEN_TYPE.EMPTY) {
      //result += '  ' + state.id + '->' + nextState.id + ' [label="' + token.text  + '"];\n';
    //} else {
      //result += '  ' + state.id + '->' + nextState.id + ' [label="ε"];\n';
    //}
    //if (!(nextState.id in vis)) {
      //result += this.traversalAllEdges(nextState, vis);
    //}
  //}
  //return result;
//}

//RegParser.prototype.toDotScript = function() {
  //var vis = {};
  //var output = "";
  //output = this.traversalAllEdges(this.nfa.startState, vis, output);
  //return DOTSCRIPTBEGIN + "  node [shape = doublecircle];" + this.nfa.endState.id + ";\n"
      //+ DOTSCRIPTNODESETTING + output + DOTSCRIPTEND;
//}

RegParser.prototype._expression = function() {
  var factorNFA = this._factor();
  if (this.lookHead.type == TOKEN_TYPE.LETTER ||
      this.lookHead.type == TOKEN_TYPE.LBRACK) {
    var subNFA = this._expression();
    factorNFA.endState.isEnd = false;
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
    var nfa = new NFA(new NFAState(this.id++, false), new NFAState(this.id++, true));
    termNFA.endState.isEnd = false;
    nfa.startState.addStates(EMPTYTOKEN, termNFA.startState); 
    termNFA.endState.addStates(EMPTYTOKEN, termNFA.startState);
    termNFA.endState.addStates(EMPTYTOKEN, nfa.endState);
    this._match(TOKEN_TYPE.PLUS);

    return nfa;
  } else if (this.lookHead.type == TOKEN_TYPE.STAR) { // case *
    var nfa = new NFA(new NFAState(this.id++, false), new NFAState(this.id++, true));
    termNFA.endState.isEnd = false;

    nfa.startState.addStates(EMPTYTOKEN, termNFA.startState);
    nfa.startState.addStates(EMPTYTOKEN, nfa.endState); 
    termNFA.endState.addStates(EMPTYTOKEN, nfa.endState);
    termNFA.endState.addStates(EMPTYTOKEN, termNFA.startState);
     
    this._match(TOKEN_TYPE.STAR);
    return nfa; 
  } else if (this.lookHead.type == TOKEN_TYPE.OR) { // case |
    this._match(TOKEN_TYPE.OR);
     
    var factorNFA = this._factor();
    var nfa = new NFA(new NFAState(this.id++, false), new NFAState(this.id++, true));
    termNFA.endState.isEnd = false;
    factorNFA.endState.isEnd = false;

    nfa.startState.addStates(EMPTYTOKEN, termNFA.startState);
    nfa.startState.addStates(EMPTYTOKEN, factorNFA.startState);
    termNFA.endState.addStates(EMPTYTOKEN, nfa.endState);
    factorNFA.endState.addStates(EMPTYTOKEN, nfa.endState);
    
    return nfa;
  } else if (this.lookHead.type == TOKEN_TYPE.ALTER) { // case ?
    var nfa = new NFA(new NFAState(this.id++, false), new NFAState(this.id++, true));
    termNFA.endState.isEnd = false;

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

RegParser.prototype._term = function() {
  if (this.lookHead.type == TOKEN_TYPE.LETTER) {
    var nfa = new NFA(new NFAState(this.id++, false), new NFAState(this.id++, true));
    nfa.startState.addStates(this.lookHead, nfa.endState);
    this._match(TOKEN_TYPE.LETTER);
    return nfa;
  } else if (this.lookHead.type == TOKEN_TYPE.LBRACK) {
    this._match(TOKEN_TYPE.LBRACK);
    var nfa = this._expression();
    this._match(TOKEN_TYPE.RBRACK);
    return nfa;
  } else {
    throw new Error('Invalid term: ' + this.lookHead.text);
  }
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
module.exports.Lexer = Lexer;
module.exports.FSM = FSM;
