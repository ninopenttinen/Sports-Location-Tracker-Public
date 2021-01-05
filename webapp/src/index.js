import React from 'react';
import ReactDOM from 'react-dom';
import './css/index.css';
import './css/add_components.css';
import './css/search_components.css';
import './css/results_display.css';
import './css/pop_up_window.css';
import App from './App';

/*
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
*/

ReactDOM.render(<App/>, document.getElementById('app'));
