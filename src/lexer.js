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
