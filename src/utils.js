/*
concatenate all the non-null/non-undefined arguments into a single string
used to generate keys for cmps inside loops to force rerenders when the ui props change

params: 0 or more non-object non-null non-undefined Numbers/Strings
return: concatenation of all in valid inputs OR empty string
*/
export const generateKey = (...args) =>{ 
    const filtered = (args?.filter(arg=>!!arg && arg !== undefined)).map(arg=>arg.toString())    //filter out empty strings/nulls/undefined and cast ints to strings
    return filtered.length > 0 ? filtered[0].concat(...filtered.slice(1, filtered.length) ) : "" //concat 1->n filtered strings, or "" if all params were invalid
}

