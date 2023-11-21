import { ActionButton }   from './widgets'
import { useToggleUI } from '../hooks/useToggleUI'
import { getIconByKey }   from './IconList'

function ServiceDurationList({serviceDurations,updateServiceDuration}){

    return(<>
         <table className="table_border table_width">
            <caption className="table_title">Service Durations</caption>
            <tbody>
                <tr>    
                    <th>Type</th>
                    <th>Duration (minutes)</th>
                    <th>Action</th>
                </tr>
                
                {serviceDurations.map(({type, duration}, idx)=>
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

export default ServiceDurationList;