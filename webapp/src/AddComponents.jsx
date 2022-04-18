import React, { Component, useState } from 'react'
import { FaStar } from 'react-icons/fa'
import {
  IoWarning,
  IoAlertCircle,
  IoCheckmarkCircle,
  IoTime,
} from 'react-icons/io5'
const axios = require('axios')

export class AddMenu extends Component {
  state = {
    locationName: '',
    locationType: '',
    locationDescription: '',
    locationRating: null,
    error: {
      locationNameError: false,
      locationTypeError: false,
      locationDescriptionError: false,
      locationRatingError: false,
      locationCoordinateError: false,
    },
    statusMsg: '',
    loading: false,
  }

  // Handle the input value changes when user types into name, type or description fields
  handleValueChange = (event, key) => {
    this.setState({ [key]: event.target.value }, () => this.validateInput(key)) // Callback to validate the input
  }

  // Validate input
  validateInput = (key) => {
    const { locationName, locationType, locationDescription, error } =
      this.state

    if (key === 'locationName') {
      if (
        locationName.length === 0 ||
        locationName.length > 50 ||
        !locationName.match('^$|^[A-Za-z0-9-äöåÄÖÅ() ]+$')
      )
        this.setState({ error: { ...error, locationNameError: true } })
      else this.setState({ error: { ...error, locationNameError: false } })
    }
    if (key === 'locationType') {
      if (
        locationType.length === 0 ||
        locationType.length > 50 ||
        !locationType.match('^$|^[A-Za-z0-9-äöåÄÖÅ ]+$')
      )
        this.setState({ error: { ...error, locationTypeError: true } })
      else this.setState({ error: { ...error, locationTypeError: false } })
    }
    if (key === 'locationDescription') {
      if (
        locationDescription.length > 250 ||
        !locationDescription.match('^$|^[A-Za-z0-9-äöåÄÖÅ()/.,!?_ ]+$')
      )
        this.setState({ error: { ...error, locationDescriptionError: true } })
      else
        this.setState({ error: { ...error, locationDescriptionError: false } })
    }
  }

  // Set the star rating
  handleSetRating = (value) => {
    this.setState({ locationRating: value })
    this.setState({
      error: { ...this.state.error, locationRatingError: false },
    })
  }

  // Allows user to set coordinates by calling a parent function that activates map selection
  handleSetCoordinates = () => {
    this.props.startMapSelection()
    this.setState({
      error: { ...this.state.error, locationCoordinateError: false },
    })
  }

  // Reset all states in this component and call parent function to reset coordinates
  handleReset = () => {
    this.props.resetCoordinates()
    this.setState({
      locationName: '',
      locationType: '',
      locationDescription: '',
      locationRating: null,
      statusMsg: '',
      error: {
        ...this.state.error,
        locationNameError: false,
        locationTypeError: false,
        locationDescriptionError: false,
        locationRatingError: false,
        locationCoordinateError: false,
      },
    })
  }

  // Validate data and post to server
  handleSubmit = () => {
    const { locationName, locationType, locationDescription, locationRating } =
      this.state
    const { latitude, longitude } = this.props
    let setNameError,
      setTypeError,
      setDescriptionError,
      setRatingError,
      setCoordinateError

    if (
      locationName.length > 50 ||
      locationName.length === 0 ||
      !locationName.match('^$|^[A-Za-z0-9-äöåÄÖÅ() ]+$')
    )
      setNameError = true
    else setNameError = false

    if (
      locationType.length > 50 ||
      locationType.length === 0 ||
      !locationType.match('^$|^[A-Za-z0-9-äöåÄÖÅ() ]+$')
    )
      setTypeError = true
    else setTypeError = false

    if (
      locationDescription.length > 250 ||
      !locationDescription.match('^$|^[A-Za-z0-9-äöåÄÖÅ()/.,!?_ ]+$')
    )
      setDescriptionError = true
    else setDescriptionError = false

    if (locationRating === null) setRatingError = true
    else setRatingError = false

    if (latitude === null || longitude === null) setCoordinateError = true
    else setCoordinateError = false

    this.setState({
      error: {
        ...this.state.error,
        locationNameError: setNameError,
        locationTypeError: setTypeError,
        locationDescriptionError: setDescriptionError,
        locationRatingError: setRatingError,
        locationCoordinateError: setCoordinateError,
      },
    })

    // Check all the error states
    if (
      setNameError ||
      setTypeError ||
      setDescriptionError ||
      setRatingError ||
      setCoordinateError
    )
      this.setState({ statusMsg: 1 })
    else
      this.setState(
        {
          loading: true,
          statusMsg: 2,
        },
        () => {
          axios
            .post(
              `http://localhost:9000${process.env.BASEPATH}/api/locations`,
              {
                location: locationName,
                type: locationType,
                description: locationDescription,
                rating: locationRating,
                latitude: latitude,
                longitude: longitude,
              }
            )
            .then((res) => {
              this.setState({
                loading: false,
                statusMsg: 3,
              })
            })
            .catch((err) => {
              console.log(err)
              this.setState({
                loading: false,
                statusMsg: `${err.response.data}`,
              })
            })
        }
      )
  }

