import { useAuth } from '../AuthProvider'
import { useAppContext } from '../AppContextProvider'
import { Link  } from "react-router-dom";
import { useState } from 'react'

import LoadingOverlay from './LoadingOverlay'

import useAPI from '../useAPI.js'
import API from '../API'

import '../styles.css';

function Header(){

const { unsetToken, isAuth, setToken } = useAuth();

const { refetchLocations: _refetchLocations, isRefetching, links } = useAppContext();

const [ isOpen, setOpen ] = useState(false)

const { 
    endSession, 
    loading: endSessionLoading
   } = useAPI(
      API.endSession, 
      (results)=>{ unsetToken() }
   )


const {
    startSession, 
    loading: startSessionLoading 
} = useAPI(
        API.startSession, 
        (result)=>{
            const {key, path, type} = result
            setOpen(false)
            setToken({key, path, type})
            console.log("log in user:", result)
});
 

return(<>
    <div className="header">
     
        <ModalWrapper isOpen={isOpen} close={()=>setOpen(false)}>              
            <LogOn startSession={startSession} loading={startSessionLoading}/>                         
        </ModalWrapper>           
        

        {links?.map(({name, route}, i)=> <Link key={i} to={route}>{name}</Link>)}

        {isAuth() ? <span onClick={(e)=>endSession()}>Log Out</span> : 
        <>
            <span onClick={e=>setOpen(true)}>Log In</span>
            <span onClick={e=>console.log("open register modal")}>Register</span>
        </>}
        <span> <button disabled={isRefetching} onClick={e=>_refetchLocations()}>Refresh</button> </span>

    </div>
</>);
}

export default Header;


function LogOn({ startSession = ()=>{}, loading = false}){

    return(<div>
          
        <div className='auth_body'> 
            <button disabled={loading} onClick={e=>startSession("a", "a")}>Log on as User</button>
            <button disabled={loading} onClick={e=>startSession("d", "d")}>Log on as Store Owner</button>
        </div>
      
</div>);
}

function ModalWrapper({isOpen = false, close = ()=>{}, children}){

   if(isOpen){
        return(<>
            <div className='fullscreen_overlay'>
                <div className='modal_container'>
                    <div className='close_wrapper'>
                        <div onClick={close} className="cancel_panel_btn">X</div>           
                        {children}
                    </div>
                </div>  
            </div>
        </>)
   }

   return <></>

}

