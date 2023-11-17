import '../styles.css';

export const ActionButton = ({handler, text}) => <><button onClick={handler}>{text}</button></>

export const SelectableItemsList = ({items, selectedItems, handleItemClick, selectedClassName}) =>
    <>{items.map(item=>
        <span key={item}
            className={selectedItems.includes(item) ? selectedClassName : ""} 
            onClick={()=>handleItemClick(item)}>
            {item}{" "}
        </span>)}
    </>
