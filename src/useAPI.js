import { useAuth } from './AuthProvider'
import { useState } from 'react'

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

function useAPI(
    callOutFunction = async () => {}, //the fetch() callout
    successCB = ()=>{}, 
    errorCB = ()=>{}, 
    finallyCB = ()=>{},
){

    if(callOutFunction.name === "callOutFunction"){
        throw new Error("Error in useAPI; pass a function reference from API.js")
    }

    const { token } = useAuth();

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    function APIWrapper(CB, params = []){
        setLoading(true)        //always set loading when callout begins

        if(token?.key){ //if the user is authenticated, append the key to the end of the params list
            params[params.length] = token.key
        }

        setTimeout(async ()=>{   
            CB(...params).then((result)=>{ // (...params) means to spread the params array as arguments into the callback 
                setError(null)     //successfull callouts will clear the previous err
                successCB(result)
            }).catch((err)=>{
                console.log("ERROR: ", err)
                setError(err)     
                errorCB(err)
            }).finally(()=>{
                setLoading(false)  //always unset loading when callout ends
                finallyCB()
            })

        }, getRandom(1000, 3000))  
    }

    //(...params) means to collect the 0 or more arguments into an array 'params'
    const invoke = (...params) => APIWrapper(callOutFunction , params) //pass params arr to APIWrapper

    return{
        [callOutFunction.name]: invoke, //re-alias invoke to the name of the original function that is being referenced from API.js
        loading, 
        error,     
    }

}

export default useAPI