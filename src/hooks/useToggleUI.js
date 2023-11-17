import { useReducer, useEffect  } from 'react'

export const ToggleUIState = Object.freeze({
    Edit: "Edit",
    Read: "Read",
});

export function useToggleUI(formData, read, edit, startingState = ToggleUIState.Read){

    //{days, start, end}, readFN, editFN
    useEffect( ()=>dispatch( {type: startingState } ) ,[])

    const [state, dispatch] = useReducer(reducer, {}, ()=>init(read, {...formData})  )//readOnlyUI

    function reducer(state, action) {

        if(action.payload){
           // console.log("reducer payload" , action.payload)
            Object.keys(action.payload).forEach(key=>{state.formInputs[key] = action.payload[key]})
        }

        switch (action.type) {
          case ToggleUIState.Edit:
            return {
                formInputs: {...state.formInputs},
                ui: edit({...state.formInputs})
            }
          case ToggleUIState.Read:
            return {
                formInputs: {...state.formInputs},
                ui: read({...state.formInputs})
            }
          default:
           return <></>
        }
    }


    function init(read, data){

     const _uiKeys = Object.keys(read(data));

        let ui = { };

        _uiKeys.forEach(k=>ui[k] = <></>);

        //throw new Error("blah blah blah blah sfkljsdhfdskjfhdskjfhska")

        return { formInputs: {...data}, ui};
    }


    function updateForm(updateObj){ 
        dispatch({type: ToggleUIState.Edit, payload: updateObj});
    }

    function showEdit(){
        dispatch({type: ToggleUIState.Edit});
    }

    function showRead(){
        dispatch({type: ToggleUIState.Read});
    }

    return {state, dispatch, updateForm, showEdit, showRead};

}

export default useToggleUI;