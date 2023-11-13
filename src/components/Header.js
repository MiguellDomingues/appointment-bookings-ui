import { useAuth } from '../AuthProvider'

function Header({
refetchLocations,
refetching,
handleSetMapPage,
handleSetCalendarPage
}){

const { token, loadingUser,  isUser, isStoreOwner, isGuest } = useAuth();

function getLinks(){
    if(isStoreOwner()){
    return <>
        <span onClick={handleSetMapPage}>My Location</span>
        <span onClick={handleSetCalendarPage}>My Appointments</span>
    </>
    }else{
    return <><span onClick={handleSetMapPage}>Locations</span></>
    }
}

return( 
    <div className="header">

        {getLinks()}

        <span>
        {loadingUser ? 
            <>Athenticating....</> : 
            <>Welcome {token && token?.username ? <>{token.username}</> : <>Guest</> }    
        </>}
        </span>
        
        <span> <button disabled={refetching} onClick={e=>refetchLocations()}>Refresh</button> </span>
    </div>);
}

export default Header;