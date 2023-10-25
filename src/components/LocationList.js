import {useState, useEffect } from 'react'

import { useAuth } from '../AuthProvider'
import useAPI from '../useAPI'

import {IconList, getIcons} from './IconList'

import '../styles.css';

const LocationFormState = Object.freeze({
    Edit: "Edit",
    New: "New",
});

const LocationPanelState = Object.freeze({
    Data: "Data",
    Edit: "Edit",
    New: "New",
    AddButton: "AddButton"
});


const locationForm =  {address: "", info: "", icons: []}

function LocationList({
    locations = [], 
    selectedLocationId = null, 
    selectLocation = ()=>{}, 
    refetchLocations = ()=>{} 
}){
  
    const { isStoreOwner } = useAuth();  

    const {loading, deleteLocation, editLocation, postLocation  } = useAPI()
  
    function addLocation(new_location){
      postLocation({new_location},(result)=>{refetchLocations()})
    }
  
    function _deleteLocation(location_id){
        deleteLocation({location_id},(result)=>{refetchLocations()})  
    }
  
    function _editStoreOwnerLocation(location){
        editLocation({location},(result)=>{refetchLocations()})
    }

    return(<>
      {locations ? locations.map( (location, idx)=>
          <LocationPanel
            key={idx}
            isLocationSelected = {location.id === selectedLocationId}
            startingMode = {LocationPanelState.Data}
            {...{location,selectLocation,_deleteLocation, _editStoreOwnerLocation}}/>) 
        : <></>}

        {isStoreOwner() ? <>
            <LocationPanel   
                {...{_deleteLocation,_editStoreOwnerLocation}}
                putStoreOwnerLocation={addLocation}
                selectedLocationId={selectedLocationId}
                startingMode = {LocationPanelState.AddButton}/>
        </> : <></> }
    </>)
}

function LocationPanel({ //a panel encapsulates the different states of a location card
    location = {},
    isLocationSelected = false,
    selectLocation=()=>{}, 
    putStoreOwnerLocation = ()=>{},
    _deleteLocation=()=>{}, 
    _editStoreOwnerLocation=()=>{},
    startingMode = LocationPanelState.Data,
    selectedLocationId
}){

    const { isStoreOwner } = useAuth();  

    const [ mode, setMode ] = useState( startingMode )

    useEffect(()=>setMode(startingMode), [isLocationSelected, selectedLocationId])

    const {info, address, id, LatLng, } = location

    function getUI(selectedMode){
        
        switch(selectedMode){
            case LocationPanelState.AddButton:
                return <button onClick={e=>setMode(LocationPanelState.New)}>Add New Location</button>
            case LocationPanelState.New:
                return <>
                    <LocationForm
                        cancelForm={()=>setMode(LocationPanelState.AddButton)}
                        submitForm ={putStoreOwnerLocation}
                        form={ locationForm  }
                        LocationFormState = {LocationFormState.New}/>
                </>
            case LocationPanelState.Edit:
               return <>
                    <LocationForm
                        cancelForm={()=>setMode(LocationPanelState.Data)}
                        submitForm ={_editStoreOwnerLocation}
                        form={ {...location} }
                        LocationFormState = {LocationFormState.Edit}
                        currentIcons={location.icons}/>
                </>
            case LocationPanelState.Data:
                return<> 
                    <div className="icon_list_container">
                        <IconList icons={location.icons}/>
                    </div>
                    <div>info: {info}</div>
                    <div>address: {address}</div>
                    {isStoreOwner() && isLocationSelected ? 
                        <div className="location_card_btns"> 
                             <button onClick={e=>_deleteLocation(id)} className="">Delete</button>
                             <button onClick={e=>{setMode(LocationPanelState.Edit)}} className="">Edit</button>
                        </div> : <></>}
                </>;
            default: return <></>
        }
    }

    return(
        <div className={isLocationSelected ? "location_card location_card_selected" : "location_card" } onClick={ e=>{ selectLocation(id)}}>
            {getUI(mode)}
        </div>
    );
}

function LocationForm({
  cancelForm = ()=>{} , 
  submitForm = ()=>{},
  form = locationForm,
  currentIcons = [],
 // LocationFormState = ""
 }){

    const [selectedIcons, setSelectedIcons] = useState(currentIcons);

    function toggleIcon(icon_key = ""){

        console.log(icon_key)
        if(!getIcons().includes(icon_key)){
          return
        }
       
        if(selectedIcons.includes(icon_key)){
         // setSelectedIcons(...selectedIcons.filter(icon=>icon !== icon_key) )
          setSelectedIcons( (selectedIcons)=>selectedIcons.filter(icon=>icon !== icon_key) )
        }else{
         // setSelectedIcons([...selectedIcons, icon_key])
          setSelectedIcons( (selectedIcons)=>[...selectedIcons, icon_key] )
        }
      }

    const [ formFields, setFormFeilds ] = useState({...form})
    const areFieldsValid = () => formFields.info.trim() && formFields.address.trim() && selectedIcons.length > 0

    function handleChange(e){
    setFormFeilds({
        ...formFields,
        [e.target.name]: e.target.value
    })}

    function handleSubmit(e){
        e.preventDefault();
        console.log(formFields, selectedIcons);
        submitForm ({...formFields, icons: [...selectedIcons]});
        cancelForm();
    }   

    return(<>
        <div className="icon_list_container">
            <IconList 
            iconSize={20}
            icons={getIcons()}
            selectedIcons={selectedIcons }
            toggleIcon={toggleIcon}/>
        </div>

        <form onSubmit={handleSubmit}>
            <button onClick={cancelForm} className="cancel_new_appointment_btn">X</button>
            <div className="form_row">
            address: <input name="address" value={formFields.address.trim()} className="appointment_form_input" onChange={handleChange} required /> 
            </div>
            <div className="form_row">
            info:  <input name="info" value={formFields.info.trim()} className="appointment_form_input" onChange={handleChange} required />  
            </div>
            <input type="submit" value="Confirm" disabled={!areFieldsValid()}/>
        </form> 
    </>)
}

export default LocationList
