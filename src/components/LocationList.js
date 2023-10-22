import {useState, useEffect } from 'react'

import { useAuth } from '../AuthProvider'
import useAPI from '../useAPI'

import '../styles.css';

function LocationList({
    locations = [], 
    selectedLocationId = null, 
    selectLocation = ()=>{}, 
    refetchLocations = ()=>{} }){
  
    const { isStoreOwner } = useAuth();  
  
    const [showNewLocationForm, setShowNewLocationForm] = useState(false);
  
    const {loading,deleteLocation, editLocation, postLocation  } = useAPI()
  
  
    useEffect(()=>setShowNewLocationForm(false), [locations])
  
    function addLocation(new_location){
      postLocation({new_location},(result)=>{refetchLocations()})
    }
  
    function _deleteLocation(location_id){
        deleteLocation({location_id},(result)=>{refetchLocations()})  
    }
  
    function _editStoreOwnerLocation(location){
        editLocation({location},(result)=>{refetchLocations()})
    }
  
  //console.log(locations)
    return(<>
      {locations ? locations.map( (location, idx)=>
          <LocationCard key={idx} location={location}//{...location} 
            selectedLocationId={selectedLocationId} 
            selectLocation={selectLocation}
            deleteLocation={_deleteLocation}
            editStoreOwnerLocation={_editStoreOwnerLocation}/>) 
        : <></>}
  
       
        {isStoreOwner() ? 
          (showNewLocationForm ? 
            <div className="location_card">
              <LocationForm 
                cancelLocationForm={e=>setShowNewLocationForm(false)} 
                putStoreOwnerLocation={addLocation}/> 
            </div> : 
            <button onClick={e=>setShowNewLocationForm(true)}>Add New Location</button>)
        : <></>}
  
    </>)
  }
  
  
  function LocationCard({
   // info, address, id, LatLng, 
    location,
    selectedLocationId, 
    selectLocation=()=>{}, 
    deleteLocation=()=>{}, 
    editStoreOwnerLocation=()=>{}}){
  
    const { isStoreOwner } = useAuth();  
  
    const [isEdit, setIsEdit] = useState(false);
  
    useEffect(()=>setIsEdit(false), [location, selectedLocationId])
  
    const {info, address, id, LatLng, } = location
  
    const isLocationSelected = ()=> id===selectedLocationId
  
    return( 
      <div className={id===selectedLocationId ? "location_card location_card_selected" : "location_card"  } 
          onClick={ e=>{ selectLocation(id)}}>
          
  
      { isEdit ? <>
        <LocationForm 
          cancelLocationForm={e=>setIsEdit(false)} 
          putStoreOwnerLocation={editStoreOwnerLocation}
          form={ {...location} }/></> 
      :
      <>
        {isStoreOwner() && isLocationSelected() ? 
          <div className="location_card_btns"> 
            <button onClick={e=>deleteLocation(id)} className="">Delete Location</button>
            <button onClick={e=>{setIsEdit(true)}} className="">Edit Location</button>
          </div>
       : <></>}
  
          <div>info: {info}</div>
          <div>address: {address}</div> 
        </>}
    </div>);
  }

const locationForm =  {address: "", info: ""}

function LocationForm({
  cancelLocationForm = ()=>{} , 
  putStoreOwnerLocation = ()=>{},
  form = locationForm
 }){

  const [ formFields, setFormFeilds ] = useState(form)
  const areFieldsValid = () => formFields.info.trim() && formFields.address.trim() 

  function handleChange(e){
    setFormFeilds({
      ...formFields,
      [e.target.name]: e.target.value
    })
  }

  function handleSubmit(e){
    e.preventDefault();
    console.log(formFields);
    putStoreOwnerLocation({...formFields, icons: []}); //ignore the icons for now
  }

  return(<>

     <form onSubmit={handleSubmit}>
      <button onClick={cancelLocationForm} className="cancel_new_appointment_btn">X</button>
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