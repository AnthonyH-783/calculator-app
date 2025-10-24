
function isNumeric(str) {
  if (typeof str != "string") return false // we only process strings!  
  return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
         !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}
function tokenize(str) {
  const tokens = [];
  let current = "";

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === ' ') continue; // skip spaces

    if (isNumeric(ch) || ch === '.') {
      current += ch; // build multi-digit number
    } else {
      if (current !== "") {
        tokens.push(current);
        current = "";
      }
      tokens.push(ch); // push operator or parenthesis
    }
  }

  if (current !== "") tokens.push(current); // flush last number
  return tokens;
}
const isParenthesis = (token) => token === '(' || token === ')';
const precedence = { '+': 1, '-': 1, '×': 2, '÷': 2, '^': 3 };
const isOperator = (ch) => precedence.hasOwnProperty(ch);


const isRightAssociative = op => op === '^';

function infixToPostfix(token_array) {
  const stack = []; 
  let out = [];

  for (let i = 0; i < token_array.length; i++) {
    const token = token_array[i];

    // ignore spaces
    if (token === ' ') continue;

    // operands (numbers)
    else if (isNumeric(token)) {
      out.push(token);
    }

    else if (token === '(') {
      stack.push(token);
    }

    else if (token === ')') {
      // pop until '('
      while (stack.length && stack[stack.length - 1] !== '(') {
        out.push(stack.pop());
      }
      if (!stack.length) throw new Error('Mismatched parentheses');
      stack.pop(); // discard '('
    
    }

    else if (isOperator(token)) {
      // pop operators with higher precedence, or equal precedence if left-associative
      while (
        stack.length &&
        isOperator(stack[stack.length - 1]) &&
        (precedence[stack[stack.length - 1]] > precedence[token] ||
          (precedence[stack[stack.length - 1]] === precedence[token] &&
           !isRightAssociative(token)))
      ) {
        out.push(stack.pop());
      }
      stack.push(token);
      
    }
    else{
        
    // unknown token
    throw new Error(`Unexpected token: '${token}'`);

    }

  }

  // flush
  while (stack.length) {
    const top = stack.pop();
    if (top === '(' || top === ')') throw new Error('Mismatched parentheses');
    out.push(top);
  }

  return out;
}



function evaluatePostfix(token_array){

    const stack = [];
    for(token of token_array){
        if(!isNaN(token)){
            stack.push(parseFloat(token));
        }
        else{
            let num1 = stack.pop();
            let num2 = stack.pop();
            switch(token){
                case '+':
                    stack.push(num1 + num2);
                    break;
                case '-':
                    stack.push(num2 - num1);
                    break;
                case '×':
                    stack.push(num1*num2);
                    break;
                case '÷':
                    stack.push(num2/num1);
                    break;
                case '^':
                    stack.push(Math.pow(num2,num1));
                    break;
            }
        }
     
    }
    return stack.pop();
}


function processCalculatorInput(str){

    const tokens = tokenize(str);
    const postfix = infixToPostfix(tokens);
    const result = Math.round(evaluatePostfix(postfix) * 100) / 100;
    if(isNaN(result)){
        return "Math Error";
    }
    return result;
}


/**
 * EVENT LISTENERS
 */

const output_window = document.querySelector(".output");
const calc_keys = document.querySelector(".calculator-keys");
const maxWidth = 280; // the width of your output container in px
const minFontSize = 1; // smallest readable size
const maxFontSize = 64; // original max size

function clearOutputWindow(){
    output_window.innerText = "";
}
function isOutputWinZero(){
    return output_window.innerText === "0";
}

/**
 * Adding main event listener to calculator keys
 */
calc_keys.addEventListener("click", registerKeyStrokes);

function registerKeyStrokes(evnt){
    let key = evnt.target.innerText; // text on a particular button
    if(key.length > 2){
        // Clicking on space between the keys retreieve all caclulator keys
        key = "invalid";
    }
    if(isOutputWinZero()){
        // Prevents more than a single zero to be written down
        clearOutputWindow();
    }
    switch(key){
        case "=":
            const result = processCalculatorInput(output_window.innerText);
            output_window.innerHTML = result;
            break;
        case 'AC':
            output_window.innerText = "0";
            break;
        case '←':
            const current_length = output_window.innerText.length;
            const current_text = output_window.innerText;
            output_window.innerText = current_text.slice(0, current_length - 1);
            break;
        case "invalid":
            break;
        default:
            if(isNumeric(key) || isOperator(key) || key === '.' || isParenthesis(key)){
            output_window.innerText += key;
            break;
            }
    }
    adjustOutputScale(); // Resizes output window based on input length
}

function adjustOutputScale() {
  const currentWidth = measureString();
  const currentFontSize = parseFloat(window.getComputedStyle(output_window).fontSize);

  // Too wide -> scale down
  if (currentWidth > maxWidth) {
    scaleOutputWindowBy(0.9);
  }
  // Has space -> scale up
  else if (currentWidth < maxWidth * 0.8 && currentFontSize < maxFontSize) {
    scaleOutputWindowBy(1.1);
  }
}

function scaleOutputWindowBy(scale_factor) {
  const output_size = parseFloat(window.getComputedStyle(output_window).fontSize);
  output_window.style.fontSize = Math.ceil(output_size * scale_factor) + "px";
}

function measureString() {
    // Creating a span element containing the text
    const text = document.createElement("span");
    document.body.appendChild(text);

    text.style.position = 'absolute';
    text.style.whiteSpace = 'no-wrap';
    text.innerHTML = output_window.innerHTML;
    text.style.fontSize = window.getComputedStyle(output_window).fontSize;

    const width = Math.ceil(text.clientWidth);
    

    document.body.removeChild(text);

    return width;
}

