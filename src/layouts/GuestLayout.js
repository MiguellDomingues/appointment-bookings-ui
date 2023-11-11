import { useAuth,useConfig,} from '../AuthProvider'
import {useState, useEffect, useMemo } from 'react'

import MyMap from '../components/Map.tsx'

import LoadingOverlay from '../components/LoadingOverlay'
import Header from '../components/Header'
import {BodyPanel, BodyPanelState } from '../components/BodyPanel'

import useIcons from '../hooks/useIcons'
import useLocations from '../hooks/useLocations'

import {useAppContext } from '../AppContextProvider'

import useAPI from '../useAPI'
import '../styles.css';

const PageState = Object.freeze({
  Map: "Map",
  Calendar: "Calendar"
});


function GuestLayout({
  startingMode = PageState.Map
}){

    const { config, loadingConfigs, } = useConfig();
    const { token, loadingUser  } = useAuth();

    const {fetchGuestLocations, loading } = useAPI();

    const [data, setData] = useState([]);

    const {selectedIcons,toggleIcon} = useIcons();

    //const [loading, setLoading] = useState(false);
    const [ mode, setMode ] = useState(  startingMode );
     /* track the id of the selected entity to update map/list*/
   // const [selectedLocationId, setSelectedLocation] = useState(null);

   const {filteredLocations, selectedLocationId, selectLocation} =  useLocations(data, selectedIcons)

   
  useEffect( () => getData(), [config]);

  const context = useAppContext();

  context.refetchLocations = () => getData()
  context.selectedLocationId = selectedLocationId
  context.selectLocation = selectLocation
  context.selectedIcons =  selectedIcons
  context.toggleIcon =  toggleIcon

    function getData(){
      fetchGuestLocations({},(results)=>{
        setData([...results.posts]);
      })
    }


    function getPageUI(selectedMode){
      
      switch(selectedMode){
          case PageState.Map:{
            return {
              leftPanel:<>
                <MyMap 
                  posts={filteredLocations} 
                  selected={selectedLocationId} 
                  handleSelectedLocation={selectLocation} /> 
              </>,
              rightPanel: <>
                  <BodyPanel 
                    startingMode={BodyPanelState.Location}
                    filteredLocations={filteredLocations}
                    loading={loading}/>
              </>} 
          }   
          default: return <></>
      }
    }

    const { leftPanel, rightPanel } = getPageUI(mode)

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
          <Header 
            refetchLocations={getData} 
            refetching={loading} 
            handleSetMapPage={()=>setMode(PageState.Map)}/>

          {rightPanel} 
        </div>

      </div>
    </>);
  }

export default GuestLayout


