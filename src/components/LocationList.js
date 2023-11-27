import {useState, useEffect } from 'react'

import { useAuth } from '../AuthProvider'

import useAPI from '../useAPI'
import API from '../API'

import {IconList, getIcons} from './IconList'

import {useAppContext} from '../AppContextProvider'

import useIcons from '../hooks/useIcons'

import LoadingOverlay from './LoadingOverlay'

import '../styles.css';

const LocationFormState = Object.freeze({
    Edit: "Edit",
    New: "New",
});

const LocationPanelState = Object.freeze({
    Card: "Card",
    Edit: "Edit",
    New: "New",
    AddButton: "AddButton",
   
});


const locationForm =  {
    address: "", 
    info: "", 
    icons: [],
    title: "",
    province: "",
    country: "",
    city: "",
    phone: "",
    email: "",
    postalCode: "",
}

function LocationList({
    locations = [],
    loading = false
   // selectedLocationId = null
}){
  
    const { isStoreOwner,loadingConfigs,loadingUser } = useAuth();
    
    const { selectedLocationId, selectedIcons,toggleIcon } = useAppContext()

    const { getDisabledIconsForLocations } = useIcons();
  
    const disabledIcons = getDisabledIconsForLocations(locations);

    return(<>
        <div className="body_locations">

            <LoadingOverlay 
                isLoading={loading && !loadingConfigs && !loadingUser} 
                isFullscreen={false}
                loadingText={"Loading Data"}/>

            {!isStoreOwner() ? <>
                <div className="icon_list_container">
                <IconList 
                    iconSize={24}
                    disabledIcons={disabledIcons}
                    icons={getIcons()}
                    selectedIcons={selectedIcons}
                    toggleIcon={toggleIcon}/>
            </div>
            </> : <></>}
            
            {locations.map( (location, idx)=>
                <LocationPanel
                    key={idx}
                    isLocationSelected = {location.id === selectedLocationId}
                    startingMode = {LocationPanelState.Card}
                    {...{location,}}/>)}

        </div>
    </>)
}

