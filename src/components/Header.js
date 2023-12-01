import { useAuth } from '../AuthProvider'
import { useAppContext } from '../AppContextProvider'
import { Link  } from "react-router-dom";

import useAPI from '../useAPI.js'
import API from '../API'

function Header(){

const { token, loadingUser,  isUser, isStoreOwner, isGuest, unsetToken, isAuth } = useAuth();

const { refetchLocations: _refetchLocations, isRefetching, links } = useAppContext();

const { 
    endSession, 
    loading
   } = useAPI(
      API.endSession, 
      (results)=>{ unsetToken() }
   )


//{links?.map(({name, handler}, i)=> <span key={i} onClick={handler}>{name}</span>)}
  //console.log("header/////", token)

return( 
    <div className="header">

        {links?.map(({name, route}, i)=> <Link key={i} to={route}>{name}</Link>)}
        {isAuth() ? <span onClick={(e)=>endSession()}>Log Out</span> : <></>}
        <span> <button disabled={isRefetching} onClick={e=>_refetchLocations()}>Refresh</button> </span>

    </div>);
}

export default Header;