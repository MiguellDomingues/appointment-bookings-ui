import { useAuth } from '../AuthProvider'
import { useAppContext } from '../AppContextProvider'

function Header({
refetchLocations,
refetching,
handleSetMapPage = ()=>{},
handleSetCalendarPage = ()=>{},
handleSetAvailabilityPage = ()=>{},
}){

const { token, loadingUser,  isUser, isStoreOwner, isGuest } = useAuth();

const { refetchLocations: _refetchLocations, isRefetching, links } = useAppContext();

//context.refetchLocations = () => getData()
  //context.isRefetching = loading

function getLinks(){

    if(isStoreOwner()){
    return <>
        <span onClick={handleSetMapPage}>My Location</span>
        <span onClick={handleSetCalendarPage}>My Appointments</span>
        <span onClick={handleSetAvailabilityPage}>My Availability</span>
    </>
    }else{
    return <><span onClick={handleSetMapPage}>Locations</span></>
    }
}

return( 
    <div className="header">

        {/*getLinks()*/}
        {links?.map(({name, handler})=> <span onClick={handler}>{name}</span>)}

        <span>
        {loadingUser ? 
            <>Athenticating....</> : 
            <>Welcome {token && token?.username ? <>{token.username}</> : <>Guest</> }    
        </>}
        </span>
        
        <span> <button disabled={isRefetching} onClick={e=>_refetchLocations()}>Refresh</button> </span>
    </div>);
}

export default Header;