import {useState, useEffect } from 'react'

import { useAuth, useConfig } from '../AuthProvider'

import {IconList, getIcons} from './IconList'

import useIcons from '../hooks/useIcons'

import useAPI from '../useAPI'

import '../styles.css';

const appointmentForm = {
    date: "",
    start_time: "",
    end_time: "",
  }

  const AppointmentPanelState = Object.freeze({
    Card: "Card",
    EditStatus: "EditStatus",
    New: "New",
    AddButton: "AddButton",
});

function AppointmentList({
  //locations = [],
  appointments = [],
  icons = [], 
  selectedLocationId = null, 
  refetchLocations = ()=>{}
}){

    const { isUser } = useAuth();   
    const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

    useEffect(()=>{
      setSelectedAppointmentId(null)
    }, [selectedLocationId]) // when user selects a new location, close new appointment panel and clear the selected appointment
  
    const { loading, postAppointment, deleteAppointment, editAppointmentStatus } = useAPI()
  
    function _postAppointment(formFields){
  
      const new_appointment = {
        loc_id: selectedLocationId ,
        ...formFields
      }
  
      postAppointment({new_appointment},(result)=>{
        refetchLocations();})
    }
  
    function _editAppointmentStatus(new_appointment){

        const apt_id = new_appointment.id;
        const new_status = new_appointment.status;

      editAppointmentStatus({apt_id, new_status},(result)=>{
        setSelectedAppointmentId(null);
        refetchLocations();
    })
  
    }
  
    function _deleteAppointment(appointment_id){
        deleteAppointment({appointment_id},(result)=>{refetchLocations()})
    }

    return(<>      
      {appointments.map((appointment, idx)=>  
          <AppointmentPanel 
              key={idx} 
              {...{appointment,icons,selectedAppointmentId,selectedLocationId, _deleteAppointment, _editAppointmentStatus}} 
              startingMode = {AppointmentPanelState.Card}
              isAppointmentSelected = {appointment.id === selectedAppointmentId}
              selectAppointment={ (id)=> setSelectedAppointmentId(id) }/>)}

      {isUser() ? // users can see a button for appointment creations
          <>
            <AppointmentPanel
              {...{icons, _postAppointment, selectedAppointmentId}}
              startingMode = {AppointmentPanelState.AddButton}/>
          </>  : <></>}
    </>);
  }

  function AppointmentPanel({ 
    appointment = {},
    icons = [], 
    selectedLocationId = null, 
    selectedAppointmentId = null,
    startingMode = AppointmentPanelState.Card,
    isAppointmentSelected = false,
    _postAppointment = () =>{},
    _deleteAppointment = () =>{}, 
    _editAppointmentStatus = () =>{},
    selectAppointment = () => {},
  }){

    const [ mode, setMode ] = useState( startingMode )

    useEffect(()=>setMode(startingMode), [selectedAppointmentId, selectedLocationId])

    const {id, date,end,start, status, appointment_types} = appointment

    function getUI(selectedMode){        
        switch(selectedMode){
            case AppointmentPanelState.AddButton:
                return <button onClick={e=>setMode(AppointmentPanelState.New)} className="">Create Appointment</button>
            case AppointmentPanelState.New:
                return <>
                    <AppointmentForm
                      cancelForm={()=>setMode(AppointmentPanelState.AddButton)}
                      submitForm ={_postAppointment}
                      form={ {...appointmentForm}  }
                      validAppointmentTypes={icons}/>
                </>
            case AppointmentPanelState.EditStatus:
               return <>
                   <AppointmentForm
                      cancelForm={()=>setMode(AppointmentPanelState.Card)}
                      submitForm ={_editAppointmentStatus}
                      form={ {id, date, end_time: end, start_time: start, status} }
                      validAppointmentTypes={icons}/>
                </>
            case AppointmentPanelState.Card:
                return<>
                    <AppointmentCard 
                      {...{appointment, isAppointmentSelected}}
                      handleDeleteAppointment={_deleteAppointment}
                      handleSetEdit={()=>setMode(AppointmentPanelState.EditStatus)}/>              
                </>;
            default: return <></>
        }
    }
    return(<>
        <div className={`appointment_card ${isAppointmentSelected  && `appointment_card_selected`}`} 
            onClick={e=> selectAppointment(id)}>
                {getUI(mode)}
        </div>
    </>);
}

 function AppointmentCard({
  appointment = {},
  isAppointmentSelected = false,
  handleDeleteAppointment = ()=>{},
  handleSetEdit = ()=>{}
 }){

  const { isUser, isStoreOwner } = useAuth();  

  const {id, date,end,start, status, appointment_types} = appointment

  return(<>
    <div className="form_row">
      <div>  type  </div>
      <div className="appointment_card_icons">
        <IconList icons={appointment_types} iconSize={15}/>
      </div>
    </div>
    <div className="form_row"> 
        <div>date</div>
        <div>{/*date*/} 10/10/23 </div>
    </div>

    <div className="form_row">
      <div>start-time </div>
      <div>{/*start*/} 10:30 AM </div>
    </div>

    <div className="form_row">
      <div>  end-time </div>
      <div> {/*end*/} 11:30 AM </div>
    </div>

    <div className="form_row"> 
      <div> status </div>
      <div> {status} </div>
    </div>

    {isUser() ? <>
        <button className={isAppointmentSelected ? "show_btn" : "hide_btn"} onClick={e=>handleDeleteAppointment(id)}>Cancel</button>
    </>: <></>}
    {isStoreOwner() ? <>
        <button className={isAppointmentSelected ? "show_btn" : "hide_btn"} onClick={e=>handleSetEdit()}>Update Status</button>
    </>: <></>}
  </>);
}

