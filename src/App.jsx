import { useState } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import SearchBar from './components/SearchBar'


function App() {
  return(
    <div className='app'>
      <Navbar></Navbar>
      <div className="main">
        <SearchBar></SearchBar>
      </div>
    </div>
  )
}

export default App
