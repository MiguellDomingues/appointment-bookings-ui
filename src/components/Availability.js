import {getIconByKey}   from './IconList'
import { useState, useReducer, useEffect  } from 'react'

import { nanoid } from 'nanoid'

const ActionButton = ({handler, text}) => <><button onClick={handler}>{text}</button></>

function SelectableItemsList({items, selectedItems, handleItemClick}){
    //console.log("sil",selectedItems)
    return(
        <>{items.map(item=>
            <span key={item}
                className={selectedItems.includes(item) ? "selected_item" : ""} 
                onClick={()=>handleItemClick(item)}>
                {item}{" "}
            </span>)}
        </>)
}


const operatingHours = [
    {
        day: "Monday",
        start: "08:00",
        end:   "16:00",
    },
    {
        day: "Tuesday",
        start: "08:00",
        end:   "16:00",
    },
    {
        day: "Wednesday",
        start: "08:00",
        end:   "16:00",
    },
    {
        day: "Thursday",
        start: "08:00",
        end:   "16:00",
    },
    {
        day: "Friday",
        start: "09:15",
        end:   "14:30"
    },
    {
        day: "Saturday",
        start: "",
        end:   ""
    },
    {
        day: "Sunday",
        start: "",
        end:   ""
    },
]

let breaks = [
    {
        days: ["Mon", "Tue", "Wed", "Thu","Fri", "Sat", "Sun"],
        start: "10:15",
        end: "10:30"
    },
    {
        days: ["Mon", "Tue", "Wed", "Thu",],
        start: "12:00",
        end: "13:00"
    },
    {
        days: ["Fri"],
        start: "11:00",
        end: "11:30"
    },
]

const serviceDurations = [
    {
       type: "MdOutlineCarRepair",
       duration: "45"
    },
    {
        type: "FaWrench",
        duration: "25"
     },
     {
        type: "FaOilCan",
        duration: "30"
     }, 
]

function Availability({
    locationIcons = []
}){

    breaks = breaks.map((b)=>( {...b, id: nanoid() } )) //temp

    return(<>
        <WorkingPlanList {...{operatingHours}}/>
        <BreaksList {...{breaks}}/>
        <ServiceDurationList {...{serviceDurations }}/>
    </>);

}
//<div className="table_container table_border ">
function WorkingPlanList({operatingHours}){

    const [workingPlan, setWorkingPlan] = useState([...operatingHours])

    function updateWorkingPlanDay(day, start, end){
        setWorkingPlan((workingPlan)=>[ ...workingPlan.map((wp)=>wp.day===day ? {day, start, end} : wp)  ])
    }

    return(<> 
        <table className="table_border">
        <caption className="table_title">Working Plan</caption>
            <tbody>
                <tr>    
                    <th>Day</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Action</th>
                </tr>
                
                {workingPlan.map(({day, start, end})=>
                    <WorkingPlanDay key={day} {...{day, start, end, updateWorkingPlanDay}}/>
                )}
            </tbody>
        </table> 
    </>);
}

function WorkingPlanDay({
    day, 
    start, 
    end,
    updateWorkingPlanDay
}){

    const readOnlyUI = ({start, end}) => ({
        startCol:   <>{start || " -- : -- "}</>,
        endCol:     <>{end || " -- : -- "}</>,
        actionCol:  <>
            <ActionButton handler={handleEdit} text="Edit"/>
            <ActionButton handler={handleDelete} text="Delete"/>
        </>,
     })
    

    const editUI = ({start, end}) => ({
        startCol:   <><input type="time" name="start" value={start} onChange={handleChange}/></>,
        endCol:     <><input type="time" name="end" value={end} onChange={handleChange}/></>,
        actionCol:  <>
            <ActionButton handler={handleSave} text="Save"/>
            <ActionButton handler={handleCancel} text="X"/>
        </>,
    })

   
      function handleChange(e){
       updateForm({ [e.target.name]: e.target.value } ) 
      }

      function handleSave(){
        updateWorkingPlanDay(day, state.formInputs.start, state.formInputs.end)
        showRead()
      }

      function handleEdit(){
        showEdit()
      }

      function handleCancel(){
        updateForm({ start, end } ) 
        showRead()
      }

      function handleDelete(){
        updateWorkingPlanDay(day, "", "")
        updateForm({ start: "", end: ""} )     
        showRead()
      }

      const { state, updateForm,showRead,showEdit} = useToggleUI({ start, end},readOnlyUI, editUI)
      
      const {startCol, endCol, actionCol} = state.ui

    return(<>
         <tr className="table_row">
            <td>{day}</td>
            <td>{startCol}</td>
            <td>{endCol}</td>
            <td>{actionCol}</td>
        </tr>  
    </>);
}


function BreaksList({breaks}){

    const [workingBreaks, setWorkingBreaks] = useState([...breaks])

    function deleteWorkingBreak(id){
        setWorkingBreaks((workingBreaks)=>[...(workingBreaks.filter(wb=>wb.id!==id) )])
     }

     function addWorkingBreak(days, start, end){
        setWorkingBreaks((workingBreaks)=>[ ...workingBreaks, {days, start, end, id: nanoid()}])
     }

    return(<>
         <table className="table_border">
            <caption className="table_title">Breaks</caption>
            <tbody>
                <tr>    
                    <th>Days</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Action</th>
                </tr>          
                {workingBreaks.map(({days, start, end, id}, idx)=>
                    <Break key={id} {...{days, start, end, id,  deleteWorkingBreak, addWorkingBreak}}/>)}
                <Break startingState={ToggleUIState.Edit} {...{addWorkingBreak}}/>
            </tbody>
        </table>   
    </>);
}



