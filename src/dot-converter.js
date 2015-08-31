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
