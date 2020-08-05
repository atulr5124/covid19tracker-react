import React, { useState, useEffect } from 'react';
import {
  MenuItem,
  FormControl,
  Select,
  Card,
  CardContent
} from '@material-ui/core'
import './App.css'
import InfoBox from './InfoBox'
import Map from './Map'
import Table from './Table'
import { sortData, prettyPrintStat } from './util'
import LineGraph from './LineGraph'
import 'leaflet/dist/leaflet.css'
import numeral from 'numeral'

function App() {

  const [countries, setCountries] = useState([])
  const [country, setCountry] = useState('worldwide')
  const [countryInfo, setCountryInfo] = useState({})
  const [tableData, setTableData] = useState([])
  const [mapCenter, setMapCenter] = useState({lat: 34.80746, lng: -40.4796})
  const [mapZoom, setMapZoom] = useState(3)
  const [mapCountries, setMapCountries] = useState([])
  const [casesType, setCasesType] = useState('cases')

  useEffect(() => {
    fetch('https://disease.sh/v3/covid-19/all')
      .then(response => response.json())
      .then((data) => {
        setCountryInfo(data)
      })
  }, [])

  useEffect(() => {
    const getCountriesData = async () => {
      await fetch('https://disease.sh/v3/covid-19/countries')
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => ({
            name: country.country,
            value: country.countryInfo.iso2
          }))
          const sortedData = sortData(data)
          setTableData(sortedData)
          setMapCountries(data)
          setCountries(countries)
        })
    }
    getCountriesData()
  }, [])

  const onCountryChange = async (e) => {
    const countryCode = e.target.value
    setCountry(countryCode)

    const url = countryCode === 'worldwide'
      ? 'https://disease.sh/v3/covid-19/all'
      : `https://disease.sh/v3/covid-19/countries/${countryCode}`

    await fetch(url)
      .then(response => response.json())
      .then(data => {
        console.log(data)
        setCountry(countryCode)
        setCountryInfo(data)
        setMapCenter([data.countryInfo.lat, data.countryInfo.long])
        setMapZoom(4)
      })
  }

  return (
    <div className="app">
      <div className="app__left">
        <div className="app_header">
          <h1>COVID 19 TRACKER</h1>
          <FormControl className="app_dropdown">
            <Select variant="outlined" value={country} onChange={onCountryChange}>
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {/* Loop through all the countries */}
              {
                countries.map(country => (
                  <MenuItem key={country.value} value={country.value}>{country.name}</MenuItem>
                ))
              }
            </Select>
          </FormControl>
        </div>

        <div className="app__stats">
          <InfoBox 
            isRed
            active={casesType === 'cases'}
            onClick={e => setCasesType('cases')}
            title="Coronavirus Cases" 
            cases={prettyPrintStat(countryInfo.todayCases)} 
            total={prettyPrintStat(countryInfo.cases)} />
          <InfoBox 
            active={casesType === 'recovered'}
            onClick={e => setCasesType('recovered')} 
            title="Recovered" 
            cases={prettyPrintStat(countryInfo.todayRecovered)} 
            total={prettyPrintStat(countryInfo.recovered)} />
          <InfoBox
            active={casesType === 'active'}
            title="Active"
            cases={numeral(countryInfo.active).format("0,0a")} />
          <InfoBox 
            isRed
            active={casesType === 'deaths'}
            onClick={e => setCasesType('deaths')} 
            title="Deceased" 
            cases={prettyPrintStat(countryInfo.todayDeaths)} 
            total={prettyPrintStat(countryInfo.recovered)} />
        </div>
        <Map 
          casesType={casesType} 
          center={mapCenter} 
          zoom={mapZoom} 
          countries={mapCountries} />
      </div>
      <Card className="app__right">
        <CardContent>
          <h3>Live Cases by Country</h3>
          <Table className="countries__table" countries={tableData} />
            <h3 className="app__graphTitle">Worldwide New {casesType}</h3>
          <LineGraph className="app__graph" casesType={casesType} />
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