/*
const _abbreviatedDays = Object.freeze({
    Monday: "Mon",
    Tuesday: "Tue",
    Wednesday: "Wed",
    Thursday: "Thu",
    Friday: "Fri",
    Saturday: "Sat",
    Sunday: "Sun",
  });
*/
  const abbreviatedDays = Object.freeze({
    Mon: "Monday",
    Tue: "Tuesday",
    Wed: "Wednesday",
    Thu: "Thursday", 
    Fri: "Friday",
    Sat: "Saturday",
    Sun: "Sunday"
  });


function Break({
    days = [], 
    start = "", 
    end = "",
    id = "",
    startingState = ToggleUIState.Read,
    deleteWorkingBreak = ()=>{},
    addWorkingBreak = ()=>{} 
}){

    const readOnlyUI = ({days, start, end}) => {
        return{
            daysCol:   <>{days.join(' ')}</>,
            startCol:     <>{start}</>,
            endCol:     <>{end}</>,
            actionCol:  <>
                <ActionButton handler={handleDelete} text="Delete"/>
            </>,
        }
        
     }
 
    const editUI = ({days, start, end}) => {
        return {
            daysCol:   <>
                <SelectableItemsList items={Object.keys(abbreviatedDays)} selectedItems={days} handleItemClick={toggleDay}/>
            </>,
            startCol:   <><input type="time" name="start" value={start} onChange={handleChange}/></>,
            endCol:     <><input type="time" name="end" value={end} onChange={handleChange}/></>,
            actionCol:  <>
                <ActionButton handler={handleSave} text="Save"/>
            </>,
        }
    }




    function toggleDay(day){
  
      const {days} = state.formInputs
      updateForm({  days: days.includes(day) ? [...days.filter(d=>d!==day)] : [...days, day]  } ) 
    }


    function handleChange(e){
        updateForm({ [e.target.name]: e.target.value } ) 
      }

      function handleSave(){
        addWorkingBreak(state.formInputs.days, state.formInputs.start, state.formInputs.end)
        updateForm({ days, start, end})
      }

      function handleDelete(){
        deleteWorkingBreak(id)
      }

    const { state, updateForm} = useToggleUI({ days, start, end},readOnlyUI, editUI,startingState)

    const {daysCol, startCol, endCol, actionCol} = state.ui

    
    return(<>
        <tr className="table_row">
            <td>{daysCol}</td>
            <td>{startCol}</td>
            <td>{endCol}</td>
            <td>{actionCol}</td>
        </tr>
    </>)
}


const ToggleUIState = Object.freeze({
    Edit: "Edit",
    Read: "Read",
});

function useToggleUI(formData, read, edit, startingState = ToggleUIState.Read){

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

        //console.log(Object.keys(read(formData)))
        //console.log(Object.keys(edit(formData)))

       // const keys = Object.keys(read(formData))

     const _uiKeys = Object.keys(read(data))



        

        let ui = {}

        _uiKeys.forEach(k=>ui[k] = <></>)

        //throw new Error("blah blah blah blah sfkljsdhfdskjfhdskjfhska")

        return { formInputs: {...data}, ui}
    }


    function updateForm(updateObj){ 
        dispatch({type: ToggleUIState.Edit, payload: updateObj})
    }

    function showEdit(){
        dispatch({type: ToggleUIState.Edit})
    }

    function showRead(){
        dispatch({type: ToggleUIState.Read})
    }

    return {state, dispatch, updateForm, showEdit, showRead}

}

function ServiceDurationList({serviceDurations}){

    const [_serviceDurations, setServiceDurations] = useState([...serviceDurations])

    function updateServiceDuration(id, duration){
        _serviceDurations[id].duration = duration
        setServiceDurations((_serviceDurations)=>[ ..._serviceDurations ])
    }

    return(<>
         <table className="table_border">
            <caption className="table_title">Service Durations</caption>
            <tbody>
                <tr>    
                    <th>Type</th>
                    <th>Duration (minutes)</th>
                    <th>Action</th>
                </tr>
                
                {_serviceDurations.map(({type, duration}, idx)=>
                    <ServiceDuration 
                        key={idx} 
                        id={idx} duration
                        Icon={getIconByKey(type)} 
                        {...{updateServiceDuration,duration}}/>)}
            </tbody>
        </table>   
    </>);
}

function ServiceDuration({
    Icon,
    duration,
    id,
    updateServiceDuration
}){

    const readOnlyUI = ({duration}) => ({
        durationCol:     <>{duration || "--"}</>,
        actionCol:  <>
            <ActionButton handler={handleEdit} text="Edit"/>
            <ActionButton handler={handleDelete} text="Delete"/>
        </>,
     })
    

    const editUI = ({duration}) => ({
        durationCol:   <><input type="number" name="duration" value={duration} onChange={handleChange}/></>,
        actionCol:  <>
            <ActionButton handler={handleSave} text="Save"/>
            <ActionButton handler={handleCancel} text="X"/>
        </>,
    })

    function handleChange(e){
        updateForm({ [e.target.name]: e.target.value } ) 
       }
 
       function handleSave(){
         updateServiceDuration(id, state.formInputs.duration )
         showRead()
       }
 
       function handleEdit(){
         showEdit()
       }
 
       function handleCancel(){
         updateForm({ duration } ) 
         showRead()
       }
 
       function handleDelete(){
         updateServiceDuration(id, "")
         updateForm({ duration: ""} )     
         showRead()
       }

    const { state, updateForm,showRead,showEdit} = useToggleUI({duration},readOnlyUI, editUI)

    const {durationCol, actionCol} = state.ui

    return(<>
        <tr className="table_row">
            <td>{Icon}</td>
            <td>{durationCol}</td>
            <td>{actionCol}</td>                      
        </tr>
    </>);

}

export default Availability;