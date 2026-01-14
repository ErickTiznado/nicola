import LiveCurrent from "../dev-tools/LiveCurrent.js"
export const runStart = () =>{
    const live =  new LiveCurrent("app.js");

    live.boot()
}


