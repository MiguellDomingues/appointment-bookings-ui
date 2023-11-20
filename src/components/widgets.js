import '../styles.css';

export const ActionButton = ({handler, text, disabled}) => <><button disabled={disabled} onClick={handler}>{text}</button></>

export const SelectableItemsList = ({items, selectedItems, handleItemClick, selectedClassName}) =>
    <>{items.map(item=>
        <span key={item}
            className={selectedItems.includes(item) ? selectedClassName : ""} 
            onClick={()=>handleItemClick(item)}>
            {item}{" "}
        </span>)}
    </>
