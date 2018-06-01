var regparser = require('../src/regparser');
var Lexer = require('../src/lexer').Lexer;
var assert = require("assert");

var testcases = [
  "a",
  "(a)",
  "ab",
  "a*",
  "a+",
  "(a*)|(b+)|(cd)|(e?)",
  "abc|d|ef|g",
  " abc",
  "abc\\na",
  "\\t abc",
  "\\r ",
  "\\\\",
  "__123",
  "abc\\d+",
  "\\w+",
  "a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z|0|1|2|3|4|5"
];

describe('Lexer', function() {
  describe('#testcase: ' + testcases[0], function() {
     it('', function() {
       var lexer = new Lexer(testcases[0]);
       assert.equal(true, lexer.hasNext());
       assert.equal('a', lexer.nextToken().text);
     })
  });
  describe('#testcase: ' + testcases[1], function() {
    it('', function() {
      var lexer = new Lexer(testcases[1]);
      assert.equal(true, lexer.hasNext());
      assert.equal('(', lexer.nextToken().text);
      assert.equal('a', lexer.nextToken().text);
      assert.equal(')', lexer.nextToken().text);
    })
  });
  describe('#testcase: ' + testcases[5], function() {
    it('', function() {
      var lexer = new Lexer(testcases[5]);
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

describe('Parser NFA Test', function() {
  describe('#testcase: ' + testcases[0], function() {
    it('', function() {
      var parser = new regparser.RegParser(testcases[0]);
      var fsm = parser.parseToNFA();
      assert.equal(2, fsm.numOfStates);
      assert.equal(0, fsm.initialState);
      assert.equal(1, fsm.acceptStates[0]);
      assert.equal('a', fsm.transitions['0']['1']);
    });
  });
  describe('#testcase: ' + testcases[1], function() {
    it('', function() {
      var parser = new regparser.RegParser(testcases[1]);
      var fsm = parser.parseToNFA();
      assert.equal(2, fsm.numOfStates);
      assert.equal(0, fsm.initialState);
      assert.equal(1, fsm.acceptStates[0]);
      assert.equal('a', fsm.transitions['0']['1']);
    });
  });
  describe('#testcase: ' + testcases[2], function() {
    it('', function() {
      var parser = new regparser.RegParser(testcases[2]);
      var fsm = parser.parseToNFA();
      assert.equal(3, fsm.numOfStates);
      assert.equal(0, fsm.initialState);
      assert.equal(2, fsm.acceptStates[0]);
      assert.equal('a', fsm.transitions['0']['1']);
      assert.equal('b', fsm.transitions['1']['2']);
    });
  });
  describe('#testcase: ' + testcases[3], function() {
    it('', function() {
      var parser = new regparser.RegParser(testcases[3]);
      var fsm = parser.parseToNFA();
      assert.equal(4, fsm.numOfStates);
      assert.equal(0, fsm.initialState);
      var cnt_a = 0;
      var cnt_empty = 0;
      for (var from_id in fsm.transitions) {
        for (var to_id in fsm.transitions[from_id]) {
          if (fsm.transitions[from_id][to_id] == 'a')
            ++cnt_a;
          else if (fsm.transitions[from_id][to_id] == 'ε')
            ++cnt_empty;
        }
      }
      assert.equal(1, cnt_a);
      assert.equal(4, cnt_empty);
    });
  });
  describe('#testcase: ' + testcases[4], function() {
    it('', function() {
      var parser = new regparser.RegParser(testcases[4]);
      var fsm = parser.parseToNFA();
      assert.equal(4, fsm.numOfStates);
      assert.equal(0, fsm.initialState);
      var cnt_a = 0;
      var cnt_empty = 0;
      for (var from_id in fsm.transitions) {
        for (var to_id in fsm.transitions[from_id]) {
          if (fsm.transitions[from_id][to_id] == 'a')
            ++cnt_a;
          else if (fsm.transitions[from_id][to_id] == 'ε')
            ++cnt_empty;
        }
      }
      assert.equal(1, cnt_a);
      assert.equal(3, cnt_empty);
    });
  });
  describe('#testcase: ' + testcases[5], function() {
    it('', function() {
      var parser = new regparser.RegParser(testcases[5]);
      var fsm = parser.parseToNFA();
      assert.equal(0, fsm.initialState);
      var cnt_a = 0, cnt_b = 0, cnt_c = 0, cnt_d = 0, cnt_e = 0;
      for (var from_id in fsm.transitions) {
        for (var to_id in fsm.transitions[from_id]) {
          switch(fsm.transitions[from_id][to_id]) {
            case 'a':
              ++cnt_a;
              break;
            case 'b':
              ++cnt_b;
              break;
            case 'c':
              ++cnt_c;
              break;
            case 'd':
              ++cnt_d;
              break;
            case 'e':
              ++cnt_e;
              break;
          }
        }
      }
      assert.equal(1, cnt_a);
      assert.equal(1, cnt_b);
      assert.equal(1, cnt_c);
      assert.equal(1, cnt_d);
      assert.equal(1, cnt_e);
    });
  });
});


describe('Parser match Test', function() {
  describe('#testcase: ' + testcases[0], function() {
    it('', function() {
      var parser = new regparser.RegParser(testcases[0]);
      var fsm = parser.parseToDFA();
      assert.equal(true, fsm.match(testcases[0]));
      assert.equal(false, fsm.match(''));
    });
  });
  describe('#testcase: ' + testcases[1], function() {
    it('', function() {
      var parser = new regparser.RegParser(testcases[1]);
      var fsm = parser.parseToDFA();
      assert.equal(true, fsm.match('a'));
      assert.equal(false, fsm.match(''));
    });
  });
  describe('#testcase: ' + testcases[2], function() {
    it('', function() {
      var parser = new regparser.RegParser(testcases[2]);
      var fsm = parser.parseToDFA();
      assert.equal(true, fsm.match(testcases[2]));
      assert.equal(false, fsm.match('az'));
      assert.equal(false, fsm.match('z'));
    });
  });
  describe('#testcase: ' + testcases[3], function() {
    it('', function() {
      var parser = new regparser.RegParser(testcases[3]);
      var fsm = parser.parseToDFA();
      assert.equal(true, fsm.match('aaaaaa'));
      assert.equal(true, fsm.match('a'));
      assert.equal(true, fsm.match(''));
      assert.equal(false, fsm.match('aaaz'));
    });
  });
  describe('#testcase: ' + testcases[6], function() {
    it('', function() {
      var parser = new regparser.RegParser(testcases[6]);
      var fsm = parser.parseToDFA();
      assert.equal(true, fsm.match('abc'));
      assert.equal(true, fsm.match('d'));
      assert.equal(true, fsm.match('ef'));
      assert.equal(true, fsm.match('g'));
      assert.equal(false, fsm.match('e'));
      assert.equal(false, fsm.match('abcd'));
    });
  });
  describe('#testcase: ' + testcases[7], function() {
    it('', function() {
      var parser = new regparser.RegParser(testcases[7]);
      var fsm = parser.parseToDFA();
      assert.equal(true, fsm.match(' abc'));
    });
  });
  describe('#testcase: ' + testcases[8], function() {
    it('', function() {
      var parser = new regparser.RegParser(testcases[8]);
      var fsm = parser.parseToDFA();
      assert.equal(true, fsm.match('abc\na'));
    });
  });
  describe('#testcase: ' + testcases[9], function() {
    it('', function() {
      var parser = new regparser.RegParser(testcases[9]);
      var fsm = parser.parseToDFA();
      assert.equal(true, fsm.match('\t abc'));
    });
  });
  describe('#testcase: ' + testcases[10], function() {
    it('', function() {
      var parser = new regparser.RegParser(testcases[10]);
      var fsm = parser.parseToDFA();
      assert.equal(true, fsm.match('\r '));
    });
  });
  describe('#testcase: ' + testcases[11], function() {
    it('', function() {
      var parser = new regparser.RegParser(testcases[11]);
      var fsm = parser.parseToDFA();
      assert.equal(true, fsm.match('\\'));
    });
  });
  describe('#testcase: ' + testcases[12], function() {
    it('', function() {
      var parser = new regparser.RegParser(testcases[12]);
      var fsm = parser.parseToDFA();
      assert.equal(true, fsm.match('__123'));
    });
  });
  describe('#testcase: ' + testcases[13], function() {
    it('', function() {
      var parser = new regparser.RegParser(testcases[13]);
      var fsm = parser.parseToDFA();
      assert.equal(true, fsm.match('abc1'));
      assert.equal(true, fsm.match('abc123'));
      assert.equal(false, fsm.match('abcd'));
    });
  });
  describe('#testcase: ' + testcases[14], function() {
    it('', function() {
      var parser = new regparser.RegParser(testcases[14]);
      var fsm = parser.parseToDFA();
      assert.equal(true, fsm.match('abc1'));
      assert.equal(true, fsm.match('abc123'));
      assert.equal(false, fsm.match('abcd!'));
    });
  });
  describe('#testcase: ' + testcases[15], function() {
    it('', function() {
      var parser = new regparser.RegParser(testcases[15]);
      var fsm = parser.parseToDFA();
      assert.equal(true, fsm.match('a'));
      assert.equal(true, fsm.match('x'));
      assert.equal(true, fsm.match('t'));
      assert.equal(true, fsm.match('5'));
    });
  });
});
