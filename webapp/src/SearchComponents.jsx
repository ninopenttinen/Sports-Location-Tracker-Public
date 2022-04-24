import React, { Component } from 'react'
import { IoWarning, IoAlertCircle, IoTime } from 'react-icons/io5'
const axios = require('axios')

export class SearchMenu extends Component {
  state = {
    searchType: '',
    searchDistanceKm: '',
    searchDistanceM: '',
    error: {
      searchTypeError: false,
      searchCoordinateError: false,
      searchDistanceError: false,
    },
    statusMsg: '',
    loading: false,
  }

  // Handle the input value changes when user types into type or distance fields
  handleValueChange = (event, key) => {
    this.setState({ [key]: event.target.value }, () => this.validate(key)) // callback to validate the input, if the input doesn't comply with the set rules
  } // non disruptive error will be shown on screen.

  validate = (key) => {
    const { searchType, searchDistanceKm, searchDistanceM, error } = this.state

    if (key === 'searchType')
      if (
        searchType.length > 50 ||
        !searchType.match('^$|^[A-Za-z0-9-äöåÄÖÅ ]+$')
      )
        this.setState({ error: { ...error, searchTypeError: true } })
      else this.setState({ error: { ...error, searchTypeError: false } })

    if (key === 'searchDistanceKm' || key === 'searchDistanceM')
      if (
        searchDistanceKm.length === 0 ||
        searchDistanceM.length === 0 ||
        !searchDistanceKm.match('^$|^[0-9]+$') ||
        !searchDistanceM.match('^$|^[0-9]+$')
      )
        this.setState({ error: { ...error, searchDistanceError: true } }, () =>
          this.props.setDistance('0', '0')
        )
      else
        this.setState({ error: { ...error, searchDistanceError: false } }, () =>
          this.props.setDistance(searchDistanceKm, searchDistanceM)
        )
  }

  // Allows user to set coordinates by calling a parent function that activates map selection
  handleSetCoordinates = (select) => {
    const { startMapSelection, setSearchCoordinatesToCurrent } = this.props
    const setState = this.setState.bind(this)
    const { error } = this.state

    if (select === 'from_map') {
      startMapSelection()
      setState({
        error: { ...this.state.error, searchCoordinateError: false },
      })
    }
    // Check if the device and browser have the geolocation support
    else if (navigator.geolocation) {
      navigator.permissions &&
        navigator.permissions
          .query({ name: 'geolocation' })
          .then(function (PermissionStatus) {
            // Check if the permission to use device location has been granted
            if (PermissionStatus.state === 'granted') {
              setSearchCoordinatesToCurrent()
              setState({ error: { ...error, searchCoordinateError: false } })
            } else setState({ statusMsg: 3 })
          })
    } else setState({ statusMsg: 4 })
  }

  // Reset all states in this component and call parent function to reset coordinates
  handleReset = () => {
    this.props.resetCoordinates()
    this.props.resetDistance()

    this.setState({
      searchType: '',
      searchDistanceKm: '',
      searchDistanceM: '',
      statusMsg: '',
      error: {
        searchTypeError: false,
        searchCoordinateError: false,
        searchDistanceError: false,
      },
    })
  }

  // Handles sending the search request to server
  handleSearch = () => {
    const { searchType, searchDistanceKm, searchDistanceM } = this.state
    const { latitude, longitude, saveResults } = this.props
    let setTypeError, setDistanceError, setCoordinateError

    if (
      searchType.length > 50 ||
      !searchType.match('^$|^[A-Za-z0-9-äöåÄÖÅ() ]+$')
    )
      setTypeError = true
    else setTypeError = false

    if (
      searchDistanceKm.length === 0 ||
      !searchDistanceKm.match('^$|^[0-9]+$') ||
      searchDistanceM.length === 0 ||
      !searchDistanceM.match('^$|^[0-9]+$')
    )
      setDistanceError = true
    else setDistanceError = false

    if (latitude === null || longitude === null) setCoordinateError = true
    else setCoordinateError = false

    this.setState({
      error: {
        ...this.state.error,
        searchTypeError: setTypeError,
        searchDistanceError: setDistanceError,
        searchCoordinateError: setCoordinateError,
      },
    })

    // Check all the error states
    if (setTypeError || setDistanceError || setCoordinateError)
      this.setState({ statusMsg: 1 })
    else
      this.setState(
        {
          loading: true,
          statusMsg: 2, // Set status message to 2 - which means "searching the database"
        },
        () => {
          axios
            .get(
              `/stg/sports-location-tracker/api/locations?type=${searchType}&latitude=${latitude}&longitude=${longitude}&distance=${
                parseInt(searchDistanceKm) * 1000 + parseInt(searchDistanceM)
              }`
            )
            .then((res) => {
              this.setState(
                {
                  loading: false,
                  statusMsg: '',
                },
                () => saveResults(res.data)
              ) // callback to parent component to save the results to its state, so they can be used in other views
            })
            .catch((err) => {
              console.log(err)
              this.setState({
                loading: false,
                statusMsg: `${err.response.data}`, // Display the error response (that has been set on the server code) as the status message
              })
            })
        }
      )
  }

