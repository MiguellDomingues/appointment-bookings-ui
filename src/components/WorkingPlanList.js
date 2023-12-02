
import { ActionButton }   from './widgets'
import { useToggleUI } from '../hooks/useToggleUI'
import LoadingWrapper from './LoadingWrapper';

import { generateKey } from '../utils'

import '../styles.css';

//move this to a utils file; used inside Availability
const hourMinutestoTotalMinutes = timeString => parseInt(timeString.split(":")[0])*60 + parseInt(timeString.split(":")[1])

function WorkingPlanList({workingPlan,updateWorkingPlanDay, loading}){
    return(<>
            <LoadingWrapper loading={loading}>
                <table className="table_border table_width">
                <caption className="table_title">Working Plan</caption>
                    <tbody>
                        <tr>    
                            <th>Day</th>
                            <th>Start</th>
                            <th>End</th>
                            <th>Action</th>
                        </tr>
                        
                        {workingPlan.map( ({id, day, start, end})=>
                            <WorkingPlanDay 
                                key={generateKey(id, start, end)} //when the start/end are changed for an id, we need to force this cmp to rerender
                                _id={id} {...{day, start, end, updateWorkingPlanDay}}/>
                        )}
                    </tbody>
                </table>  
            </LoadingWrapper>
    </>);
}

function WorkingPlanDay({
    _id, 
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
        updateWorkingPlanDay(_id, state.formInputs.start, state.formInputs.end)
      }

      function handleEdit(){
        showEdit()
      }

      function handleCancel(){
        updateForm({ start, end } ) 
        showRead()
      }

      function handleDelete(){
        updateWorkingPlanDay(_id, "", "")
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






