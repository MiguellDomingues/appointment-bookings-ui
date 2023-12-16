
import '../styles.css';

function ModalWrapper({isOpen = false, close = ()=>{}, children}){

    if(isOpen){
         return(<>
             <div className='fullscreen_overlay'>
                 <div className='modal_container'>
                     <div className='close_wrapper'>
                         <div onClick={close} className="cancel_panel_btn">X</div>           
                         {children}
                     </div>
                 </div>  
             </div>
         </>)
    }
 
    return (<></>);
 }

 export default ModalWrapper;