var DOTSCRIPTHEADER = 'digraph finite_state_machine {\n' + 
                     '  rankdir = LR;\n';
var DOTSCRIPTEND = '}\n';

exports.toDotScript = function(fsm) {
  var transitionDotScript = '  node [shape = circle];\n';
  for (var from_id in fsm.transitions) {
    for (var to_id in fsm.transitions[from_id]) {
    transitionDotScript += '  ' + [from_id] + '->' + to_id + ' [label="' +
        fsm.transitions[from_id][to_id]  + '"];\n';
    }
  }
  var initialStatesDotScript = '';
  var initialStatesStartDotScript = '  node [shape = plaintext];\n';
  var acceptStatesDotScript = '';
  for (var i = 0; i < fsm.numOfStates; ++i) {
    if (fsm.acceptState == i)
      acceptStatesDotScript += '  node [shape = doublecircle]; ' + i + ';\n';
    if (fsm.initialState == i) {
      initialStatesStartDotScript += '  "" -> ' + i + ' [label = "start"];\n';
      // accept is higher priority than initial state.
      if (fsm.acceptState != i)
        initialStatesDotScript += '  node [shape = circle]; ' + i + ';\n';
    }
  }
  return DOTSCRIPTHEADER + initialStatesDotScript + acceptStatesDotScript +
      initialStatesStartDotScript + transitionDotScript + DOTSCRIPTEND;
}
