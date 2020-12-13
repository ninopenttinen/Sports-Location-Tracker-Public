import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './add_components.css';
import './search_components.css';
import './results_display.css';
import './pop_up_window.css';
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
