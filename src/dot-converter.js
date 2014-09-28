var DOTSCRIPTHEADER = 'digraph finite_state_machine {\n' + 
                     '  rankdir = LR;\n';
var DOTSCRIPTEND = '}\n';

exports.toDotScript = function(fsm) {
  var transitionDotScript = '  node [shape = circle];\n';
  for (var i = 0; i < fsm.transitions.length; ++i) {
    transitionDotScript += '  ' + fsm.transitions[i].from + '->' + 
        fsm.transitions[i].to + ' [label="' + 
        fsm.transitions[i].label  + '"];\n';
  }
  var initialStatesDotScript = '';
  var initialStatesStartDotScript = '  node [shape = plaintext];\n';
  var acceptStatesDotScript = '';
  for (var i = 0; i < fsm.states.length; ++i) {
    if (fsm.states[i].accept)
      acceptStatesDotScript += '  node [shape = doublecircle]; ' +
          fsm.states[i].name + ';\n';
    if (fsm.states[i].initial) {
      initialStatesStartDotScript += '  "" -> ' +  fsm.states[i].name +
          ' [label = "start"];\n';
      // accept is higher priority than initial state.
      if (!fsm.states[i].accept)
        initialStatesDotScript += '  node [shape = circle]; ' +
            fsm.states[i].name + ';\n';
    }
  }
  return DOTSCRIPTHEADER + initialStatesDotScript + acceptStatesDotScript +
      initialStatesStartDotScript + transitionDotScript + DOTSCRIPTEND;
}