function AppointmentForm({
    cancelForm = ()=>{} , 
    submitForm = ()=>{},
    form = appointmentForm,
    validAppointmentTypes = [getIcons()]
 // LocationFormState = ""
}){

    const { isStoreOwner, isUser } = useAuth();
    const { config } = useConfig();  

    const {
        selectedIcons,
        toggleIcon,
    } = useIcons();
  
    const [ formFields, setFormFeilds ] = useState(form)

    const areFieldsValid = () => formFields.date.trim() && formFields.start_time.trim() && formFields.end_time.trim() && selectedIcons.length > 0
  
    function handleChange(e){
      setFormFeilds({
        ...formFields,
        [e.target.name]: e.target.value
      })
    }
  
    function handleSubmit(e){
      e.preventDefault();
      console.log(formFields);
      submitForm({...formFields, apt_types: [...selectedIcons]});
      cancelForm()
    }

    return(<>

        <div className={`form_row ${isUser() && `top_margin_add_user_apt`}`}> type:
          <div className="appointment_card_icons">
              {isUser() ? 
              <>
                <IconList 
                  iconSize={16}
                  icons={validAppointmentTypes}
                  selectedIcons={selectedIcons}
                  toggleIcon={toggleIcon}/>          
              </> : <>
                <IconList icons={validAppointmentTypes}/>       
              </>}           
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <button onClick={e=>cancelForm()} className="cancel_new_appointment_btn">X</button>
          <div className="form_row">
            date: 
            {isUser() ? <input name="date" value={formFields.date.trim()} className="appointment_form_input" onChange={handleChange} required /> : <>{formFields.date}</>}
          </div>
          <div className="form_row">
            start-time:  
            {isUser() ? <input name="start_time" value={formFields.start_time.trim()} className="appointment_form_input" onChange={handleChange} required /> : <>{formFields.start_time}</>}
          </div>
          <div className="form_row">
            end-time: 
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


          <input type="submit" value="Confirm" disabled={isUser() && !areFieldsValid()}/>
        </form>
    </>);
}

export default AppointmentList