import {useState, useEffect, useMemo } from 'react'

import UserView from './components/UserView'

import { AuthProvider} from './AuthProvider'
import { AppContextProvider} from './AppContextProvider'
import UserViewTabList from './components/UserViewTabList'

import './styles.css';

const accounts = [

  {
    type: null,
    credentials: null,
    loading: true,
    error: false,
  },
  
   /*
   
    {
    type: null,
    credentials:  {username: "aal;'la", password: "al;';l'aa"},
    loading: true,
    error: false,
  },
   
 */

  {
    type: null,
    credentials: {username: "a", password: "a"} ,
    loading: true,
    error: false,
  }, 
  {
    type: null,
    credentials: {username: "d", password: "d"},
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

const isPageSelected = (index) => index === selectedPage 

  return (<>
        <UserViewTabList 
          userViews={users}
          isTabSelected={isPageSelected}
          setSelectedTab={(idx)=>setSelectedPage(idx)}/>

        {users.map( (account,idx)=>
            <AuthProvider      
              key={idx}       
              credentials={account.credentials} 
              onLogInSuccess={handleUserLoginSuccess(idx)}
              onLogInError={handleUserLoginError(idx)}
              onLogInFinally={handleUserLoginFinally(idx)}>           
                <AppContextProvider>
                  <div className={isPageSelected(idx) ? "show_view page_wrapper" : "hide_view page_wrapper"}>                      
                      <UserView/>                             
                  </div>
                </AppContextProvider>
            </AuthProvider>
          )}
      </>);
}

export default App;