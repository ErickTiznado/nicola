

class Schema{



    static validate(data, rules){
        for(const field in rules){
            const rule = rules[field]
            const value = data[field]

            if(rule.required === true && (value === undefined || value === null || value === '')){
                  throw new Error(`Field ${field} is required`)
            }
            if(typeof value !== rule.type && value !== undefined && value !== null){
                throw new Error(`Field ${field} must be a ${rule.type}`)
            }
        };

        return true;
    }
}

export default Schema;