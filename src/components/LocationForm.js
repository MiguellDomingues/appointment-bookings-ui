
import {useState } from 'react'

import IconList from './IconList'
import {useIcons,getIcons} from '../hooks/useIcons'

import '../styles.css';

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

//storeowners ONLY
//path: STOREOWNER/HOME/EDIT_LOCATION
function LocationForm({
    cancelForm = ()=>{} , //navigate to /STOREOWNER/HOME
    submitForm = ()=>{}, //trigger editLocation API, on success, navigate to HOME

    fetchMapInfo = ()=>{}, //fetch gmaps API geocords for addy/postalcode/city/country/province ->load over the map -> store previous geocoords/update the locations geocoords
    cancelMapPreview = ()=>{}, //get previous stored coords, put back into location
    isMapPreviewing = false,
   
    form = locationForm, //pass this object from parent when new storeowner is creating location for first time
    currentIcons = [], //the locations current services

   }){
  
      const {selectedIcons,toggleIcon} = useIcons(currentIcons);

      const [ formFields, setFormFeilds ] = useState({...form})

      const areFieldsInvalid = () => !(formFields.info.trim() && formFields.address.trim() && selectedIcons.length > 0)
  

      
  
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
          <button onClick={e=>handleCheckMap()}>Map Preview</button>
      </>)
  }

  export default LocationForm;
  