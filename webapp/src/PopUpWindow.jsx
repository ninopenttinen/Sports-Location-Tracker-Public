import React from 'react';

export const PopUpWindow = ({ showPopUp, handleDelete, selectedLocationName }) => {
    return (
        <React.Fragment>
            <div id="pop-up-window-background">
                <div id="pop-up-window">
                    <p>Delete location "{selectedLocationName}" ?</p>
                    <div id="pop-up-buttons">
                        <button id="pop-up-btn" onClick={()=>showPopUp(false)}>Cancel</button>
                        <button id="pop-up-delete-btn" onClick={()=>handleDelete()}>Confirm</button>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}

export default PopUpWindow;