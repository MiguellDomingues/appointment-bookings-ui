import {useState, useEffect } from 'react'

import { useAuth, useConfig } from '../AuthProvider'
import useAPI from '../useAPI'

import '../styles.css';

const appointmentForm = {
    date: "",
    start_time: "",
    end_time: "",
  }

  const AppointmentPanelState = Object.freeze({
    Data: "Data",
    EditStatus: "EditStatus",
    New: "New",
    AddButton: "AddButton",
});

function AppointmentList({appointments = [], selectedLocationId = null, refetchLocations}){

    const { isUser } = useAuth();  
  
    const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  
    useEffect(()=>{
      setSelectedAppointmentId(null)
    }, [selectedLocationId]) // when user selects a new location, close new appointment panel and clear the selected appointment
  
  
    const { loading, postAppointment, deleteAppointment, editAppointmentStatus } = useAPI()
  
  
    function _createUserAppointment(formFields){
  
      const new_appointment = {
        loc_id: selectedLocationId ,
        ...formFields
      }
  
      postAppointment({new_appointment},(result)=>{
        refetchLocations();})
    }
  
    function _updateAppointmentStatus(new_appointment){

        const apt_id = new_appointment.id;
        const new_status = new_appointment.status;

      editAppointmentStatus({apt_id, new_status},(result)=>{
        setSelectedAppointmentId(null);
        refetchLocations();
    })
  
    }
  
    function _deleteUserAppointment(appointment_id){
        deleteAppointment({appointment_id},(result)=>{refetchLocations()})
    }
  
    return(<>
        <div className="appointment_list_wrapper">

            <div className="appointment_list">
            {appointments.map((appointment, idx)=>  
                <AppointmentPanel 
                    key={idx} 
                    {...appointment} 
                    startingMode = {AppointmentPanelState.Data}
                    isAppointmentSelected = {appointment.id === selectedAppointmentId}
                    deleteUserAppointment={_deleteUserAppointment} 
                    updateAppointmentStatus={_updateAppointmentStatus}
                    selectedLocationId={selectedLocationId}
                    selectedAppointmentId={selectedAppointmentId}
                    selectAppointment={ (id)=> setSelectedAppointmentId(id) }/>)}
                
            {isUser() ? // users can see a button for appointment creations
                <>
                    <AppointmentPanel
                        startingMode = {AppointmentPanelState.AddButton}
                        _createUserAppointment={_createUserAppointment}
                        selectedAppointmentId={selectedAppointmentId}/>
                </>  : <></>}
            </div>
        </div>
    </>);
  }

  function AppointmentPanel({
    id, date,end,start, status, 
    selectedLocationId, 
    selectedAppointmentId,
    _createUserAppointment,
    deleteUserAppointment = () =>{}, 
    updateAppointmentStatus = () =>{},
    selectAppointment = () => {},
    startingMode = AppointmentPanelState.Data,
    isAppointmentSelected = false
  }){
    const { isUser, isStoreOwner } = useAuth();  
    const [ mode, setMode ] = useState( startingMode )

    useEffect(()=>setMode(startingMode), [selectedAppointmentId, selectedLocationId])

    function getUI(selectedMode){
        
        switch(selectedMode){
            case AppointmentPanelState.AddButton:
                return <button onClick={e=>setMode(AppointmentPanelState.New)} className="">Create Appointment</button>
            case AppointmentPanelState.New:
                return <>
                    <AppointmentForm
                    cancelForm={()=>setMode(AppointmentPanelState.AddButton)}
                    submitForm ={_createUserAppointment}
                    form={ {...appointmentForm}  }/>
                </>
            case AppointmentPanelState.EditStatus:
               return <>
                   <AppointmentForm
                        cancelForm={()=>setMode(AppointmentPanelState.Data)}
                        submitForm ={updateAppointmentStatus}
                        form={ {id, date, end_time: end, start_time: start, status} }
                   />
                </>
            case AppointmentPanelState.Data:
                return<>
                     <div className="form_row">
                        <div>  date:  </div>
                        <div>  {date}  </div>
                    </div>
                    <div className="form_row"> end: {end} </div>
                    <div className="form_row">start: {start} </div>
                    <div className="form_row"> status: {status}</div>
                    {isUser() ? <>
                        <button className={isAppointmentSelected ? "show_btn" : "hide_btn"} onClick={e=>deleteUserAppointment(id)}>Cancel</button>
                    </>: <></>}
                    {isStoreOwner() ? <>
                        <button className={isAppointmentSelected ? "show_btn" : "hide_btn"} onClick={e=>setMode(AppointmentPanelState.EditStatus)}>Update Status</button>
                    </>: <></>}
                </>;
            default: return <></>
        }
    }

    return(<>
        <div className={isAppointmentSelected ? "appointment_card appointment_card_selected" : "appointment_card"  }  
            onClick={e=> selectAppointment(id)}>
                {getUI(mode)}
        </div>
    </>);
  }

  function AppointmentForm({
    cancelForm = ()=>{} , 
    submitForm = ()=>{},
    form = appointmentForm,
 // LocationFormState = ""
}){

    console.log("form: ", form)
  
    const { isStoreOwner, isUser } = useAuth();
    const { config } = useConfig();  
  
    const [ formFields, setFormFeilds ] = useState(form)

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
      submitForm({...formFields});
      cancelForm()
    }
  
    return(<>
        <form onSubmit={handleSubmit}>
          <button onClick={e=>cancelForm()} className="cancel_new_appointment_btn">X</button>
          <div className="form_row">
            date: 
            {isUser() ? <input name="date" value={formFields.date.trim()} className="appointment_form_input" onChange={handleChange} required /> : <>{formFields.date}</>}
          </div>
          <div className="form_row">
            start:  
            {isUser() ? <input name="start_time" value={formFields.start_time.trim()} className="appointment_form_input" onChange={handleChange} required /> : <>{formFields.start_time}</>}
          </div>
          <div className="form_row">
            end: 
            {isUser() ? <input name="end_time" value={formFields.end_time.trim()} className="appointment_form_input" onChange={handleChange} required /> : <>{formFields.end_time}</>} 
          </div>

         {isStoreOwner() ?  
            <div className="form_row">
                status:
                <select name="status" value={formFields.status} onChange={handleChange}>
                  {config.STATUS.map((status,idx)=>
                    <option key={idx} value={status}>{status}</option>) }                   
                </select>
            </div> : <></>}


          <input type="submit" value="Confirm" disabled={!areFieldsValid()}/>
        </form>
    </>);
}

export default AppointmentList

/*
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
  

  function AppointmentForm2({cancelCreateAppointment, createUserAppointment}){
  
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
*/
  
  