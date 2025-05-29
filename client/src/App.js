import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';


function App() {
  const [data, setData] = useState('');

  useEffect(() => {
    fetch('/api/v1/test')
      .then((res) => res.json())
      .then((data) => setData(data.message));
  }, []);
  return (
    <div className="App">
      
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
      <h1>{data}</h1>
    </div>
  );
}

export default App;
