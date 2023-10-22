import {useState, useEffect } from 'react'

import { useAuth, AuthProvider,useConfig} from './AuthProvider'
import MyMap from './Map.tsx'
import useAPI from './useAPI'
import './styles.css';

const accounts = [
  {
    type: null,
    credentials: null,
    loading: true,
    error: false,
  },
  {
    type: null,
    credentials:  {username: "aal;'la", password: "al;';l'aa"},
    loading: true,
    error: false,
  },
  {
    type: null,
    credentials: {username: "aaa", password: "aaa"} ,
    loading: true,
    error: false,
  }, 
  {
    type: null,
    credentials: {username: "aaaa", password: "aaaa"},
    loading: true,
    error: false,
  },         

]

function App() {

  const [users, setUsers] = useState(accounts)
  const [selectedPage, setSelectedPage] = useState(0)

  useEffect(()=>{}, [])

 function handleUserLoginError(idx){
  return function(err){
    console.log("err log in: ", idx, err)
    users[idx].error = true
    setUsers([...users]);
  }
 }

 function handleUserLoginSuccess(idx){
  return function(token){
    //console.log("idx: ", idx, " token: ", token)

    if(token){
      users[idx].type = token.type
    }else{
      users[idx].type = "GUEST"
      users[idx].loading = false
    }

    setUsers([...users]);
  }
 }

 function handleUserLoginFinally(idx){
  return function(){
    users[idx].loading = false
    setUsers([...users]);
  }
 }


  return (<>

        <div className="user_picker">
          <div>select a user</div> 
          {users.map( (account,idx)=>
            <button 
              key={idx} 
              onClick={ !account.error ? e=>{setSelectedPage(idx)} : e=>{} }
              disabled={account.error}>
              {account.loading ? "loading..." : account.error ? "error": account.type}
            </button>)} 
        </div>

        {users.map( (account,idx)=>
            <AuthProvider      
              key={idx}       
              credentials={account.credentials} 
              onLogInSuccess={handleUserLoginSuccess(idx)}
              onLogInError={handleUserLoginError(idx)}
              onLogInFinally={handleUserLoginFinally(idx)}>
                <div className={idx === selectedPage ? "show_view page_wrapper" : "hide_view page_wrapper"}><UserView/></div>
            </AuthProvider>
          )}
      </>);
}

export default App;


function UserView(){

  const { config } = useConfig()
  const { token } = useAuth();

  const { fetchLocations, loading } = useAPI()

  const [data, setData] = useState([]);

   /* track the id of the selected entity to update map/list*/
  const [selectedLocation, setSelectedLocation] = useState();

  useEffect( () => getPosts(), [token, config]);

function getPosts(){
    fetchLocations().then((results)=>{setData(results.posts)})
  }
      
  return (<>     
        <Header refetchLocations={getPosts}/>
        <Body
          data={data}
          selected={selectedLocation}
          selectLocation={(id)=>{setSelectedLocation(id)}}
          refetchLocations={getPosts}/>
        <Footer/>   
  </>);
  
}

function Header({refetchLocations}){

  const { token } = useAuth();

  return( <div className="header">
    {token && token?.username ? <>Welcome{token.username}</> : <></> }
    <button onClick={e=>refetchLocations()}>Refresh</button>
  </div>);
}

function Footer(){
  return( <div className="footer"> </div>  );
}

function Body({
  data, 
  selected, 
  selectLocation, 
  refetchLocations}){

  const { token } = useAuth();

 //// console.log("data: ", data)
  //console.log("TOKEN: ",token)

  function getSelectedLocationAppointments(location_id){

    console.log("selected: ", location_id)

    if(!location_id){ //if no location is selected
      return [];
    }

    const selected_location = data.find(({id})=>id === location_id)

    if(!selected_location){  //if no matching location was found for a selection (this CAN HAPPEN WHEN SWITCHING USERS)
      
      return [];
    }

    return selected_location?.appointments

  }

  return(
  <div className="body">
    <div className="body_map">
      <MyMap posts={data} selected={selected} handleSelectedLocation={selectLocation} />
    </div>
    <div className="body_locations">

        <LocationList 
          locations={data}  
          selectedLocationId={selected}  
          selectLocation={selectLocation}
          refetchLocations={refetchLocations}/>

      {token ? <AppointmentList 
              appointments={getSelectedLocationAppointments(selected)} 
              selectedLocationId={selected}
              refetchLocations={refetchLocations}/> : <></>}

    </div>

  </div>);
}


function LocationList({
  locations = [], 
  selectedLocationId = null, 
  selectLocation = ()=>{}, 
  refetchLocations = ()=>{} }){

  const { token } = useAuth();  

  const [showNewLocationForm, setShowNewLocationForm] = useState(false);

  const {loading,deleteLocation, editLocation, postLocation  } = useAPI()


  useEffect(()=>setShowNewLocationForm(false), [token, locations])

  function addLocation(new_location){
    postLocation({new_location},(result)=>{refetchLocations()})
  }

  function _deleteLocation(location_id){
      deleteLocation({location_id},(result)=>{refetchLocations()})  
  }

  function _editStoreOwnerLocation(location){
      editLocation({location},(result)=>{refetchLocations()})
  }

//console.log(locations)
  return(<>
    {locations ? locations.map( (location, idx)=>
        <LocationCard key={idx} location={location}//{...location} 
          selectedLocationId={selectedLocationId} 
          selectLocation={selectLocation}
          deleteLocation={_deleteLocation}
          editStoreOwnerLocation={_editStoreOwnerLocation}/>) 
      : <></>}

     
      {token?.type === "STOREOWNER" ? 
        (showNewLocationForm ? 
        <div className="location_card">
          <LocationForm 
            cancelLocationForm={e=>setShowNewLocationForm(false)} 
            putStoreOwnerLocation={addLocation}/> 
        </div>: 
          <button onClick={e=>setShowNewLocationForm(true)}>Add New Location</button>)
      : <></>}

  </>)
}


