import IconList from './IconList'

import '../styles.css';

function LocationCard({
    location = {},
    isLocationSelected = false,
    buttons = []
  }){

    const {info, address, id, LatLng, icons, city, email, phone, postal_code, province, title, country} = location
  
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

        { isLocationSelected ? <div className="location_card_btns">  
            {buttons.map((btn_data, idx)=><button key={idx} onClick={btn_data.handler}>{btn_data.text}</button>)}
        </div>:<></>}

    </>);
  }

  export default LocationCard;