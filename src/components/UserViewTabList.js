import CircleLoader from "react-spinners/ClipLoader";

function UserViewTabList({
    userViews = [],
    isTabSelected = ()=>{},
    setSelectedTab = ()=>{}
  }){
  
    function getType(type){
      if(type === "USER"){
        return "User"
      }else if(type === "GUEST"){
        return "Guest"
      }else{
        return "Store Owner"
      }
    }
  
    const override = {
      display: "block",
      opacity: .5,
      margin: "0 auto",
      borderColor: "black",
    };
  
    return(<>
     <div 
        className="user_picker" //adjust the container back to the top-right of the viewport
        style={{right: `${ -1*(userViews.length-1)*65 }px`}}> 
          {userViews.map( (userView,idx)=>
            <div
              key={idx} 
              className={`user_tab ${isTabSelected(idx) && `selected_user_tab`}`}
              style={{right: `${idx*65}px`}} //offset each tab so they overlap with each other
              onClick={ !userView.error ? e=>{ setSelectedTab(idx)} : e=>{} }
              disabled={userView.error}>
                <div>{userView.loading ? <>
                  <CircleLoader
                    color={"#ffffff"}
                    loading={true}
                    cssOverride={override}
                    size={15}
                    aria-label="Loading Spinner"
                    data-testid="loader"/>               
                </> : userView.error ? "error": getType(userView.type)}</div>
            </div>)} 
      </div>
    </>);
  }

  export default UserViewTabList;