  render() {
    const {
      searchType,
      searchDistanceKm,
      searchDistanceM,
      statusMsg,
      loading,
    } = this.state
    const {
      latitude,
      longitude,
      selectingFromMap,
      enableMapCentering,
      handleCheckboxChange,
    } = this.props
    const { searchTypeError, searchCoordinateError, searchDistanceError } =
      this.state.error
    const {
      handleValueChange,
      handleSetCoordinates,
      handleReset,
      handleSearch,
    } = this

    return (
      <React.Fragment>
        <div id="search-menu">
          <div id="input-fields">
            <section>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label htmlFor="search-type">Type</label>
                {searchTypeError ? (
                  <IoWarning size={20} color={'#ff5d5d'} />
                ) : null}
              </div>
              <input
                id="search-type"
                className={searchTypeError ? 'inputFieldError' : ''}
                type="text"
                autoComplete="off"
                spellCheck="false"
                placeholder="Leave empty to search all locations"
                value={searchType}
                onChange={(event) => handleValueChange(event, 'searchType')}
              />
            </section>

            <section>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label htmlFor="search-coordinates-btn-group">
                  Your location
                </label>
                {searchCoordinateError ? (
                  <IoWarning size={20} color={'#ff5d5d'} />
                ) : null}
              </div>
              <span
                id="search-coordinates-btn-group"
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <button
                  id={
                    selectingFromMap
                      ? 'search-coordinates-left-active'
                      : 'search-coordinates-left'
                  }
                  onClick={() => handleSetCoordinates('from_map')}
                >
                  {selectingFromMap ? 'Cancel' : 'Select from map'}
                </button>
                <button
                  id="search-coordinates-right"
                  onClick={handleSetCoordinates}
                >
                  Use current
                </button>
              </span>
              <p id="lat" style={{ paddingLeft: '1%', marginBottom: '2%' }}>
                Lat:&nbsp;{latitude}
              </p>
              <p id="lon" style={{ paddingLeft: '1%', marginTop: '0' }}>
                Lng:&nbsp;{longitude}
              </p>
            </section>

            <section>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label htmlFor="search-distance">Search distance</label>
                {searchDistanceError ? (
                  <IoWarning size={20} color={'#ff5d5d'} />
                ) : null}
              </div>
              <span
                id="search-distance"
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <input
                  id="search-distance-left"
                  className={searchDistanceError ? 'search-distance-error' : ''}
                  type="text"
                  autoComplete="off"
                  spellCheck="false"
                  value={searchDistanceKm}
                  onChange={(event) =>
                    handleValueChange(event, 'searchDistanceKm')
                  }
                />
                <p>km&nbsp;</p>
                <input
                  id="search-distance-right"
                  className={searchDistanceError ? 'search-distance-error' : ''}
                  type="text"
                  autoComplete="off"
                  spellCheck="false"
                  value={searchDistanceM}
                  onChange={(event) =>
                    handleValueChange(event, 'searchDistanceM')
                  }
                />
                <p>m</p>
              </span>
            </section>
          </div>

          <div id="messages">
            <section>
              <div className="status-msg">
                {statusMsg === 1 ? (
                  <p className="error-msg">
                    <IoAlertCircle size={18} />
                    &nbsp;Please fill the required fields and try again
                  </p>
                ) : statusMsg === 2 ? (
                  <p className="loading-msg">
                    <IoTime size={18} />
                    &nbsp;Searching the database...
                  </p>
                ) : statusMsg === 3 ? (
                  <p className="error-msg">
                    Permission to use device geolocation has not been granted
                  </p>
                ) : statusMsg === 4 ? (
                  <p className="error-msg">
                    This feature is not supported by your browser
                  </p>
                ) : (
                  <p className="error-msg">{statusMsg}</p>
                )}
              </div>
            </section>
          </div>

          <div id="execute-buttons">
            <section>
              <span>
                <button className="reset-btn" onClick={handleReset}>
                  Reset
                </button>
                <button className="submit-btn" onClick={handleSearch}>
                  Search
                </button>
              </span>
            </section>
          </div>

          <div id="options">
            <label htmlFor="options">Enable map centering</label>
            <input
              type="checkbox"
              id="map-center-option-checkbox"
              name="map-center-option-checkbox"
              defaultChecked={enableMapCentering}
              onChange={(e) => handleCheckboxChange(e)}
            />
          </div>
        </div>
        {loading ? <div id="wait-layer"></div> : null}
      </React.Fragment>
    )
  }
}

export default SearchMenu
