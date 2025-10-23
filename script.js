function add(...numbers){
        let sum = numbers.reduce((acc, num) => {
            return acc + num;
        }, 0);
        return sum;
}

function subtract(...numbers){
    let difference = numbers.reduce((acc, num) => {
        return acc - num;
    }, 0);
    return difference;
}

function multiply(...numbers){
    let product = numbers.reduce((acc, num) => {
        return acc * num;
    }, 1);
    return product;
}

function divide(num1, num2){
    if(num2 !== 0){
        return num1/num2;
    }
    else{
        console.error("Division by 0");
    }
}
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

    if (isNumeric(ch)) {
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
const precedence = { '+': 1, '-': 1, '*': 2, '/': 2, '^': 3 };
const isOperator = ch => precedence.hasOwnProperty(ch);
const isRightAssociative = op => op === '^';

function infixToPostfix(str) {
  const stack = []; 
  let out = '';

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];

    // ignore spaces
    if (ch === ' ') continue;

    // operands (numbers)
    else if (isNumeric(ch)) {
      out += ch;
    }

    else if (ch === '(') {
      stack.push(ch);
    }

    else if (ch === ')') {
      // pop until '('
      while (stack.length && stack[stack.length - 1] !== '(') {
        out += stack.pop();
      }
      if (!stack.length) throw new Error('Mismatched parentheses');
      stack.pop(); // discard '('
    
    }

    else if (isOperator(ch)) {
      // pop operators with higher precedence, or equal precedence if left-associative
      while (
        stack.length &&
        isOperator(stack[stack.length - 1]) &&
        (precedence[stack[stack.length - 1]] > precedence[ch] ||
          (precedence[stack[stack.length - 1]] === precedence[ch] &&
           !isRightAssociative(ch)))
      ) {
        out += stack.pop();
      }
      stack.push(ch);
      
    }
    else{
        
    // unknown token
    throw new Error(`Unexpected token: '${ch}'`);

    }

  }

  // flush
  while (stack.length) {
    const top = stack.pop();
    if (top === '(' || top === ')') throw new Error('Mismatched parentheses');
    out += top;
  }

  return out;
}



function evaluatePostfix(token_array){

    const stack = [];
    for(token of token_array){
        if(!isNaN(token)){
            stack.push(parseInt(token));
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
                case '*':
                    stack.push(num1*num2);
                    break;
                case '/':
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
    const result = evaluatePostfix(postfix);
    return result;
}

/**
 * EVENT LISTENERS
 */




let arr = "2+5*3"; 
let result = processCalculatorInput(arr);
console.log(result);

