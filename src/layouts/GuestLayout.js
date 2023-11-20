import { useConfig,} from '../AuthProvider'
import {useState, useEffect, } from 'react'

import MyMap from '../components/Map.tsx'
import PageLayout from '../layouts/PageLayout';
import {BodyPanel, BodyPanelState } from '../components/BodyPanel'

import useIcons from '../hooks/useIcons'
import useLocationMap from '../hooks/useLocationMap';
import useAPI from '../useAPI'

import {useAppContext } from '../AppContextProvider'

import '../styles.css';

const PageState = Object.freeze({
  Map: "Map",
  Calendar: "Calendar"
});

function GuestLayout({
  startingMode = PageState.Map
}){

    const { config } = useConfig();

    const {fetchGuestLocations, loading } = useAPI();

    const [data, setData] = useState([]);

    const {selectedIcons,toggleIcon} = useIcons();

    const [ mode, setMode ] = useState(  startingMode );

    const { filteredLocations,selectedLocationId,selectLocation,} = useLocationMap(data, selectedIcons)

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

    return(<>
      <PageLayout leftPanel={leftPanel} rightPanel={rightPanel}/>
    </>)
  }

export default GuestLayout


