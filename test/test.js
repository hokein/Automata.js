var regparser = require('../src/regparser')
var assert = require("assert")

var testcases = [
  "a",
  "(a)",
  "ab",
  "a*",
  "a+",
  "(a*)|(b+)|(cd)|(e?)",
];

describe('Lexer', function() {
  describe('#testcase: ' + testcases[0], function() {
     it('', function() { 
       var lexer = new regparser.Lexer(testcases[0]);
       assert.equal(true, lexer.hasNext());
       assert.equal('a', lexer.nextToken().text);
     })
  });
  describe('#testcase: ' + testcases[1], function() {
    it('', function() {
      var lexer = new regparser.Lexer(testcases[1]);
      assert.equal(true, lexer.hasNext());
      assert.equal('(', lexer.nextToken().text);
      assert.equal('a', lexer.nextToken().text);
      assert.equal(')', lexer.nextToken().text);
    })
  });
  describe('#testcase: ' + testcases[5], function() {
    it('', function() {
      var lexer = new regparser.Lexer(testcases[5]);
      assert.equal(true, lexer.hasNext());
      assert.equal('(', lexer.nextToken().text);
      assert.equal('a', lexer.nextToken().text);
      assert.equal('*', lexer.nextToken().text);
      assert.equal(')', lexer.nextToken().text);
      assert.equal('|', lexer.nextToken().text);
      assert.equal('(', lexer.nextToken().text);
      assert.equal('b', lexer.nextToken().text);
      assert.equal('+', lexer.nextToken().text);
      assert.equal(')', lexer.nextToken().text);
      assert.equal('|', lexer.nextToken().text);
      assert.equal('(', lexer.nextToken().text);
      assert.equal('c', lexer.nextToken().text);
      assert.equal('d', lexer.nextToken().text);
      assert.equal(')', lexer.nextToken().text);
      assert.equal('|', lexer.nextToken().text);
      assert.equal('(', lexer.nextToken().text);
      assert.equal('e', lexer.nextToken().text);
      assert.equal('?', lexer.nextToken().text);
      assert.equal(')', lexer.nextToken().text);
      assert.equal(false, lexer.hasNext());
      assert.equal('EOF', lexer.nextToken().text);
    });
  });
});

describe('Parser', function() {
  describe('#testcase: ' + testcases[0], function() {
    it('', function() {
      var parser = new regparser.RegParser(testcases[0]);
      var fsm = parser.parseToNFA();
      assert.equal(2, fsm.states.length);
      assert.equal(true, fsm.states[0].initial);
      assert.equal(true, fsm.states[1].accept);
      assert.equal(1, fsm.transitions.length);
      assert.equal(0, fsm.transitions[0].from);
      assert.equal(1, fsm.transitions[0].to);
      assert.equal('a', fsm.transitions[0].label);
    });
  });
  describe('#testcase: ' + testcases[1], function() {
    it('', function() {
      var parser = new regparser.RegParser(testcases[1]);
      var fsm = parser.parseToNFA();
      assert.equal(2, fsm.states.length);
      assert.equal(true, fsm.states[0].initial);
      assert.equal(true, fsm.states[1].accept);
      assert.equal(1, fsm.transitions.length);
      assert.equal(0, fsm.transitions[0].from);
      assert.equal(1, fsm.transitions[0].to);
      assert.equal('a', fsm.transitions[0].label);
    });
  });
  describe('#testcase: ' + testcases[2], function() {
    it('', function() {
      var parser = new regparser.RegParser(testcases[2]);
      var fsm = parser.parseToNFA();
      assert.equal(3, fsm.states.length);
      assert.notEqual([], fsm.states.filter(function(state) {
        return state.name == 0 && state.initial; 
      }));
      assert.notEqual([], fsm.states.filter(function(state) {
        return state.name == 2 && state.accept;
      }));
      assert.notEqual([], fsm.states.filter(function(state) {
        return state.name == 1; 
      }));
      assert.notEqual([], fsm.transitions.filter(function(transition) {
        return transition.from == 0 && transition.to == 1 &&
            transition.label == 'a'; 
      }));
      assert.notEqual([], fsm.transitions.filter(function(transition) {
        return transition.from == 1 && transition.to == 2 &&
            transition.label == 'b'; 
      }));
    });
  });
  describe('#testcase: ' + testcases[3], function() {
    it('', function() {
      var parser = new regparser.RegParser(testcases[3]);
      var fsm = parser.parseToNFA();
      assert.equal(4, fsm.states.length);
      assert.notEqual([], fsm.states.filter(function(state) {
        return state.name == 0 && state.initial; 
      }));
      assert.equal(1, fsm.transitions.filter(function(transition) {
        return transition.label == 'a'; 
      }).length);
      assert.equal(4, fsm.transitions.filter(function(transition) {
        return transition.label == 'ε'; 
      }).length);
    });
  });
  describe('#testcase: ' + testcases[4], function() {
    it('', function() {
      var parser = new regparser.RegParser(testcases[4]);
      var fsm = parser.parseToNFA();
      assert.equal(4, fsm.states.length);
      assert.notEqual([], fsm.states.filter(function(state) {
        return state.name == 0 && state.initial; 
      }));
      assert.equal(1, fsm.transitions.filter(function(transition) {
        return transition.label == 'a'; 
      }).length);
      assert.equal(3, fsm.transitions.filter(function(transition) {
        return transition.label == 'ε'; 
      }).length);
    });
  });
  describe('#testcase: ' + testcases[5], function() {
    it('', function() {
      var parser = new regparser.RegParser(testcases[5]);
      var fsm = parser.parseToNFA();
      assert.equal(1, fsm.states.filter(function(state) {
        return state.name == 0 && state.initial; 
      }).length);
      assert.equal(1, fsm.transitions.filter(function(transition) {
        return transition.label == 'a'; 
      }).length);
      assert.equal(1, fsm.transitions.filter(function(transition) {
        return transition.label == 'b'; 
      }).length);
      assert.equal(1, fsm.transitions.filter(function(transition) {
        return transition.label == 'c'; 
      }).length);
      assert.equal(1, fsm.transitions.filter(function(transition) {
        return transition.label == 'd'; 
      }).length);
      assert.equal(1, fsm.transitions.filter(function(transition) {
        return transition.label == 'e'; 
      }).length);
    });
  });
});

