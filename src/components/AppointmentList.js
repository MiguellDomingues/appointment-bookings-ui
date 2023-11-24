import {useState, useEffect } from 'react'

import { useAuth } from '../AuthProvider'

import { STATUS } from '../constants'

import { ActionButton }   from './widgets'

import { IconList, getIconByKey }   from './IconList'
import {useAppContext}        from '../AppContextProvider'
import LoadingOverlay         from './LoadingOverlay'


import useIcons               from '../hooks/useIcons'
import {useToggleUI,ToggleUIState }             from '../hooks/useToggleUI'

import useAPI                 from '../useAPI'


import '../styles.css';

const appointmentForm = {
    date: "",
    start_time: "",
    end_time: "",
  }

function AppointmentList({
  appointments = [],
  icons = [], 
  loading = false
}){

    const { isUser,loadingConfigs,loadingUser, isStoreOwner } = useAuth();   
    const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
 
    const context = useAppContext()

    context.selectedAppointmentId = selectedAppointmentId;
    context.setSelectedAppointmentId = (id)=> setSelectedAppointmentId(id)

   // console.log("al apts ", appointments)
   // console.log("test apts ", context.testapts)

    //const [apts, setApts] = useState([...appointments]);


    return(<>
        <div className="body_appointments">

        <LoadingOverlay 
            isLoading={loading && !loadingConfigs && !loadingUser} 
            isFullscreen={false}
            loadingText={"Loading Data"}/>  

        {isStoreOwner() ? <>

          <table className="table_border table_width">
          <caption className="table_title">Appointments on {appointments[0]?.date}</caption>
          <tbody>
            <tr>    
              <th>Customer Name</th>
              <th>Type</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Status</th>
              <th>Action</th>
            </tr> 

            {appointments.map(({id, appointee,appointment_types,date,start,end,status})=>
               <StoreOwnerAppointment key={id} {...{appointee,appointment_types,date,start,end,status, id}}/>
            )}

          </tbody>
      </table> 
        
        </>: <>
        
        <table className="table_border table_width">
          <caption className="table_title">Appointments at some place</caption>
          <tbody>
            <tr>    
              <th>Type</th>
              <th>Date</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Status</th>
              <th>Action</th>
            </tr> 

            {appointments.map(({id, appointment_types,date,start,end,status})=>
               <UserAppointment key={id} {...{appointment_types,date,start,end,status,id, icons}}/>
            )}

            <UserAppointment icons={icons} startingState={ToggleUIState.Edit}/>

          </tbody>
      </table> 

        
        
        </>}
       
        </div>

    </>);
}

function StoreOwnerAppointment({
  appointee,
  appointment_types,
  //date,
  start,
  end,
  status, 
  id,
}){

  const { loading, editAppointmentStatus } = useAPI()

  const { refetchLocations } = useAppContext()

  function handleEditAppointmentStatus(id, status){
    editAppointmentStatus({id, status},
      (result)=>{
        updateForm({ status }) 
        showRead()
        refetchLocations();
      },
      (err)=>{console.log(err); },
    )
}

  const readOnlyUI = ({appointee, appointment_types, start, end, status}) => ({
    apointeeCol:   <>{appointee}</>,
    appointmentTypesCol: <>{appointment_types.map((apt_type)=>getIconByKey(apt_type))}</>,
    startCol:   <>{start}</>,
    endCol:     <>{end}</>,
    statusCol:  <>{status}</>,
    actionCol:  <>
        <ActionButton handler={handleEdit} text="Edit"/>
    </>,
 })


const editUI = ({appointee, appointment_types, start, end, status}) => {

    return{
      apointeeCol:   <>{appointee}</>,
      appointmentTypesCol: <>{appointment_types.map((apt_type)=>getIconByKey(apt_type))}</>,
      startCol:   <>{start}</>,
      endCol:     <>{end}</>,
      statusCol:  <>
        <select name="status" value={status} onChange={handleChange}>
          {STATUS.map((status,idx)=> <option key={idx} value={status}>{status}</option>) }                   
        </select>
      </>,
      actionCol:  <>
          <ActionButton handler={()=>handleEditAppointmentStatus(id, status)} text="Save"/>
          <ActionButton handler={handleCancel} text="X"/>
      </>,
    }
}

function handleChange(e){
  updateForm({ [e.target.name]: e.target.value } ) 
 }

 function handleEdit(){
   showEdit()
 }

 function handleCancel(){
   updateForm({ status } ) 
   showRead()
 }

const { 
  state: {ui, formInputs} , 
  updateForm,
  showRead,
  showEdit
} = useToggleUI({appointee,appointment_types,start,end,status},readOnlyUI, editUI)
      
const {apointeeCol, appointmentTypesCol, startCol, endCol, statusCol, actionCol} = ui

//div>{appointmentTypesCol}</div>

  return(<>
    <tr className="table_row">
      <LoadingOverlay isLoading={loading} isFullscreen={false} loadingText={"Saving"}/>
      <td>{apointeeCol}</td>
      <td>{appointmentTypesCol}</td>
      <td>{startCol}</td>
      <td>{endCol}</td>
      <td>{statusCol}</td>
      <td>{actionCol}</td>
    </tr>  
  </>);
}

