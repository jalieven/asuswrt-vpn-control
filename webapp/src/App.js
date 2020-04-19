import React from 'react';
import { Typography, Divider } from 'antd';

import Clients from './components/Clients';
import './App.css';

const { Title } = Typography;

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Title level={2}>VPN Settings</Title>
        <Divider style={{ background: 'transparent' }}/>
        <Clients />
      </header>
    </div>
  );
}

export default App;
