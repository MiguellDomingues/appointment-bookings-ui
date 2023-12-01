
import {  Routes, Route, useNavigate, Outlet } from "react-router-dom";

import { useEffect } from "react";

import { AppContextProvider,useAppContext } from './AppContextProvider'

import { useAuth } from './AuthProvider'

import GuestLayout from './layouts/GuestLayout'

import UserLayout from './layouts/UserLayout'
import StoreOwnerLayout from './layouts/StoreOwnerLayout'

import './styles.css';

const AuthUserTypes = Object.freeze({
  User: "USER",
  StoreOwner: "STOREOWNER"
});


function App() {

  return (<>          
    <div className="show_view page_wrapper">   
      <AppContextProvider>
        <AppProvider/>
      </AppContextProvider>                                            
    </div>                 
  </>);
}

export default App;

function AppProvider(){

  const {token, isUser, isStoreOwner, isGuest} = useAuth()
  const navigate = useNavigate();
  const context = useAppContext();

  //console.log("///app token", token)

  return(<>
  <Routes>

    <Route path="*" element={<><GuestLayout/></>}/>

    <Route path={`/${AuthUserTypes.User}/*`} element={<>
        <Private authorized={[AuthUserTypes.User]}>
            <UserLayout/>
        </Private>
       </>}/>
    <Route path={`/${AuthUserTypes.StoreOwner}/*`} element={<>
        <Private authorized={[AuthUserTypes.StoreOwner]}>
            <StoreOwnerLayout/>
    </Private>
    </>}/>
  </Routes> 
  </>);
}

function Private({children, authorized}){
  const { getUserType } = useAuth()

  const checkAuth = () => authorized.includes(getUserType())

  if(checkAuth()){
    console.log("authorized")
    return <>{children}</>
  }else{
    console.log("unauthorized")
    return <>Not Authorized</>
  }

}

function Public({children}){
  const { isGuest, unsetToken } = useAuth()
  const navigate = useNavigate();

  if(isGuest()){
    return <>{children}</>
  }else{
    unsetToken()
    return <></>
  }
}


