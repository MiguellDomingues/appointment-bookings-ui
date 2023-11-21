
import { ActionButton,SelectableItemsList }   from './widgets'
import { useToggleUI,ToggleUIState } from '../hooks/useToggleUI'

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

//move this to a utils file
const hourMinutestoTotalMinutes = timeString => parseInt(timeString.split(":")[0])*60 + parseInt(timeString.split(":")[1])

const abbreviatedDays = Object.freeze({
    Mon: "Monday",
    Tue: "Tuesday",
    Wed: "Wednesday",
    Thu: "Thursday", 
    Fri: "Friday",
    Sat: "Saturday",
    Sun: "Sunday"
  });


function BreakList({breaks,deleteWorkingBreak,addWorkingBreak}){

    return(<>
         <table className="table_border table_width">
            <caption className="table_title">Breaks</caption>
            <tbody>
                <tr>    
                    <th>Days</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Action</th>
                </tr>          
                {breaks.map(({days, start, end, id}, idx)=>
                    <Break key={id} {...{days, start, end, id,  deleteWorkingBreak, addWorkingBreak}}/>)}
                <Break startingState={ToggleUIState.Edit} {...{addWorkingBreak}}/>
            </tbody>
        </table>   
    </>);
}

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

        const areTimesInvalid= () => hourMinutestoTotalMinutes(start) >= hourMinutestoTotalMinutes(end)

        return {
            daysCol:   <>
                <SelectableItemsList 
                    selectedClassName={"selected_item"}
                    items={Object.keys(abbreviatedDays)} 
                    selectedItems={days} 
                    handleItemClick={toggleDay}/>
            </>,
            startCol:   <><input type="time" name="start" value={start} onChange={handleChange}/></>,
            endCol:     <><input type="time" name="end" value={end} onChange={handleChange}/></>,
            actionCol:  <>
                <ActionButton disabled={areTimesInvalid()} handler={handleSave} text="Save"/>
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

export default BreakList;