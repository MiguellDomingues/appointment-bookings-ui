import {useState, useEffect } from 'react'

import { useAuth, 
  useConfig, 
  fetchGuestLocations, fetchUserLocations, fetchLocationsStoreOwner , deleteUserAppointment,  
  updateAppointmentStatus, editStoreOwnerLocation, putStoreOwnerLocation,  deleteLocation ,
  postUserAppointment} from './AuthProvider'
import MyMap from './Map.tsx'
import './styles.css';





const GUEST = {}
const APOINTEE = {username: "aaa", password: "aaa"}  //USER who makes appointments
const APOINTER = {username: "aaaa", password: "aaaa"}  //STOREOWNER who manages appointments

const accounts = [
  {username: "", password: ""},        //guest
  {username: "aaa", password: "aaa"} , //user
  {username: "aaaa", password: "aaaa"} //storeowner
]

function App() {


  const { token, onLogin, onLogout } = useAuth();
  const [user, setUser] = useState(null);
 

  useEffect(()=>{

    if(token){
      setUser(token.type)
    }else{
      setUser("GUEST")
    }

    console.log("/////31 current user is: ", token)
  }, [token])



  const getCSS = type => user === type ? "user_type_selected" : "" 


  const handleResult = (response) =>{
    console.log("handle fail login: ", response)
 }


 // console.log("TOKEN: ",token)

  return (
    
      <div className="app">

        <div className="user_picker">
          <div>select a user</div>
          <button className={getCSS("GUEST")} onClick={e=>onLogout() }>Guest</button>
          <button className={getCSS("USER")} onClick={e=>onLogin(APOINTEE, handleResult)}>Apointee</button>
          <button className={getCSS("STOREOWNER")} onClick={e=>onLogin(APOINTER, handleResult)}>Store Owner</button>
        </div>

          {/*
           on app load:
              - do a login callout for each person on the list
                - add a delay so the login call resolves in a different order
              - as the callouts resolve, update a state list, which gets rendered in a loop
                - draw a button on the panel for each callout we are making
                  - the button should show a loading spinner while its resolving and be unclickable
              
              - as the callouts are resolving, make the buttons clickable
                - on click, go to the route/page for that user
              
        
        */}

        {/*
           for each user:
              <route path="(user name)">
                <AuthProvider >
                  <view>
                <AuthProvider>
              </route>
        
        */}
   
          <UserView/>
       
      </div>
    
  );
}

export default App;

function UserView(){

  const { config } = useConfig()
  const { token } = useAuth();
 
  

 // console.log("locations_path: ", locations_path )
 // console.log("TOKEN: ",token)

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
   /* track the id of the selected entity to update map/list*/
   const [selectedLocation, setSelectedLocation] = useState();


  function _fetchUserLocations(path){
    fetchUserLocations(token.key,path)
    .then((r)=>{
      console.log("set USER posts GP: ", r)
      setData(r.posts);  
    }).catch((err)=>{
      console.log("err ", err)
    }).finally(()=>{
      setLoading(false) 
    })
  }

  function _fetchGuestLocations(path){
    fetchGuestLocations(null,path)
    .then((r)=>{
      console.log("setposts GP: ", r)
      setData(r.posts);  
    }).catch((err)=>{
      console.log("err ", err)
    }).finally(()=>{
      setLoading(false) 
    })
  }

  function _fetchStoreOwnerLocations(path){
    fetchLocationsStoreOwner(token.key,path)
    .then((r)=>{
      console.log("set STOREOWNER posts GP: ", r)
      setData(r.posts);  
    }).catch((err)=>{
      console.log("err ", err)
    }).finally(()=>{
      setLoading(false) 
    })

  }

  function refetchLocations(){
    const path = config ? `${config.DOMAIN}${config.ENDPOINT_URL_LOCATION}` : ''

    if(token.type === "USER"){
      _fetchUserLocations(path)
    }else if(token.type === "STOREOWNER"){
      _fetchStoreOwnerLocations(path)
    }else{
      _fetchGuestLocations(path)
    }
  }


  // const selectLocation = (e, id) => {
   // e.preventDefault();
   // console.log("select location GP: ", id)
    //setSelected(id)
 // }

  useEffect( () => {
 
   

    //console.log("87/////////////////////////LOCATION PATH: ", locations_path)

    
    const dataFetch = async () => {    

      if(!config){
        return;
      }

      const locations_path = config ? `${config.DOMAIN}${config.ENDPOINT_URL_LOCATION}` : ''


      setLoading(true) 

      switch(token?.type){
        case "USER":{


         
          _fetchUserLocations(locations_path)




          break;
        }
        case "STOREOWNER":{

        
          _fetchStoreOwnerLocations(locations_path)



          break;
        }
        default:{

          _fetchGuestLocations(locations_path)

        }
      }

     

    };

    



    dataFetch();

}, [token, config]);

//console.log("data: ", data)
//console.log("TOKEN: ",token)


  return (<>
       
        <Header/>
        <Body
          data={data}
          selected={selectedLocation}
          selectLocation={(id)=>{setSelectedLocation(id)}}
          refetchLocations={refetchLocations}/>
        <Footer/>
         
        
  </>);


}

function Header(){
  return( <div className="header"></div>);
}

function Footer(){
  return( <div className="footer"> </div>  );
}

