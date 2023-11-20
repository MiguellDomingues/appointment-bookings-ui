import { useAuth,useConfig,} from '../AuthProvider'
import LoadingOverlay from '../components/LoadingOverlay';
import Header from '../components/Header';

function PageLayout({
    leftPanel = <></>,
    rightPanel = <></>,
  }){
  
    const { loadingConfigs, } = useConfig();
    const { loadingUser  } = useAuth();
  
    return (<>  
  
        <LoadingOverlay 
          isLoading={loadingConfigs} 
          isFullscreen={true}
          loadingText={"Loading Configurations..."}/>
  
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
  
            {rightPanel} 
          </div>
  
        </div>
      </>);
  }

  export default PageLayout;
  