import React, { Component } from 'react'
import GoogleApiWrapper from './MapContainer'
import SearchMenu from './SearchComponents'
import AddMenu from './AddComponents'
import ResultsDisplay from './ResultsDisplay'
import PopUpWindow from './PopUpWindow'
const axios = require('axios')

export class App extends Component {
  state = {
    view: 'search',
    selectingFromMap: false,
    currentLatitude: 61.49911,
    currentLongitude: 23.78712,
    addViewLatitude: null,
    addViewLongitude: null,
    searchViewLatitude: null,
    searchViewLongitude: null,
    distance: 0,
    data: [],
    selectedLocation: null,
    selectedLocationName: null,
    enableMapCentering: true,
    loading: false,
    popUp: false,
  }

  constructor(props) {
    super(props)

    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition((position) => {
        this.setState({
          currentLatitude: position.coords.latitude,
          currentLongitude: position.coords.longitude,
        })
      })
  }

  // Changes the view
  handleViewChange = (view) => {
    this.setState({
      view,
      distance: 0,
    })
  }

  // When "selectingFromMap" is "true" the map may be clicked to acquire the coordinates.
  startMapSelection = () => {
    this.setState((state) => ({ selectingFromMap: !state.selectingFromMap }))
  }

  // Set the coordinates when the "selectingFromMap" state is "true" and the map gets clicked.
  onMapClick = (t, map, e) => {
    if (this.state.view === 'add')
      this.setState({
        currentLatitude: e.latLng.lat(),
        currentLongitude: e.latLng.lng(),
        addViewLatitude: e.latLng.lat(),
        addViewLongitude: e.latLng.lng(),
      })
    if (this.state.view === 'search')
      this.setState({
        currentLatitude: e.latLng.lat(),
        currentLongitude: e.latLng.lng(),
        searchViewLatitude: e.latLng.lat(),
        searchViewLongitude: e.latLng.lng(),
      })
    this.startMapSelection()
  }

  // Resets the coordinates
  resetCoordinates = () => {
    if (this.state.view === 'add')
      this.setState({
        addViewLatitude: null,
        addViewLongitude: null,
      })
    if (this.state.view === 'search')
      this.setState({
        searchViewLatitude: null,
        searchViewLongitude: null,
      })
  }

  // This method gets called from the "SearchMenu" component when user clicks "use current" location button.
  // Sets currentLatitude/Longitude and searchViewLatitude/Longitude to the devices coordinates, so that the google maps component
  // may use them to center the map and render the marker.
  setSearchCoordinatesToCurrent = () => {
    navigator?.geolocation.getCurrentPosition((position) => {
      this.setState({
        currentLatitude: position.coords.latitude,
        currentLongitude: position.coords.longitude,
        searchViewLatitude: position.coords.latitude,
        searchViewLongitude: position.coords.longitude,
      })
    })
  }

  // Reset distance
  resetDistance = () => {
    this.setState({ distance: 0 })
  }

  // This method gets called from the "SearchMenu" component.
  // Set the distance for further use.
  setDistance = (km, m) => {
    this.setState({ distance: parseInt(km) * 1000 + parseInt(m) })
  }

  // This method gets called from the "SearchMenu" component as a callback.
  // Saves the data acquired by a get method to state for further use.
  saveResults = (data) => {
    this.setState({ data }, () => {
      this.handleViewChange('results')
    })
  }

  // This method gets called from the "ResultsDisplay" table element.
  // Selects the location that is pressed on the table.
  handleLocationSelection = (location) => {
    if (this.state.selectedLocation !== location.location_id)
      this.setState({
        selectedLocation: location.location_id,
        selectedLocationName: location.location,
        currentLatitude: location.latitude,
        currentLongitude: location.longitude,
      })
    else this.setState({ selectedLocation: null })
  }

  // Set the current position on map so that the marker is in the middle
  focusOnMarker = (latitude, longitude) => {
    this.setState({
      currentLatitude: latitude,
      currentLongitude: longitude,
    })
  }

  // Change the "enableMapCentering" value when the checkbox is pressed
  handleCheckboxChange = (e) => {
    this.setState({ enableMapCentering: e.target.checked })
  }