  // For having the error msg react to the fields being modified (not used)
  /*setStatusMsg = () => {
        const { locationNameError, locationTypeError, locationDescriptionError, locationRatingError, locationCoordinateError } = this.state.error;
        if (!locationNameError && !locationTypeError && !locationDescriptionError && !locationRatingError && !locationCoordinateError)
            this.setState({ statusMsg: '' });
        //else
        //    this.setState({ statusMsg: 1 });
    }*/

  render() {
    const {
      locationName,
      locationType,
      locationDescription,
      locationRating,
      loading,
      statusMsg,
    } = this.state
    const {
      locationNameError,
      locationTypeError,
      locationDescriptionError,
      locationRatingError,
      locationCoordinateError,
    } = this.state.error
    const {
      latitude,
      longitude,
      selectingFromMap,
      enableMapCentering,
      handleCheckboxChange,
    } = this.props
    const {
      handleValueChange,
      handleSetRating,
      handleSetCoordinates,
      handleSubmit,
      handleReset,
    } = this

    return (
      <React.Fragment>
        <div id="add-menu">
          <div id="input-fields">
            <section>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label htmlFor="location-name">Name</label>
                {locationNameError ? (
                  <IoWarning size={20} color={'#ff5d5d'} />
                ) : null}
              </div>
              <input
                id="location-name"
                className={locationNameError ? 'inputFieldError' : ''}
                type="text"
                autoComplete="off"
                spellCheck="false"
                value={locationName}
                onChange={(event) => handleValueChange(event, 'locationName')}
              />
            </section>

            <section>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label htmlFor="location-type">Type</label>
                {locationTypeError ? (
                  <IoWarning size={20} color={'#ff5d5d'} />
                ) : null}
              </div>
              <input
                id="location-type"
                className={locationTypeError ? 'inputFieldError' : ''}
                type="text"
                autoComplete="off"
                spellCheck="false"
                placeholder="e.g. Ice Hockey"
                value={locationType}
                onChange={(event) => handleValueChange(event, 'locationType')}
              />
            </section>

            <section>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label htmlFor="location-description">Description</label>
                {locationDescriptionError ? (
                  <IoWarning size={20} color={'#ff5d5d'} />
                ) : null}
              </div>
              <textarea
                cols="50"
                rows="5"
                id="location-description"
                className={locationDescriptionError ? 'inputFieldError' : ''}
                autoComplete="off"
                spellCheck="false"
                placeholder="Optional"
                value={locationDescription}
                onChange={(event) =>
                  handleValueChange(event, 'locationDescription')
                }
              />
            </section>

            <section>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label htmlFor="location-rating">Rating</label>
                {locationRatingError ? (
                  <IoWarning size={20} color={'#ff5d5d'} />
                ) : null}
              </div>
              <StarRating
                setRating={handleSetRating}
                locationRating={locationRating}
              />
            </section>

            <section>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label htmlFor="location-coordinates">Location</label>
                {locationCoordinateError ? (
                  <IoWarning size={20} color={'#ff5d5d'} />
                ) : null}
              </div>
              <button
                id={
                  selectingFromMap
                    ? 'location-coordinates-active'
                    : 'location-coordinates'
                }
                onClick={handleSetCoordinates}
              >
                {selectingFromMap
                  ? 'Cancel'
                  : longitude === null
                  ? 'Press to select location'
                  : 'lat: ' + latitude + '\nlng: ' + longitude}
              </button>
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
                    &nbsp;Adding location to database...
                  </p>
                ) : statusMsg === 3 ? (
                  <p className="success-msg">
                    <IoCheckmarkCircle size={18} />
                    &nbsp;Location added succesfully
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
                <button className="submit-btn" onClick={handleSubmit}>
                  Submit
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

const StarRating = ({ setRating, locationRating }) => {
  const [hover, setHover] = useState(null)

  return (
    <div id="location-rating">
      {[...Array(5)].map((star, i) => {
        const ratingValue = i + 1

        return (
          <label key={'star-' + ratingValue}>
            <input
              type="radio"
              name="rating"
              value={ratingValue}
              onClick={() => setRating(ratingValue)}
            />
            <FaStar
              className="star"
              size={40}
              color={
                ratingValue <= (hover || locationRating) ? '#ffc107' : '#e4e5e9'
              }
              onMouseEnter={() => setHover(ratingValue)}
              onMouseLeave={() => setHover(null)}
            />
          </label>
        )
      })}
    </div>
  )
}

export default AddMenu
