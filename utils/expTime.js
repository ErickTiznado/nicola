
export const getExpTime = (durationStr) => {

const nowInSeconds =  Math.floor(Date.now() / 1000);

if (!durationStr || typeof durationStr !== 'string') return null;

const match = durationStr.match(/^(\d+)([smhdy])$/);

if(!match){
    throw new Error(`Invalid Format, use for example: 10h, 10s, 10m, 10d`)
}

const value =  parseInt(match[1], 10);
const unit = match[2];

let multiplier = 1;
switch(unit){
    case 'm' : multiplier = 60; break;
    case 'h' : multiplier = 60 * 60; break;
    case 'd' : multiplier = 24 * 60 * 60; break;
    case 'y' : multiplier = 365 * 24 * 60 * 60; break;
    default: multiplier = 1;
}

const secondsToadd = value * multiplier;

return nowInSeconds + secondsToadd;

}