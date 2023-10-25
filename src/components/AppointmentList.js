import {useState, useEffect } from 'react'

import { useAuth, useConfig } from '../AuthProvider'

import {IconList, getIcons} from './IconList'

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

function AppointmentList({
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
                    icons={icons}
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
                        icons={icons}
                        startingMode = {AppointmentPanelState.AddButton}
                        _createUserAppointment={_createUserAppointment}
                        selectedAppointmentId={selectedAppointmentId}/>
                </>  : <></>}
            </div>
        </div>
    </>);
  }

  function AppointmentPanel({
    appointment_types = [],
    id, date,end,start, status, 
    icons = [], 
    selectedLocationId = null, 
    selectedAppointmentId = null,
    _createUserAppointment = () =>{},
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
                      form={ {...appointmentForm}  }
                      validAppointmentTypes={icons}/>
                </>
            case AppointmentPanelState.EditStatus:
               return <>
                   <AppointmentForm
                      cancelForm={()=>setMode(AppointmentPanelState.Data)}
                      submitForm ={updateAppointmentStatus}
                      form={ {id, date, end_time: end, start_time: start, status} }
                      validAppointmentTypes={icons}/>
                </>
            case AppointmentPanelState.Data:
                return<>
                    <div className="form_row">
                        <div>  type:  </div>
                        <div className="appointment_card_icons">
                          <IconList icons={appointment_types} iconSize={15}/>
                        </div>
                    </div>
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
    validAppointmentTypes = [getIcons()]
 // LocationFormState = ""
}){

    console.log("form: ", form)
  
    const { isStoreOwner, isUser } = useAuth();
    const { config } = useConfig();  

    const [selectedIcons, setSelectedIcons] = useState([]);

    function toggleIcon(icon_key = ""){

        console.log(icon_key)
        if(!getIcons().includes(icon_key)){
          return
        }
       
        if(selectedIcons.includes(icon_key)){
         // setSelectedIcons(...selectedIcons.filter(icon=>icon !== icon_key) )
          setSelectedIcons( (selectedIcons)=>selectedIcons.filter(icon=>icon !== icon_key) )
        }else{
         // setSelectedIcons([...selectedIcons, icon_key])
          setSelectedIcons( (selectedIcons)=>[...selectedIcons, icon_key] )
        }
      }
  
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
              {isUser() ? <>
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


          <input type="submit" value="Confirm" disabled={isUser() && !areFieldsValid()}/>
        </form>
    </>);
}

export default AppointmentList

