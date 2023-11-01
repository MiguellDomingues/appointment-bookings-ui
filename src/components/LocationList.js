import {useState, useEffect } from 'react'

import { useAuth } from '../AuthProvider'
import useAPI from '../useAPI'

import {IconList, getIcons} from './IconList'

import useIcons from '../hooks/useIcons'

import '../styles.css';

const LocationFormState = Object.freeze({
    Edit: "Edit",
    New: "New",
});

const LocationPanelState = Object.freeze({
    Card: "Card",
    Edit: "Edit",
    New: "New",
    AddButton: "AddButton"
});


const locationForm =  {address: "", info: "", icons: []}

function LocationList({
    locations = [], 
    selectedLocationId = null, 
    selectLocation = ()=>{}, 
    refetchLocations = ()=>{}, 
    handleManageAppointments = ()=>{}, 
}){
  
    const { isStoreOwner } = useAuth();  

    const {loading, deleteLocation, editLocation, postLocation  } = useAPI();

    const {
        selectedIcons,
        toggleIcon,
        getDisabledIconsForLocations,
        filterLocationsBySelectedIcons,
    } = useIcons();
  
    function _postLocation(new_location){
      postLocation({new_location},(result)=>{refetchLocations()})
    }
  
    function _deleteLocation(location_id){
        deleteLocation({location_id},(result)=>{refetchLocations()})  
    }
  
    function _editLocation(location){
        editLocation({location},(result)=>{refetchLocations()})
    }

    const filteredLocations = filterLocationsBySelectedIcons(locations,selectedIcons);
    const disabledIcons = getDisabledIconsForLocations(locations);

    return(<>

        <div className="icon_list_container">
            <IconList 
                iconSize={24}
                disabledIcons={disabledIcons}
                icons={getIcons()}
                selectedIcons={selectedIcons}
                toggleIcon={toggleIcon}/>
            </div>


      {filteredLocations ? filteredLocations.map( (location, idx)=>
          <LocationPanel
            key={idx}
            isLocationSelected = {location.id === selectedLocationId}
            startingMode = {LocationPanelState.Card}
            {...{location,selectLocation,_deleteLocation, _editLocation, handleManageAppointments}}/>) 
        : <></>}

        {isStoreOwner() ? <>
            <LocationPanel   
                startingMode = {LocationPanelState.AddButton}
                {...{_postLocation}}/>
        </> : <></> }
    </>)
}

function LocationPanel({ //a panel encapsulates the different UI states for a location
    location = {},
    isLocationSelected = false,
    selectLocation=()=>{}, 
    _postLocation = ()=>{},
    _deleteLocation=()=>{}, 
    _editLocation=()=>{},
    handleManageAppointments = ()=>{},
    startingMode = LocationPanelState.Card,
    selectedLocationId = ""
}){

    const [ mode, setMode ] = useState( startingMode );

    useEffect(()=>setMode(startingMode), [isLocationSelected, selectedLocationId]);

    const { id } = location;

    function getUI(selectedMode){
        
        switch(selectedMode){
            case LocationPanelState.AddButton:
                return <button onClick={e=>setMode(LocationPanelState.New)}>Add New Location</button>
            case LocationPanelState.New:
                return <>
                    <LocationForm
                        cancelForm={()=>setMode(LocationPanelState.AddButton)}
                        submitForm ={_postLocation}
                        form={ locationForm  }
                        LocationFormState = {LocationFormState.New}/>
                </>
            case LocationPanelState.Edit:
               return <>
                    <LocationForm
                        cancelForm={()=>setMode(LocationPanelState.Card)}
                        submitForm ={_editLocation}
                        form={ {...location} }
                        LocationFormState = {LocationFormState.Edit}
                        currentIcons={location.icons}/>
                </>
            case LocationPanelState.Card:
                return<> 
                     <LocationCard 
                        {...{location, isLocationSelected, handleManageAppointments}}
                        handleDeleteLocation={id=>_deleteLocation(id)}
                        handleSetEdit={_=>setMode(LocationPanelState.Edit)}/>
                </>;
            default: return <></>
        }
    }

    return(
        <div className={`location_card ${isLocationSelected && `location_card_selected`}`} 
             onClick={ e=>{ selectLocation(id)}}>
                {getUI(mode)}
        </div>
    );
}

function LocationCard({
    location = {},
    isLocationSelected,
    handleDeleteLocation =()=>{},
    handleSetEdit = () =>{},
    handleManageAppointments = () =>{}
}){
    const { isStoreOwner, isUser } = useAuth();  
    const {info, address, id, LatLng, icons} = location

    return(<>
        <div className="icon_list_container">
            <IconList icons={icons}/>
        </div>
        <div>info: {info}</div>
        <div>address: {address}</div>
        {isLocationSelected ? <> 
                <div className="location_card_btns">  
                    { isStoreOwner() ? <>
                        <button onClick={e=>handleDeleteLocation(id)} className="">Delete</button>
                        <button onClick={e=>handleSetEdit()} className="">Edit</button>
                        <button onClick={e=>handleManageAppointments()} className="">Manage Appointments</button>
                    </> 
                    : isUser() ? <>
                        <button onClick={e=>handleManageAppointments()} className="">Manage Appointments</button>
                    </> : <></>}
                </div>
            </>
        : <></>}
    </>);
}

function LocationForm({
  cancelForm = ()=>{} , 
  submitForm = ()=>{},
  form = locationForm,
  currentIcons = [],
 // LocationFormState = ""
 }){

    const {selectedIcons,toggleIcon} = useIcons();

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
