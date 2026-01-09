const CODE = {
  reset: "\x1b[0m",
  negrita: "\x1b[1m",
  brigth: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  magent: "\x1b[35m",
};



export const paint = (color, text) =>{
    if(!process.stdout.isTTY) return text;


    return `${CODE[color] || ''}${text}${CODE.reset}`
}



export const red = (text) => paint('red', text);
export const green = (text) => paint('green', text);
export const yellow = (text) => paint('yellow', text);
export const blue = (text) => paint('blue', text);
export const cyan = (text) => paint('cyan', text);
export const magent = (text) => paint('magent', text);
export const brigth = (text) => paint('brigth', text);
export const bold = (text) => paint('negrita', text);
