const alternate_styleSheets = document.querySelectorAll('link[title]');
const prefered_styleSheet = alternate_styleSheets[0];
const styleSheet_switcher = document.querySelector('input[type=range]');
const sound_whoosh = document.getElementById("whoosh");
const beep = document.getElementById("beep");




const buttons = document.querySelectorAll('button.key');

styleSheet_switcher.value = 1;
let clock = null;

styleSheet_switcher.addEventListener('change', handle_switch);

function handle_switch() {
    clearTimeout(clock);
    clock = setTimeout(() => switch_styleSheet(this), 50);
}

function switch_styleSheet(slider) {

  sound_whoosh.pause();
  sound_whoosh.currentTime = 0;
  sound_whoosh.play();

  const index = slider.value;
  prefered_styleSheet.href = `css/theme_${index}.css`;
}

buttons.forEach( (button) => {
  button.addEventListener('mousedown', onMouseDown);
  button.addEventListener('transitionend', onTransitionEnded);
});

function onMouseDown(){
  this.classList.add('pressed');
  beep.volume = 0.2;
  beep.currentTime = 0;
  beep.play();

  const that = this;
  handleKeyPress(that);
}

function onTransitionEnded(e){

  if(!this.classList.contains('pressed')) return;
    this.classList.remove('pressed');
    beep.pause();
}



/* calculator functions*/

let display_output = document.querySelector('.display-output');
let display_input = document.querySelector('.display-input');
const operators = ['-','+','*','/'];
let result_is_displayed = false;
let input = "";
let result = "";