function Body({data, selected, selectLocation, refetchLocations}){

  const { token } = useAuth();

  console.log("data: ", data)
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


function LocationList({locations = [], selectedLocationId = null, selectLocation = ()=>{}, refetchLocations = ()=>{} }){

  const { token } = useAuth();  
  const { config } = useConfig();
  const [loading, setLoading] = useState(false);

  const [showNewLocationForm, setShowNewLocationForm] = useState(false);

  useEffect(()=>setShowNewLocationForm(false), [token, locations])

  //putStoreOwnerLocation

  function _putStoreOwnerLocation(new_location){

    const locations_path = config ? `${config.DOMAIN}${config.ENDPOINT_URL_LOCATION}` : ''
    
    setLoading(true);
    putStoreOwnerLocation(new_location, token.key, locations_path)
    .then(()=>{
      refetchLocations()
      //setShowNewLocationForm(false)
    })
    .catch((err)=>{console.log("err adding location", err)})
    .finally(()=>{
      setLoading(false);
    })

  }

  function _deleteLocation(location_id){
    const locations_path = config ? `${config.DOMAIN}${config.ENDPOINT_URL_LOCATION}` : ''
    
    setLoading(true);
    deleteLocation(location_id, token.key, locations_path)
    .then(()=>{
      refetchLocations()
      //setShowNewLocationForm(false)
    })
    .catch((err)=>{console.log("err adding location", err)})
    .finally(()=>{
      setLoading(false);
    })
  }

  function _editStoreOwnerLocation(location){

    const locations_path = config ? `${config.DOMAIN}${config.ENDPOINT_URL_LOCATION}` : ''
    
    setLoading(true);
    editStoreOwnerLocation(location, token.key, locations_path)
    .then(()=>{
      refetchLocations()
      //setShowNewLocationForm(false)
    })
    .catch((err)=>{console.log("err edit location", err)})
    .finally(()=>{
      setLoading(false);
    })

  }

console.log(locations)
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
            putStoreOwnerLocation={_putStoreOwnerLocation}/> 
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

  return( <div className={id===selectedLocationId ? "location_card location_card_selected" : "location_card"  } 
  onClick={ e=>{ selectLocation(id)}}>


  { isEdit ? <> <LocationForm 
            cancelLocationForm={e=>setIsEdit(false)} 
            putStoreOwnerLocation={editStoreOwnerLocation}
            form={ {info: info, address: address, LatLng: LatLng, id: id} }/></> 
  :
  
  <>

      {token?.type === "STOREOWNER" && id===selectedLocationId ? 
          <div className="location_card_btns"> 
            <button onClick={e=>deleteLocation(id)} className="">Delete Location</button>
            <button onClick={e=>{setIsEdit(true)}
              } className="">Edit Location</button>
          </div>
        : <></>}

        <div>info: {info}</div>
        <div>address: {address}</div> 

  </>
  }
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
  const [loading, setLoading] = useState(false);

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

  const [loading, setLoading] = useState(false);

  const [showNew, setShowNew] = useState(false);

  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

  useEffect(()=>{
    setShowNew(false)
    setSelectedAppointmentId(null)
  }, [selectedLocationId, token])

  console.log("TOKEN: ",token)
  console.log("configs: ", config)
  console.log("APPOINTMENTS: ", appointments)
  
  function _deleteUserAppointment(appointment_id){

    const appointments_path = config ? `${config.DOMAIN}${config.ENDPOINT_URL_APPOINTMENT}` : ''
    
    setLoading(true);
    deleteUserAppointment(appointment_id, token.key, appointments_path)
    .then(()=>{refetchLocations()})
    .catch((err)=>{console.log("err delete appt", err)})
    .finally(()=>{
      setLoading(false);
    })

  }

  function _createUserAppointment(formFields){

    const appointments_path = config ? `${config.DOMAIN}${config.ENDPOINT_URL_APPOINTMENT}` : ''

    const apt = {
      loc_id: selectedLocationId ,
      ...formFields
    }
    
    setLoading(true);
    postUserAppointment(apt, token.key, appointments_path)
    .then((res)=>{
      setShowNew(false)
      refetchLocations()
      console.log("inserted apt: ", res)
    })
    .catch((err)=>{console.log("err delete appt", err)})
    .finally(()=>{
      setLoading(false);
    })

  }

  function _updateAppointmentStatus(apt_id, new_status){

    const appointments_path = config ? `${config.DOMAIN}${config.ENDPOINT_URL_APPOINTMENT}` : ''

    const apt = {
      apt_id: apt_id,
      new_status: new_status
    }
    
    setLoading(true);
    updateAppointmentStatus(apt, token.key, appointments_path)
    .then((res)=>{
      setShowNew(false)
      refetchLocations()
      console.log("inserted apt: ", res)
    })
    .catch((err)=>{console.log("err delete appt", err)})
    .finally(()=>{
      setLoading(false);
    })
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
//const STATUS = ['Approved', 'In Progress', 'Completed', 'Canceled']
function AppointmentCard({id, date,end,start, status, selectedLocationId, selectedAppointmentId,
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

        {/*
      {token.type === "USER" ? <button onClick={e=>deleteUserAppointment(id)}>Delete</button> : <></>}
      {token.type === "STOREOWNER"  ? <button disabled={status === newStatus} onClick={e=>updateAppointmentStatus(id, newStatus)}>Update Status</button> : <></>}
*/}
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





function LocationPanel({
  onSubmit = ()=>{},
  onCancel = ()=>{},
  selectLocation=()=>{},
  

}){

  return(<></>);

}

/*
  {
    ((b)=>{
      const a = 7
      console.log("dsfdsfsd", a, b)

      if(a !== 7){
        return <>BBBBB</>
      }else return <>CCC</>
    
    })(8)  
  }  {
    ((b)=>{
      const a = 7
      console.log("dsfdsfsd", a, b)

      if(a !== 7){
        return <>BBBBB</>
      }else return <>CCC</>
    
    })(8)  
  }
*/


