import {useState, useEffect } from 'react'

import { useAuth, useConfig } from '../AuthProvider'

import {IconList, getIcons}   from './IconList'
import {useAppContext}        from '../AppContextProvider'
import LoadingOverlay         from './LoadingOverlay'
import useIcons               from '../hooks/useIcons'
import useAPI                 from '../useAPI'

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
  appointments = [],
  icons = [], 
  loading = false
}){

    const { isUser,loadingConfigs,loadingUser } = useAuth();   
    const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

    //useEffect(()=>{
     // setSelectedAppointmentId(null)
    //}, [selectedLocationId]) // when user selects a new location, close new appointment panel and clear the selected appointment
  
    const context = useAppContext()

    context.selectedAppointmentId = selectedAppointmentId;
    context.setSelectedAppointmentId = (id)=> setSelectedAppointmentId(id)

   // console.log("selected apt:", selectedAppointmentId)
 
    return(<>

        <LoadingOverlay 
            isLoading={loading && !loadingConfigs && !loadingUser} 
            isFullscreen={false}
            loadingText={"Loading Data"}/>  

        {isUser() ? // users can see a button for appointment creations
            <>
              <AppointmentPanel
                {...{icons}}
                startingMode = {AppointmentPanelState.AddButton}/>
            </>  : <></>}


        {appointments.map((appointment, idx)=>  
            <AppointmentPanel 
                key={idx} 
                {...{appointment,icons}} 
                startingMode = {AppointmentPanelState.Card}
                isAppointmentSelected = {appointment.id === selectedAppointmentId}/>)}

        

    </>);
  }

  function AppointmentPanel({ 
    appointment = {},
    icons = [], 
    startingMode = AppointmentPanelState.Card,
    isAppointmentSelected = false,
  }){

    const [ mode, setMode ] = useState( startingMode )

    const { loading, postAppointment, editAppointmentStatus } = useAPI()


    function handlePostAppointment(formFields){
  
      const new_appointment = {
        loc_id: selectedLocationId ,
        ...formFields
      }
  
      postAppointment({new_appointment},
        (result)=>{
          refetchLocations();
        },
        undefined,
        _=>setMode(AppointmentPanelState.AddButton),
      )

    }
  
    function handleEditAppointmentStatus(new_appointment){

        const apt_id = new_appointment.id;
        const new_status = new_appointment.status;

      editAppointmentStatus({apt_id, new_status},
        (result)=>{
          //setSelectedAppointmentId(null);
          refetchLocations();
        },
        undefined,
        ()=>{setMode(AppointmentPanelState.Card)}
      )
  
    }

    const { selectedLocationId, setSelectedAppointmentId,refetchLocations  } = useAppContext()

    const {id, date,end,start, status, appointment_types} = appointment

    function getUI(selectedMode){        
        switch(selectedMode){
            case AppointmentPanelState.AddButton:
              return <>
                <div className="appointment_card">
                  <button onClick={e=>setMode(AppointmentPanelState.New)} className="">Create Appointment</button>
                </div>
              </>     
            case AppointmentPanelState.New:
              return <>
                <div className="appointment_card">
                    <AppointmentForm
                      cancelForm={()=>setMode(AppointmentPanelState.AddButton)}
                      submitForm ={handlePostAppointment}
                      form={ {...appointmentForm}  }
                      validAppointmentTypes={icons}
                      isFormSubmitting={loading}/>
                </div>
                </>
            case AppointmentPanelState.EditStatus:
               return <>
                <div className="appointment_card">
                    <AppointmentForm
                        cancelForm={()=>setMode(AppointmentPanelState.Card)}
                        submitForm ={handleEditAppointmentStatus}
                        form={ {id, date, end_time: end, start_time: start, status} }
                        validAppointmentTypes={icons}
                        isFormSubmitting={loading}/>
                  </div>
                </>
            case AppointmentPanelState.Card:
                return <>
                   <div className={`appointment_card ${isAppointmentSelected  && `appointment_card_selected`}`} 
                        onClick={e=> setSelectedAppointmentId(id) }>
                          <AppointmentCard 
                            {...{appointment, isAppointmentSelected}}
                            handleSetEdit={()=>setMode(AppointmentPanelState.EditStatus)}/>    
                  </div>          
                </>;
            default: return <></>
        }
    }
    return(<>
       { /*<div className={`appointment_card ${isAppointmentSelected  && `appointment_card_selected`}`} 
            onClick={e=> setSelectedAppointmentId(id) }>*/}
                {getUI(mode)}
        {/*</div>*/}
    </>);
}

 function AppointmentCard({
  appointment = {},
  isAppointmentSelected = false,
  handleSetEdit = ()=>{}
 }){

  const { isUser, isStoreOwner } = useAuth();  

  const {id, date,end,start, status, appointment_types, appointee} = appointment

   const { loading, deleteAppointment } = useAPI();

   const { refetchLocations } = useAppContext()

  const  handleDeleteAppointment =(appointment_id) =>{
    deleteAppointment({appointment_id},(result)=>{refetchLocations()})
}
  
  return(<>
    <LoadingOverlay isLoading={loading} isFullscreen={false}/>



    {isStoreOwner() ? <div className="form_row"> 
        <div>customer</div>
        <div>{appointee}</div>
    </div> : <></>}

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
    validAppointmentTypes = [getIcons()],
    isFormSubmitting = false
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
    }
//${isUser() && `top_margin_add_user_apt`}
    return(<>

        <LoadingOverlay isLoading={isFormSubmitting} isFullscreen={false}/>

        <div className={`form_row top_margin_apt_card`}> type:
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

        <form className="form_card" onSubmit={handleSubmit}>
          <button onClick={e=>cancelForm()} className="cancel_panel_btn">X</button>

          <div className="form_row">
            date 
            {isUser() ? <input type="date" name="date" value={formFields.date.trim()} className="appointment_form_input" onChange={handleChange} required /> : <>{formFields.date}</>}
          </div>
          <div className="form_row">
            start-time 
            {isUser() ? <input type="time" name="start_time" value={formFields.start_time.trim()} className="appointment_form_input" onChange={handleChange} required /> : <>{formFields.start_time}</>}
          </div>
          <div className="form_row">
            end-time
            {isUser() ? <input type="time" name="end_time" value={formFields.end_time.trim()} className="appointment_form_input" onChange={handleChange} required /> : <>{formFields.end_time}</>} 
          </div>

         {isStoreOwner() ?  
            <div className="form_row">
                status
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