function handleKeyPress( button ){

    const value = button.dataset.key;
    const value_is_valid = validateInput(value);
    const input_has_operator = !!input.match(/[-+/*]/);

    const decimalMatch = input.match(/\d+\.\d+$/);
    const lastDecimal = decimalMatch ? decimalMatch[0] : '';

    let lastInput = lastDecimal || input.substring(input.length -1);

    const numericsMatch = input.match(/[-*/+](\d+)$/);
    const lastNumerics = numericsMatch ? numericsMatch[1] : '';


    const dotEndsInputMatch = input.match(/[-*/+](\d+\.)$/);
    const dotEndsInput = dotEndsInputMatch ? dotEndsInputMatch[1] : '';

    const operatorEndsInputMatch = input.match(/[\d.]+[+/*-]$/) ? true : false;



    switch(true){

    case value === 'RESET':
      resetApp()
    break;

    case value === 'DEL':

      let stepBack = 0;

        /* the equals ( = ) sign is never added to the end of the input! */
      if( result_is_displayed ) {
        stepBack = 1;
        result_is_displayed = false;
      }
      else   stepBack = 2;

        let previousValue = input.charAt(input.length - stepBack) || '';
        input = input.substring(0, input.length -  stepBack) || "";
        display_output.innerHTML = '';

        if( previousValue === '' ) {
          resetApp();
        }
        else{
          handleKeyPress({dataset : {key : previousValue } });
        }
    break;

  /* key is an OPERATOR */
    case operators.includes(value) && value_is_valid:

        if(operators.includes(lastInput)){//operator key is changed at the end of input

          input = input.substring(0, input.length -1) + value;
          display_input.innerHTML = input;
        }

        else if( result_is_displayed ){ // an operator key is pressed after = was pressed

          result = Math.trunc(eval(input)*1000) / 1000;
          input = `${result}${value}`;
          display_input.innerHTML = input;
          result_is_displayed = false;
        }

        else if(input_has_operator){// evaluate the result of the former operation between two numbers and start a new operation with the result

          try{
              result = Math.trunc(eval(input)*1000) / 1000;
            }
            catch( err ){
              throw(err);
            }

          input = `${result}${value}`;
          display_input.innerHTML = `${prepareOutput(result)}${value}`;
          display_output.innerHTML = prepareOutput(result);
        }
        else {// add the operator to the end of the first number
          display_input.innerHTML = `${prepareOutput(input)}${value}`;
          input = `${input}${value}`;
        }
    break;

/* key is a NUMBER */
    case  value.match(/\d/) && value_is_valid:

      if(result_is_displayed){// after = was pressed -> reset everything

        resetApp();
        input = value;
        display_output.innerHTML = value
        result_is_displayed = false;
      }
      else if( input_has_operator ){// after the operator in the second number, or we are starting the second number

        input = `${input}${value}`;
        display_input.innerHTML = input;
        display_output.innerHTML = prepareOutput(dotEndsInput? `${dotEndsInput}${value}` : operatorEndsInputMatch? value : lastDecimal ? `${lastDecimal}${value}` : lastNumerics ? `${lastNumerics}${value}` : value);
      }

      else{
        input = `${input}${value}`;
        display_output.innerHTML = prepareOutput(input);
        }
    break;

    /* key is DOT */
    case value === '.' && result_is_displayed === true: // after = was pressed -> reset the whole thing
        resetApp();
        input = `0${value}`;
        display_output.innerHTML = prepareOutput(input);
        result_is_displayed = false;
    break;

    case  value === '.' && value_is_valid:
      input = `${input}${value}`;
      display_output.innerHTML = input;

      if(input_has_operator){// we are in the second number after the operator
        display_output.innerHTML = prepareOutput(`${lastNumerics}${value}`);
        display_input.innerHTML = `${input}`;

      }
    break;

/* key is = */
    case value === '=' && value_is_valid:
      if( !result_is_displayed ){

        result = Math.trunc(eval(input)*1000) / 1000;
        display_input.innerHTML = `${input}${value}`;
        display_output.innerHTML = prepareOutput(result.toString());
        result_is_displayed = true;
      }
      else{

        input = input.replace(/^^-?[\d.]+/, result);
        result = Math.trunc(eval(input)*1000) / 1000;
        display_input.innerHTML = `${input}${value}`;
        display_output.innerHTML = prepareOutput(result);
      }
      break;

      default:

}
}



function validateInput ( value ){

  const decimalMatch = input.match(/\d+\.\d+$/);
  const lastDecimal = decimalMatch ? decimalMatch[0] : '';
  let lastInput = lastDecimal || input.substring(input.length -1);


  switch(true){

  /* there can be only ONE dot ( . ) character in the expression UNLESS there is an operator sign between them ex. 1.24 + 8.36 OK, but 23.45.2 is wrong */
  
  case value === '.' && input.lastIndexOf('.') > -1:

    const in_between_characters = input.substring(input.lastIndexOf('.'));
    const operatorMatch = in_between_characters.match(/[-/*+]/) == null? false : true;
    return operatorMatch;
    break;

    /* only a number can come after a dot ( . ) in the expression */
    case lastInput === '.':
      return value.match(/\d/)? true : false;
      break;

    /* a dot ( . ) can only come after a number */
    case value === '.':
      return lastInput.match(/\d/)? true : false;
      break;

    /* the expression cannot start with zero ( 0 ) unless it is followed by a dot or an operator character */
      case lastInput === '0' && input.length === 1:
        return value === '.' || operators.includes(value)? true : false;
        break;


    /* only the plus ( + ) and the minus ( - ) operator signs can start an expression */
    case lastInput === '' && operators.includes( value ):
      return (value === '+' || value === '-')? true : false;
      break;

    /* the expression cannot start with an equals sign, or a dot */
    case lastInput === '' && ( value === '=' || value === '.'):
      return false;
      break;


    /* the equals sign ( = ) can only come after a number, but only if it is the second number ( after the operator , eg 23+2= ) in the expression AND the number cannot be 0 if the operator is the devison sign ( / ) */
    case lastInput.match(/\d/) && value === '=':
      if(input.match(/[/*+-]/) && lastInput.match(/\d/))  {

        penultimate_character = input.charAt(input.length -2);
        return penultimate_character === '/' && lastInput === '0' ? false : true;

      }else{
        return false;
      }
      break;

        /* the equals ( = ) sign cannot directly follow an operator sign */
      case lastInput.match(/[-+/*]/) && value == '=':
        return false;
        break;

      default:
        return true;
  }
}

function resetApp(){

  input = '';
  display_input.innerHTML = '';
  display_output.innerHTML = '';
  isResultShown = false;
  return true;
}

function prepareOutput( number ){

  number = String(number);
  let possibleDotAtEnd = number.charAt(number.length - 1) === '.' ? '.' : '';

  [whole, decimal=''] = number.split('.');
  const reg = new RegExp("\\B(?=(\\d{3})+(?!\\d))","g");
  whole = whole.replace( reg, ',');

  return decimal ==='' ? `${whole}${possibleDotAtEnd}` : `${whole}.${decimal}`;
}

resetApp();

