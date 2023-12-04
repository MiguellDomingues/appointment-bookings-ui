
import { useAuth } from '../AuthProvider'
import {IconList, } from './IconList'
import {useAppContext} from '../AppContextProvider'

import '../styles.css';

function LocationCard({
    location = {},
    isLocationSelected,
    handleSetEdit = () =>{},
  }){
    const { isStoreOwner, isUser } = useAuth();  
    const {info, address, id, LatLng, icons, appointments, city, email, phone, postal_code, province, title, country} = location
  
    const { handleManageAppointments } = useAppContext();
  
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
                        <button onClick={handleSetEdit} className="">Edit</button>              
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

  export default LocationCard;