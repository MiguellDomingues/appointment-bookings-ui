import {useState, useEffect } from 'react'

import { useAuth, AuthProvider,useConfig} from './AuthProvider'

import LocationList from './components/LocationList'
import AppointmentList from './components/AppointmentList'
import MyMap from './components/Map.tsx'

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

  const { isUser, isStoreOwner } = useAuth();

  function getSelectedLocationAppointments(location_id){

    console.log("selected: ", location_id)

    const selected_location = data.find(({id})=>id === location_id)

    if(!location_id){ //if no location is selected
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

      {isUser() || isStoreOwner() ? //only show the appointments to user, storeowner user types
        <AppointmentList 
          appointments={getSelectedLocationAppointments(selected)} 
          selectedLocationId={selected}
          refetchLocations={refetchLocations}/> : 
        <></>}
    </div>

  </div>);
}