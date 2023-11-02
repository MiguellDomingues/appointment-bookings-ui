import {useState, useEffect } from 'react'

import { useAuth } from '../AuthProvider'
import useAPI from '../useAPI'

import {IconList, getIcons} from './IconList'

import {useAppContext} from '../AppContextProvider'

import useIcons from '../hooks/useIcons'

import CircleLoader from "react-spinners/ClipLoader";

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

function LocationList({locations = []}){
  
    const { isStoreOwner } = useAuth();
    
    const { selectedLocationId } = useAppContext()

    const {
        selectedIcons,
        toggleIcon,
        getDisabledIconsForLocations,
        filterLocationsBySelectedIcons,
    } = useIcons();
  
    const filteredLocations = filterLocationsBySelectedIcons(locations,selectedIcons);
    const disabledIcons = getDisabledIconsForLocations(filteredLocations);

    return(<>

        {<div className="icon_list_container">
            <IconList 
                iconSize={24}
                disabledIcons={disabledIcons}
                icons={getIcons()}
                selectedIcons={selectedIcons}
                toggleIcon={toggleIcon}/>
        </div>}


            {filteredLocations.map( (location, idx)=>
                <LocationPanel
                    key={idx}
                    isLocationSelected = {location.id === selectedLocationId}
                    startingMode = {LocationPanelState.Card}
                    {...{location,}}/>)}

                {isStoreOwner() ? <>
                    <LocationPanel startingMode = {LocationPanelState.AddButton}/>          
                </> : <></> }

    </>)
}

function LocationPanel({ //a panel encapsulates the different UI states for a location
    location = {},
    isLocationSelected = false,
    startingMode = LocationPanelState.Card,

}){

    const [ mode, setMode ] = useState( startingMode );

    const { id } = location;

    const { selectLocation, } = useAppContext();

    //const _isLocationSelected = isLocationSelected(id)

    const {loading, editLocation, postLocation } = useAPI();

    useEffect(()=>setMode(startingMode), [isLocationSelected]);// selectedLocationId

    function getUI(selectedMode){
        
        switch(selectedMode){
            case LocationPanelState.AddButton:
                return <button onClick={e=>setMode(LocationPanelState.New)}>Add New Location</button>
            case LocationPanelState.New:
                return <>
                    <LocationForm
                        cancelForm={()=>setMode(LocationPanelState.AddButton)}
                        submitForm ={postLocation}
                        form={ locationForm }
                        isFormSubmitting = { loading }
                        LocationFormState = {LocationFormState.New}/>
                </>
            case LocationPanelState.Edit:
               return <>
                    <LocationForm
                        cancelForm={()=>setMode(LocationPanelState.Card)}
                        submitForm ={editLocation}
                        form={ {...location} }
                        isFormSubmitting = { loading }
                        LocationFormState = {LocationFormState.Edit}
                        currentIcons={location.icons}/>
                </>
            case LocationPanelState.Card:
                return<> 
                     <LocationCard 
                        {...{location, isLocationSelected, }} //handleManageAppointments
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
    handleSetEdit = () =>{},
}){
    const { isStoreOwner, isUser } = useAuth();  
    const {info, address, id, LatLng, icons} = location

    const {loading, deleteLocation } = useAPI();

    const { handleManageAppointments, refetchLocations} = useAppContext();

    const handleDeleteLocation = (id) => deleteLocation({id}, ()=>refetchLocations())

    const override = {
        opacity: .5,
        borderColor: "black",
    };
    
    return(<>
          { loading ? <div className="container_model">
            <div className="loading_container">
                <CircleLoader
                    color={"#ffffff"}
                    loading={true}
                    cssOverride={override}
                    size={15}
                    aria-label="Loading Spinner"
                    data-testid="loader"/>   
            </div>   
        </div> : <></>}

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
  isFormSubmitting = false
 // LocationFormState = ""
 }){

    const { refetchLocations } = useAppContext();
    const {selectedIcons,toggleIcon} = useIcons(currentIcons);

    const [ formFields, setFormFeilds ] = useState({...form})
    const areFieldsValid = () => formFields.info.trim() && formFields.address.trim() && selectedIcons.length > 0

    function handleChange(e){
    setFormFeilds({
        ...formFields,
        [e.target.name]: e.target.value
    })}

    function handleSubmit(e){
        e.preventDefault();
        //console.log(formFields, selectedIcons);
        const submitObject = {...formFields, icons: [...selectedIcons]}
        submitForm (
            { submitObject }, 
            ()=>{
                refetchLocations()
                cancelForm()
        })
    }   

    const override = {
        opacity: .5,
        borderColor: "black",
    };

    return(<>

       { isFormSubmitting ? <div className="container_model">
            <div className="loading_container">
                <CircleLoader
                    color={"#ffffff"}
                    loading={true}
                    cssOverride={override}
                    size={15}
                    aria-label="Loading Spinner"
                    data-testid="loader"/>   
            </div>   
        </div> : <></>}

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