function UserAppointment({
  appointment_types = [],
  date = "",
  start = "",
  end ="",
  status = "",
  icons = [],  
  id = "",
  startingState = ToggleUIState.Read,
}){

  //console.log("rerender ua: ", start, status)

  const {selectedIcons, toggleIconSingle, clearIcons } = useIcons();

  useEffect( ()=>updateForm({selectedIcons} ) , [selectedIcons]);

  useEffect( ()=>updateForm({status})  , [status]);

  const { loading, postAppointment,deleteAppointment } = useAPI()

  const { refetchLocations,selectedLocationId, } = useAppContext()

  const  handleDeleteAppointment =() =>{
    deleteAppointment({id},(result)=>{refetchLocations()})
  }

  function handlePostAppointment(formFields){

    const new_appointment = {
      loc_id: selectedLocationId,
      start_time: formFields.start,
      end_time: formFields.end,
      apt_types: formFields.selectedIcons,
      date: formFields.date
    }

    postAppointment({new_appointment},
      (result)=>{
        console.log(result)
        clearIcons()
        updateForm({ date, start, end, }) 
        showEdit()
        refetchLocations();
      },
      (err)=>{},
    )

  }

  const readOnlyUI = ({ date, start, end, status}) => ({
    appointmentTypesCol: <>
      <IconList iconSize={16} icons={appointment_types} />
     </>,
    dateCol:   <>{date}</>,
    startCol:   <>{start}</>,
    endCol:     <>{end}</>,
    statusCol:  <>{status}</>,
    actionCol:  <>
        <ActionButton handler={()=>handleDeleteAppointment()} text="Cancel"/>
    </>,
 })


const editUI = ({appointment_types, start, end, date, status,selectedIcons}) => {
    return{
      appointmentTypesCol: <> 
        <IconList iconSize={16} icons={icons} selectedIcons={selectedIcons} toggleIcon={toggleIconSingle}/> 
      </>,
      dateCol:   <><input type="date" name="date" value={date}  onChange={handleChange}/></>,
      startCol:   <><input type="time" name="start" value={start}  onChange={handleChange}/></>,
      endCol:      <><input type="time" name="end" value={end}  onChange={handleChange}/></>,
      statusCol:  <>{status}</>,
      actionCol:  <>
        <ActionButton handler={()=>handlePostAppointment({start,end,date,selectedIcons})} text="Save"/>
      </>,
    }
}

function handleChange(e){
  updateForm({ [e.target.name]: e.target.value } ) 
 }

 function handleEdit(){
   showEdit()
 }

 function handleCancel(){
   updateForm({ appointment_types,start,end,status, date } ) 
   showRead()
 }

const { 
  state: {ui, formInputs} , 
  updateForm,
  showRead,
  showEdit
} = useToggleUI({appointment_types,start,end,status, date,},readOnlyUI, editUI,startingState)
      
const {dateCol, appointmentTypesCol, startCol, endCol, statusCol, actionCol} = ui

//div>{appointmentTypesCol}</div>

  return(<>
    <tr className="table_row">
      <LoadingOverlay isLoading={loading} isFullscreen={false} loadingText={"Saving"}/>
      <td>{appointmentTypesCol}</td>
      <td>{dateCol}</td>
      <td>{startCol}</td>
      <td>{endCol}</td>
      <td>{statusCol}</td>
      <td>{actionCol}</td>
    </tr>  
  </>);
}

export default AppointmentList;