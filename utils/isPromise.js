

export const isPromise = (value) =>{
    return (!!value && 
        (typeof value === 'object' || typeof value === 'function')
         && typeof value.then === 'function')
}