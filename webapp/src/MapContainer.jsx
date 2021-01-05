import React, { Component } from 'react';
import { Map, GoogleApiWrapper, InfoWindow, Marker, Circle } from 'google-maps-react';

const mapStyles = {
    width: '100%',
    height: '100%',
    position: 'relative'
};

export class MapContainer extends Component {

    state = {
        showingInfoWindow: false,  // Hides or shows the InfoWindow
        activeMarker: {},          // Shows the active marker upon click
        selectedPlace: {}          // Shows the InfoWindow to the selected place upon a marker
    };

    onMarkerClick = (props, marker, e) => {
        this.setState({
            selectedPlace: props,
            activeMarker: marker,
            showingInfoWindow: true
        });
    };

    onClose = props => {
        if (this.state.showingInfoWindow) {
            this.setState({
                showingInfoWindow: false,
                activeMarker: null
            });
        }
    };

    render() {
        const { view, currentLatitude, currentLongitude, addViewLatitude, addViewLongitude, searchViewLatitude, searchViewLongitude, 
                selectingFromMap, distance, data, enableMapCentering } = this.props;
        const { onMarkerClick } = this;

        return (
            <Map
                google={this.props.google}
                zoom={14}
                style={mapStyles}
                initialCenter={
                    {
                        lat: currentLatitude,
                        lng: currentLongitude
                    }
                }
                center={(!selectingFromMap && enableMapCentering) ? { lat: currentLatitude, lng: currentLongitude } : undefined}

                // If parent state is "selectingFromMap === True" then on click run the function to select coords
                onClick={selectingFromMap ? this.props.onMapClick: null}
            >

                { // RENDER MARKERS
                    (view === 'add') ?
                        <Marker
                            position={{
                                lat: addViewLatitude, lng: addViewLongitude
                            }}
                            style={{color: 'blue'}}
                            onClick={onMarkerClick}
                            name={'NEW LOCATION'}
                        />
                        :
                        (view === 'search') ?
                            <Marker
                                position={{
                                    lat: searchViewLatitude, lng: searchViewLongitude
                                }}
                                style={{color: 'red'}}
                                onClick={onMarkerClick}
                                name={'YOUR LOCATION'}
                            />
                            :
                            (view === 'results') ?
                                data.map((locations, i) =>
                                    <Marker
                                        key={i}
                                        position={{
                                            lat: locations.latitude, lng: locations.longitude
                                        }}
                                        onClick={onMarkerClick}
                                        name={locations.location}
                                        type={locations.type}
                                        description={locations.description}
                                        rating={locations.rating}
                                    />)
                                :
                                null
                }
                { // RENDER CIRCLES
                    (view === 'search' && !selectingFromMap && searchViewLatitude != null) ?
                    <Circle
                        center={{
                            lat: searchViewLatitude, lng: searchViewLongitude
                        }}
                        radius={distance}
                        options={{ strokeColor: "#ff0000"}}
                    />
                    :
                    null
                }
                <InfoWindow
                    marker={this.state.activeMarker}
                    visible={this.state.showingInfoWindow}
                    onClose={this.onClose}
                >
                    <div style={{wordWrap: "break-word", minWidth: "10em", maxWidth: "20em"}}>
                        <h1 style={{fontSize: "150%", fontWeight: "bold", paddingBottom: "3%", borderBottom: "1px solid black", margin: "0"}}>
                            {this.state.selectedPlace.name}
                        </h1>
                        {(view === 'results') ?
                        <React.Fragment>
                            <p style={{margin: "2%", marginTop: "5%"}}><b>Type:</b>&nbsp;{this.state.selectedPlace.type}</p>
                            <p style={{margin: "2%"}}><b>Rating:</b>&nbsp;{this.state.selectedPlace.rating}</p>
                            <p style={{maxHeight: "5em", margin: "2%"}}><b>Description:</b>&nbsp;{this.state.selectedPlace.description}</p>
                        </React.Fragment>
                        :null
                        }
                    </div>
                </InfoWindow>
            </Map>
        );
    }
}
  
export default GoogleApiWrapper({
    apiKey: ''
})(MapContainer);