function LocationPanel({ //a panel encapsulates the different UI states for a location
    location = {},
    isLocationSelected = false,
    startingMode = LocationPanelState.Card,

}){

    const [ mode, setMode ] = useState( startingMode );

    const { id } = location;

    const { selectLocation, refetchLocations} = useAppContext();

    //const _isLocationSelected = isLocationSelected(id)

    //const {loading, editLocation, postLocation } = useAPI();

    //const {loading, editLocation, } = useAPI(API.editLocation);

    const {
        loading, 
        editLocation,
     } = useAPI(
            API.editLocation, 
            ()=>{
                refetchLocations()
                setMode(LocationPanelState.Card)
            }
        );

    //useEffect(()=>setMode(startingMode), [isLocationSelected]);// selectedLocationId
    function getUI(selectedMode){
        
        switch(selectedMode){
            case LocationPanelState.AddButton:
                return <button onClick={e=>setMode(LocationPanelState.New)}>Add New Location</button>
            case LocationPanelState.New:
                return <>
                    <LocationForm
                        cancelForm={()=>setMode(LocationPanelState.AddButton)}
                        submitForm ={()=>{}}
                        form={ locationForm }
                        isFormSubmitting = { loading }
                        LocationFormState = {LocationFormState.New}/>
                </>
            case LocationPanelState.Edit:
               return <>
                    <LocationForm
                        cancelForm={()=>setMode(LocationPanelState.Card)}
                        submitForm ={editLocation} // title: "", province: "", country: "", city: "", phone: "", email: "", postalCode:""
                        form={ {...location} } //locationForm ...location,
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
    const {info, address, id, LatLng, icons, appointments, city, email, phone, postal_code, province, title, country} = location



    const { handleManageAppointments } = useAppContext();

    //const handleDeleteLocation = (id) => deleteLocation({id}, ()=>refetchLocations())

    //console.log("location: ", location)

    //console.log({info, address, id, LatLng, icons, appointments, city, email, phone, postal_code, province, title, country} )

    return(<>
       
        {<div className="icon_list_container">
            <IconList icons={icons}/>
        </div>}

        <div className="location_title">
            <div className="title">{title}</div>
        </div>

        <div className="form_row card_padding">
            <div>street address</div>
            <div>{address}</div>
        </div>

        <div className="form_row card_padding">
            <div>city</div>
            <div>{city}</div>
        </div>

        <div className="form_row card_padding">
            <div>province</div>
            <div>{province}</div>
        </div>

        <div className="form_row card_padding">
            <div>country</div>
            <div>{country}</div>
        </div>

        <div className="form_row card_padding">
            <div>postal code</div>
            <div>{postal_code}</div>
        </div>

        <div className="form_row card_padding">
            <div>phone</div>
            <div>{phone}</div>
         </div>

        <div className="form_row card_padding">
            <div>email</div>
             <div>{email}</div>
        </div>

        <div className="form_row card_padding">
            <div>info</div>
             <div>{info}</div>
        </div>

        {isLocationSelected ? <> 
                <div className="location_card_btns">  
                    { isStoreOwner() ? <>
                        {/*<button onClick={e=>handleDeleteLocation(id)} className="">Delete</button>*/}
                        <button onClick={handleSetEdit} className="">Edit</button>
                        {/*<button onClick={handleConfigureAvailability} className="">Configure Availability</button>*/}
                        {/*<button onClick={e=>handleManageAppointments()} className="">Manage Appointments</button>*/}
                    </> 
                    : isUser() ? <>
                        <button onClick={e=>handleManageAppointments()} className="">
                            {appointments && appointments.length > 0 ? `Manage Appointments` : `Book Appointment`}
                        </button>
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

    const {viewMapPreview,cancelMapPreview } = useAppContext();
    const {selectedIcons,toggleIcon} = useIcons(currentIcons);
    //const {loading, fetchMapInfo} = useAPI(API.fetchMapInfo);

    const [ formFields, setFormFeilds ] = useState({...form})
    const areFieldsInvalid = () => !(formFields.info.trim() && formFields.address.trim() && selectedIcons.length > 0)

    const {
        loading, 
        fetchMapInfo,
     } = useAPI(
            API.fetchMapInfo, 
            ({ success, results, status})=>{
                console.log(success)
                console.log(results)
                console.log(status)
    
                if(!success || status !== "OK"){
                    throw new Error(" fetchMapInfo API error")          
                }else{
                    viewMapPreview(results[0].geometry.location, formFields.info, formFields.title)
                }
     
            },
            (err)=>{ console.log("error callback map: ", err)}
        );

    //console.log(form)
    

    function handleCancelForm(){
        cancelMapPreview()
        cancelForm()
    }

    async function handleCheckMap(){

        const streetNumber = "7423 King George Blvd"
        const city = "surrey"
        const province = "british columbia"
        const country = "canada"
        const postalCode = "V3W 0R8"

        fetchMapInfo(streetNumber,city,province,country,postalCode)
    }

    function handleChange(e){
    setFormFeilds({
        ...formFields,
        [e.target.name]: e.target.value
    })}

    function handleSubmit(e){
        e.preventDefault();
        console.log("loc form: ",formFields)   
        submitForm ({ ...formFields, icons: [...selectedIcons] })     
    }   

    return(<>
        <LoadingOverlay isLoading={isFormSubmitting} isFullscreen={false}/>

        <div className="icon_list_container">
            <IconList 
                iconSize={20}
                icons={getIcons()}
                selectedIcons={selectedIcons }
                toggleIcon={toggleIcon}/>
        </div>

        <form onSubmit={handleSubmit}>
            <button onClick={handleCancelForm} className="cancel_panel_btn">X</button>

            <div className="form_row card_padding padding_top_edit_location">
                <div>title</div>
                <div>
                    <input name="title" value={formFields.title.trim()} className="appointment_form_input" onChange={handleChange}  />  
                    </div>
            </div>

            <div className="form_row card_padding">
                <div>street address</div>
                <div>
                    <input name="street" value={formFields.address.trim()} className="appointment_form_input" onChange={handleChange}  />  
                </div>
            </div>

            <div className="form_row card_padding">
                <div>city</div>
                <div>
                    <input name="city" value={formFields.city.trim()} className="appointment_form_input" onChange={handleChange}  />  
                </div>
            </div>

            <div className="form_row card_padding">
                <div>province</div>
                <div>
                    <input name="province" value={formFields.province.trim()} className="appointment_form_input" onChange={handleChange} />  
                </div>
            </div>

            <div className="form_row card_padding">
                <div>country</div>
                <div>
                    <input name="country" value={formFields.country.trim()} className="appointment_form_input" onChange={handleChange}  />  
                </div>
            </div>

            <div className="form_row card_padding">
                <div>postalCode</div>
                <div>
                    <input name="postalCode" value={formFields.postal_code.trim()} className="appointment_form_input" onChange={handleChange}  />  
                </div>
            </div>

            <div className="form_row card_padding">
                <div>phone</div>
                <div>
                    <input name="phone" value={formFields.phone.trim()} className="appointment_form_input" onChange={handleChange}  />  
                    </div>
                </div>

            <div className="form_row card_padding">
                <div>email</div>
                    <div>
                    <input name="email" value={formFields.email.trim()} className="appointment_form_input" onChange={handleChange} />  
                    </div>
            </div>

            <div className="form_row card_padding">
                <div>info</div>
                    <div>
                    <textarea 
                    name="info" 
                    type="textarea"  //
                    rows="5" 
                    cols="33"  
                    value={formFields.info.trim()}
                    className="appointment_form_input" onChange={handleChange}/> 
                       
                 
                    </div>
            </div>

            <input type="submit" value="Confirm" disabled={areFieldsInvalid()}/>
            
        </form> 
        <button disabled={loading} onClick={e=>handleCheckMap()}>Map Preview</button>
    </>)
}

export default LocationList