function LocationCard({
 // info, address, id, LatLng, 
  location,
  selectedLocationId, 
  selectLocation=()=>{}, 
  deleteLocation=()=>{}, 
  editStoreOwnerLocation=()=>{}}){

  const { token } = useAuth();  

  const [isEdit, setIsEdit] = useState(false);

  useEffect(()=>setIsEdit(false), [token, location, selectedLocationId])

  const {info, address, id, LatLng, } = location

  return( 
    <div className={id===selectedLocationId ? "location_card location_card_selected" : "location_card"  } 
        onClick={ e=>{ selectLocation(id)}}>


    { isEdit ? <>
      <LocationForm 
        cancelLocationForm={e=>setIsEdit(false)} 
        putStoreOwnerLocation={editStoreOwnerLocation}
        form={ {info: info, address: address, LatLng: LatLng, id: id} }/></> 
    :
    <>
      {token?.type === "STOREOWNER" && id===selectedLocationId ? 
        <div className="location_card_btns"> 
          <button onClick={e=>deleteLocation(id)} className="">Delete Location</button>
          <button onClick={e=>{setIsEdit(true)}} className="">Edit Location</button>
        </div>
     : <></>}
        <div>info: {info}</div>
        <div>address: {address}</div> 
  </>}
  </div>);
}

const locationForm =  {address: "", info: ""}

function LocationForm({
  cancelLocationForm = ()=>{} , 
  putStoreOwnerLocation = ()=>{},
  form = locationForm
 }){

  //console.log("/////// FORM IS ", form)

  const [ formFields, setFormFeilds ] = useState(form)
  const areFieldsValid = () => formFields.info.trim() && formFields.address.trim() 

  function handleChange(e){
    setFormFeilds({
      ...formFields,
      [e.target.name]: e.target.value
    })
  }

  function handleSubmit(e){
    e.preventDefault();
    console.log(formFields);
    putStoreOwnerLocation({...formFields, icons: []}); //ignore the icons for now
  }

  return(<>

     <form onSubmit={handleSubmit}>
      <button onClick={cancelLocationForm} className="cancel_new_appointment_btn">X</button>
      <div className="form_row">
        address: <input name="address" value={formFields.address.trim()} className="appointment_form_input" onChange={handleChange} required /> 
      </div>
      <div className="form_row">
        info:  <input name="info" value={formFields.info.trim()} className="appointment_form_input" onChange={handleChange} required />  
      </div>
      <input type="submit" value="Confirm" disabled={!areFieldsValid()}/>
    </form>

  </>)

}

function AppointmentList({appointments = [], selectedLocationId = null, refetchLocations}){

  const { token } = useAuth();  
  const { config } = useConfig();

  const [showNew, setShowNew] = useState(false);

  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

  useEffect(()=>{
    setShowNew(false)
    setSelectedAppointmentId(null)
  }, [selectedLocationId, token])

  //console.log("TOKEN: ",token)
 // console.log("configs: ", config)
  //console.log("APPOINTMENTS: ", appointments)

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
      {token.type === "USER" && selectedLocationId ? <button disabled={showNew} onClick={e=>setShowNew(true)} className="add_apt_btn">Create Appointment</button> : <></> }
      <div className="appointment_list">
        
        {appointments.map((appointment, idx)=>  
            <AppointmentCard key={idx} {...appointment} 
            deleteUserAppointment={_deleteUserAppointment} 
            updateAppointmentStatus={_updateAppointmentStatus}
            selectedLocationId={selectedLocationId}
            selectedAppointmentId={selectedAppointmentId}
            selectAppointment={ (id)=> setSelectedAppointmentId(id) }/>)}
          
        { token.type === "USER" && showNew ? 
        <AppointmentForm 
          cancelCreateAppointment={()=>{setShowNew(false)}} 
          createUserAppointment={_createUserAppointment}/>: <></>}     
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

  const { token } = useAuth(); 
  const { config } = useConfig();

  const STATUS = config.STATUS

  const [newStatus, setNewStatus] = useState(status)

  const isSelected = id===selectedAppointmentId 

  useEffect(()=>setNewStatus(status), [token, selectedLocationId, selectedAppointmentId])
  
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
          if(token.type === "STOREOWNER"){ // if its a storeowner user...
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
          }else if(token.type === "USER"){
            return <>{status}</>
          }else{
            return <></>
          } 
        })()}
      
      </div>

      {(()=>{
          const btn_css = isSelected  ? 'visible' : 'hidden'
          if(token.type === "STOREOWNER"){ //when the user is a storeowner, show the 
            return <><button style={{visibility: btn_css}} disabled={status === newStatus} onClick={e=>updateAppointmentStatus(id, newStatus)}>Update Status</button></>
          }else if(token.type === "USER"){
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

