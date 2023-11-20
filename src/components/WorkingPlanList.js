
import { ActionButton }   from './widgets'
import { useToggleUI } from '../hooks/useToggleUI'

//move this to a utils file; used inside Availability
const hourMinutestoTotalMinutes = timeString => parseInt(timeString.split(":")[0])*60 + parseInt(timeString.split(":")[1])


function WorkingPlanList({workingPlan,updateWorkingPlanDay}){

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
    updateWorkingPlanDay,
}){

    const readOnlyUI = ({start, end}) => ({
        startCol:   <>{start || " -- : -- "}</>,
        endCol:     <>{end || " -- : -- "}</>,
        actionCol:  <>
            <ActionButton handler={handleEdit} text="Edit"/>
            <ActionButton handler={handleDelete} text="Delete"/>
        </>,
     })
    

    const editUI = ({start, end}) => {

        //start times must be strictly less then end times
        const areTimesInvalid= () => hourMinutestoTotalMinutes(start) >= hourMinutestoTotalMinutes(end)

        return{
            startCol:   <><input type="time" name="start" value={start}  onChange={handleChange}/></>,
            endCol:     <><input type="time" name="end" value={end}  onChange={handleChange}/></>,
            actionCol:  <>
                <ActionButton handler={handleSave} disabled={areTimesInvalid()} text="Save"/>
                <ActionButton handler={handleCancel} text="X"/>
            </>,
        }
    }

   
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

export default WorkingPlanList;


