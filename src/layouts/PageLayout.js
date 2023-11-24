import { useAuth,} from '../AuthProvider'
import LoadingOverlay from '../components/LoadingOverlay';
import Header from '../components/Header';

function PageLayout({
    leftPanel = <></>,
    rightPanel = <></>,
  }){
  
    const { loadingUser  } = useAuth();
  
    return (<>  
  
        <LoadingOverlay 
          isLoading={loadingUser} 
          isFullscreen={true}
          loadingText={"Authenticating..."}/>
  
        <div className="page">
    
          <div className="page_section_left">
            {leftPanel}
          </div>
    
          <div className="page_section_right">
  
            <div className="header">
              <Header/>
            </div>
            <div className="body_panel">
              {rightPanel} 
            </div>
          </div>
  
        </div>
      </>);
  }

  export default PageLayout;
  