  // This method gets called from the "PopUpWindow" component when pressing the confirm delete button
  // Send request to server to delete selected location from db
  handleDelete = () => {
    const { data, selectedLocation } = this.state

    this.setState({ loading: true }, () => {
      axios
        .post(`/stg/sports-location-tracker/api/locations/delete`, {
          id: selectedLocation,
        })
        .then((res) =>
          this.setState({
            data: data.filter((data) => selectedLocation !== data.location_id),
            loading: false,
            popUp: false,
          })
        )
        .catch((err) => {
          console.log(err)
          this.setState({
            loading: false,
            popUp: false,
          })
        })
    })
  }

  // This method gets called from the "ResultsDisplay" component when pressing the delete location button
  // Show/hide the pop up window that asks to confirm deletion
  showPopUp = (popUp, e) => {
    e?.stopPropagation()
    this.setState({ popUp })
  }

  render() {
    const {
      view,
      selectingFromMap,
      currentLatitude,
      currentLongitude,
      addViewLatitude,
      addViewLongitude,
      searchViewLatitude,
      searchViewLongitude,
      selectedLocation,
      selectedLocationName,
      distance,
      data,
      enableMapCentering,
      loading,
      popUp,
    } = this.state
    const {
      handleViewChange,
      startMapSelection,
      onMapClick,
      resetCoordinates,
      resetDistance,
      setDistance,
      saveResults,
      setSearchCoordinatesToCurrent,
      handleLocationSelection,
      focusOnMarker,
      handleCheckboxChange,
      handleDelete,
      showPopUp,
    } = this
    let menu
    // Select which component to render depending on what view is selected
    if (view === 'search')
      menu = (
        <SearchMenu
          saveResults={saveResults}
          resetDistance={resetDistance}
          setDistance={setDistance}
          startMapSelection={startMapSelection}
          resetCoordinates={resetCoordinates}
          setSearchCoordinatesToCurrent={setSearchCoordinatesToCurrent}
          handleCheckboxChange={handleCheckboxChange}
          selectingFromMap={selectingFromMap}
          latitude={searchViewLatitude}
          longitude={searchViewLongitude}
          enableMapCentering={enableMapCentering}
        />
      )

    if (view === 'add')
      menu = (
        <AddMenu
          startMapSelection={startMapSelection}
          resetCoordinates={resetCoordinates}
          handleCheckboxChange={handleCheckboxChange}
          selectingFromMap={selectingFromMap}
          latitude={addViewLatitude}
          longitude={addViewLongitude}
          enableMapCentering={enableMapCentering}
        />
      )

    if (view === 'results')
      menu = (
        <ResultsDisplay
          handleLocationSelection={handleLocationSelection}
          handleCheckboxChange={handleCheckboxChange}
          showPopUp={showPopUp}
          data={data}
          enableMapCentering={enableMapCentering}
          selectedLocation={selectedLocation}
        />
      )

    return (
      <React.Fragment>
        <header>
          <button
            className={view === 'search' ? 'active-btn' : ''}
            onClick={() => handleViewChange('search')}
          >
            Search
          </button>
          <button
            className={view === 'results' ? 'active-btn' : ''}
            onClick={() => handleViewChange('results')}
          >
            Results
          </button>
          <button
            className={view === 'add' ? 'active-btn' : ''}
            onClick={() => handleViewChange('add')}
          >
            Add location
          </button>
          <p>Sports Location Tracker</p>
        </header>
        {menu}
        <div id="map-container" style={{ position: 'relative' }}>
          <GoogleApiWrapper
            onMapClick={onMapClick}
            focusOnMarker={focusOnMarker}
            handleLocationSelection={handleLocationSelection}
            enableMapCentering={enableMapCentering}
            currentLatitude={currentLatitude}
            currentLongitude={currentLongitude}
            data={data}
            view={view}
            distance={distance}
            selectingFromMap={selectingFromMap}
            addViewLatitude={addViewLatitude}
            addViewLongitude={addViewLongitude}
            searchViewLatitude={searchViewLatitude}
            searchViewLongitude={searchViewLongitude}
          />
        </div>

        {popUp ? (
          <PopUpWindow
            handleDelete={handleDelete}
            showPopUp={showPopUp}
            selectedLocationName={selectedLocationName}
          />
        ) : null}
        {loading ? <div id="wait-layer"></div> : null}
      </React.Fragment>
    )
  }
}

export default App
