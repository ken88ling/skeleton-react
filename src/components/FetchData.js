import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { ActionCreators } from '../actions/WeatherForecast'

class FetchData extends Component {
  componentDidMount() {
    this.ensureDataFetched()
  }

  componentDidUpdate() {
    this.ensureDataFetched()
  }

  ensureDataFetched() {
    const startDateIndex = parseInt(this.props.match.params.startDateIndex, 10) || 0
    if (startDateIndex !== this.props.startDateIndex) {
      this.props.requestWeatherForecasts(startDateIndex)
    }
  }

  render() {
    return (
      <div>
        <h1>Weather forecast</h1>
        <p>This component demonstrates fetching data from the server and working with URL parameters.</p>
        {renderForecastsTable(this.props)}
        {renderPagination(this.props)}
      </div>
    )
  }
}

function renderForecastsTable(props) {
  return (
    <table className="table table-striped">
      <thead>
        <tr>
          <th>Date</th>
          <th>Temp. (C)</th>
          <th>Temp. (F)</th>
          <th>Summary</th>
        </tr>
      </thead>
      <tbody>
        {props.forecasts.map(forecast => (
          <tr key={forecast.dateFormatted}>
            <td>{forecast.dateFormatted}</td>
            <td>{forecast.temperatureC}</td>
            <td>{forecast.temperatureF}</td>
            <td>{forecast.summary}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function renderPagination(props) {
  const prevStartDateIndex = (props.startDateIndex || 0) - 5
  const nextStartDateIndex = (props.startDateIndex || 0) + 5

  return (
    <p className="clearfix text-center">
      <Link className="btn btn-default pull-left" to={`/fetch-data/${prevStartDateIndex}`}>
        Previous
      </Link>
      <Link className="btn btn-default pull-right" to={`/fetch-data/${nextStartDateIndex}`}>
        Next
      </Link>
      {props.isLoading ? <span>Loading...</span> : []}
    </p>
  )
}

export default connect(
  state => {
    let newState = state.demo
    return {
      startDateIndex: newState.get('startDateIndex'),
      forecasts: newState.get('forecasts'),
      isLoading: newState.get('isLoading')
    }
  },
  dispatch => bindActionCreators(ActionCreators, dispatch)
)(FetchData)
