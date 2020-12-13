import React, { useState } from 'react';
import { IoTrashOutline } from 'react-icons/io5';

const ResultsDisplay = ({data, handleLocationSelection, enableMapCentering, handleCheckboxChange, selectedLocation, showPopUp}) => {
    const [hover, setHover] = useState(null);

    return (
        <React.Fragment>
            <div id="results-display">
                <p>{(data.length === 1) ? '1 result found' : data.length + ' results found'}</p>
                <table id="results-table">
                    <thead id="results-header">
                        <tr>
                            <th className="col-1">Location</th>
                            <th className="col-2">Distance</th>
                        </tr>
                    </thead>
                    <tbody id="results-body">
                    {
                        data.map((locations, i) =>
                            <tr key={i} 
                                onClick={() => handleLocationSelection(locations)}
                                onMouseEnter={() => setHover(i)}
                                onMouseLeave={() => setHover(null)}
                            >
                                <td className="col-1">{locations.location}</td>
                                <td className="col-2">{(hover === i) ? '...' : locations.distance+' km' }</td>
                                {
                                    (selectedLocation === locations.location_id) ?
                                        <td id="selected-entry" style={{wordWrap: "break-word", maxWidth: "100%", cursor: "pointer"}}>
                                            <p><b>Type:</b>&nbsp;{locations.type}</p>
                                            <p><b>Rating:</b>&nbsp;{locations.rating}</p>
                                            <p><b>Description:</b>&nbsp;{locations.description}</p>
                                            <span style={{display: "flex", alignItems: "center", marginBottom: "1%"}}>
                                                <p className="col-1" style={{fontSize: "70%", color: "#2c2c2c", marginTop: "2%", marginBottom: "0"}}>Added&nbsp;{locations.added}</p>
                                                <button className="col-2 delete-btn" style={{width: "20%", float: "right"}}
                                                        onClick={e => showPopUp(true, e)}>
                                                    <IoTrashOutline size={20} color={"#ffffff"}/>
                                                </button>
                                            </span>
                                        </td>
                                    :
                                    null
                                }
                            </tr>)
                    }
                    </tbody>
                </table>
                <div id="options">
                    <label htmlFor="options" style={{paddingLeft: "2%"}}>Enable map centering</label>
                    <input type="checkbox"
                        id="map-center-option-checkbox"
                        name="map-center-option-checkbox"
                        defaultChecked={enableMapCentering}
                        onChange={(e) => handleCheckboxChange(e)}
                    />
                </div>
            </div>
        </React.Fragment>
    );
};

export default ResultsDisplay;