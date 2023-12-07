import { ActionButton }   from './widgets'
import { useToggleUI } from '../hooks/useToggleUI'
import { getIconByKey  } from '../hooks/useIcons'
import LoadingWrapper from './LoadingWrapper';
import { generateKey } from '../utils'

function ServiceDurationList({serviceDurations,updateServiceDuration, loading}){

    return(<>
        <LoadingWrapper loading={loading}>
            <table className="table_border table_width">
                <caption className="table_title">Service Durations</caption>
                <tbody>
                    <tr>    
                        <th>Type</th>
                        <th>Duration (minutes)</th>
                        <th>Action</th>
                    </tr>
                    
                    {serviceDurations.map(({service, duration, id})=>
                        <ServiceDuration 
                            key={generateKey(id, duration)} //when the duration changes, the cmp needs to rerender
                            _id={id} 
                            Icon={getIconByKey(service)} 
                            {...{updateServiceDuration,duration}}/>)}
                </tbody>
            </table>
        </LoadingWrapper>   
    </>);
}

function ServiceDuration({
    Icon,
    duration,
    _id,
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
         updateServiceDuration(_id, state.formInputs.duration )
         //showRead()
       }
 
       function handleEdit(){
         showEdit()
       }
 
       function handleCancel(){
         updateForm({ duration } ) 
         showRead()
       }
 
       function handleDelete(){
         updateServiceDuration(_id, "")
        // updateForm({ duration: ""} )     
         //showRead()
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