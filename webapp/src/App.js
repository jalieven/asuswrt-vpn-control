import React from 'react';
import {Typography, Layout, Space, Divider} from 'antd';

import Clients from './components/Clients';
import './App.css';

const { Content } = Layout;
const { Title } = Typography;

function App() {
  return (
      <div className="App">
          <Layout>
              <Content>
                  <Divider style={{ background: 'transparent' }}/>
                  <Clients />
              </Content>
          </Layout>
      </div>
  );
}

export default App;
