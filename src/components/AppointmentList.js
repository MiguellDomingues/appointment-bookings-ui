import {useState, useEffect } from 'react'

import { useAuth, useConfig } from '../AuthProvider'
import useAPI from '../useAPI'

import '../styles.css';

function AppointmentList({appointments = [], selectedLocationId = null, refetchLocations}){

    const { isUser } = useAuth();  
  
    const [showNew, setShowNew] = useState(false);
  
    const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  
    useEffect(()=>{
      setShowNew(false)
      setSelectedAppointmentId(null)
    }, [selectedLocationId]) // when user selects a new location, close new appointment panel and clear the selected appointment
  
  
    const { loading, postAppointment, deleteAppointment, editAppointmentStatus } = useAPI()
  
  
    function _createUserAppointment(formFields){
  
      const new_appointment = {
        loc_id: selectedLocationId ,
        ...formFields
      }
  
      postAppointment({new_appointment},(result)=>{
        setShowNew(false);
        refetchLocations();})
    }
  
    function _updateAppointmentStatus(apt_id, new_status){
      editAppointmentStatus({apt_id, new_status},(result)=>{
        setSelectedAppointmentId(null);
        refetchLocations();
    })
  
    }
  
    function _deleteUserAppointment(appointment_id){
        deleteAppointment({appointment_id},(result)=>{refetchLocations()})
    }
  
    return(
      <div className="appointment_list_wrapper">
        {isUser() && selectedLocationId ? 
          <button disabled={showNew} onClick={e=>setShowNew(true)} className="add_apt_btn">Create Appointment</button> : 
        <></> }
  
        <div className="appointment_list">
  
          {appointments.map((appointment, idx)=>  
              <AppointmentCard key={idx} {...appointment} 
              deleteUserAppointment={_deleteUserAppointment} 
              updateAppointmentStatus={_updateAppointmentStatus}
              selectedLocationId={selectedLocationId}
              selectedAppointmentId={selectedAppointmentId}
              selectAppointment={ (id)=> setSelectedAppointmentId(id) }/>)}
            
          { isUser() && showNew ? 
          <AppointmentForm 
            cancelCreateAppointment={()=>{setShowNew(false)}} 
            createUserAppointment={_createUserAppointment}/>
          : <></>}     
        </div>
      </div>);
  }
  
  function AppointmentCard({id, date,end,start, status, 
    selectedLocationId, 
    selectedAppointmentId,
    deleteUserAppointment = () =>{}, 
    updateAppointmentStatus = () =>{},
    selectAppointment = () => {}
  }){
  
    const { isUser, isStoreOwner } = useAuth(); 
    const { config } = useConfig();
  
    const STATUS = config.STATUS
  
    const [newStatus, setNewStatus] = useState(status)
  
    const isSelected = id===selectedAppointmentId 
  
    useEffect(()=>setNewStatus(status), 
      [selectedLocationId, selectedAppointmentId]) // when user selects a new appointment or location, reset the form
    
    return(
      <div className={id===selectedAppointmentId ? "appointment_card appointment_card_selected" : "appointment_card"  }  onClick={e=> selectAppointment(id)}>
        <div className="form_row">
          <div>  date:  </div>
          <div>  {date}  </div>
        </div>
        <div className="form_row"> end: {end} </div>
        <div className="form_row">start: {start} </div>
  
        <div>
          status: 
          {(()=>{
            if(isStoreOwner()){ // if its a storeowner user...
              if(isSelected){                // ..and the appointment card is selected, show the status pickist
                return <>                   
                <select name="status" value={newStatus} onChange={e=>setNewStatus(e.target.value)}>
                  {STATUS.map((status,idx)=>
                    <option key={idx} value={status}>{status}</option>) }                   
                </select>
                </>
              }else{                        //otherwise show the status text
                return <>{status}</>
              }       
            }else if(isUser()){
              return <>{status}</>
            }else{
              return <></>
            } 
          })()}
        
        </div>
  
        {(()=>{
            const btn_css = isSelected  ? 'visible' : 'hidden'
            if(isStoreOwner()){ //when the user is a storeowner, show the 
              return <><button style={{visibility: btn_css}} disabled={status === newStatus} onClick={e=>updateAppointmentStatus(id, newStatus)}>Update Status</button></>
            }else if(isUser()){
              return <><button style={{visibility: btn_css}} onClick={e=>deleteUserAppointment(id)}>Cancel</button></>
            }else{
              return <></>
            } 
        })()}
  
      </div>);
  }
  
  const form = {
    date: "",
    start_time: "",
    end_time: "",
  }
  
  function AppointmentForm({cancelCreateAppointment, createUserAppointment}){
  
    //const { token } = useAuth();
   // const { config } = useConfig();  
  
    const [ formFields, setFormFeilds ] = useState(form)
    const [loading, setLoading] = useState(false);
  
  
    const areFieldsValid = () => formFields.date.trim() && formFields.start_time.trim() && formFields.end_time.trim()
  
    function handleChange(e){
      setFormFeilds({
        ...formFields,
        [e.target.name]: e.target.value
      })
    }
  
    function handleSubmit(e){
      e.preventDefault();
      console.log(formFields);
      createUserAppointment({...formFields});
    }
  
    return(
      <div className="appointment_card">
        <form onSubmit={handleSubmit}>
          <button onClick={cancelCreateAppointment} className="cancel_new_appointment_btn">X</button>
          <div className="form_row">date: <input name="date" value={formFields.date.trim()} className="appointment_form_input" onChange={handleChange} required /> </div>
          <div className="form_row">start:  <input name="start_time" value={formFields.start_time.trim()} className="appointment_form_input" onChange={handleChange} required />  </div>
          <div className="form_row">end: <input name="end_time" value={formFields.end_time.trim()} className="appointment_form_input" onChange={handleChange} required />  </div>
          <input type="submit" value="Confirm" disabled={!areFieldsValid()}/>
        </form>
      </div>);
  }

  export default AppointmentList
  
  