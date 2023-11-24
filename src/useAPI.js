import { useAuth } from './AuthProvider'
import { useState } from 'react'

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

function useAPI(
    callOutFunction = async () => {}
){

    if(callOutFunction.name === "callOutFunction"){
        throw new Error("Error in useAPI; pass a function reference from API.js")
    }
   
    const { token } = useAuth();

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)

    function APIWrapper(CB, params, successCB = ()=>{}, errorCB = ()=>{}, finallyCB = ()=>{}){

        setLoading(true)        //always set loading when callout begins
        params = Object.keys(params).map(e=>params[e])
        console.log("KEY: ", token?.type, token?.key)
        setTimeout(async ()=>{   
            CB(token?.key, ...params).then((result)=>{
                setError(false)     //successfull callouts will clear the previous err
                successCB(result)
            }).catch((err)=>{
                console.log("ERROR: ", err)
                setError(true)     
                errorCB(err)
            }).finally(()=>{
                setLoading(false)  //always unset loading when callout ends
                finallyCB()
            })

        }, getRandom(1000, 3000))  
    }

    const invoke = (params={}, ...args) => 
        APIWrapper(callOutFunction , params, ...args)

    return{
        [callOutFunction.name]: invoke, 
        loading, 
        error,     
    }

}

export default useAPI