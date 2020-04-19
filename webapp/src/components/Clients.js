import React, { useState } from 'react';
import { Button, message, Table, Row, Col, Space, Divider, Tag } from 'antd';
import {
    StopOutlined,
    DashboardOutlined,
    ReloadOutlined
  } from '@ant-design/icons';
import { useRequest } from '@umijs/hooks';
import Media from "react-media";

function Clients() {
    const [clients, setClients] = useState([]);

    const fetchClients = () => {
        return fetch('http://192.168.2.252:4444/vpn/status')
            .then(response => response.json());  
    }

    const stopVPN = () => {
        return fetch('http://192.168.2.252:4444/vpn/stop', { method: 'POST' });
    }

    const bestVPN = () => {
        return fetch('http://192.168.2.252:4444/vpn/best', { method: 'POST' });
    }

    const { run: runClients, fetches: fetchesClients } = useRequest(fetchClients, {
        fetchKey: () => 'clients',
        onSuccess: (result, params) => {
            // console.log(result);
            if (result.length) {
                setClients(result);
            }
        }
    });

    const { run: stop, fetches: fetchesStop } = useRequest(stopVPN, {
        manual: true,
        fetchKey: () => 'stop',
        onSuccess: (result, params) => {
            // console.log(result);
            message.success(`Stopped VPN`);
            runClients();
        }
    });

    const { run: best, fetches: fetchesBest } = useRequest(bestVPN, {
        manual: true,
        fetchKey: () => 'best',
        onSuccess: (result, params) => {
            // console.log(result);
            message.success(`Running best VPN client`);
            runClients();
        }
    });

    const columns = [
        {
            title: 'Client',
            dataIndex: 'client',
            key: 'client',
            screenTreshold: 'small'
        },
        {
            title: 'Country',
            dataIndex: 'country',
            key: 'country',
            screenTreshold: 'medium'
        },
        {
            title: 'City',
            dataIndex: 'city',
            key: 'city',
            screenTreshold: 'small'
        },
        {
            title: 'Hostname',
            dataIndex: 'hostname',
            key: 'hostname',
            screenTreshold: 'large'
        },
        {
            title: 'IP',
            dataIndex: 'ip',
            key: 'ip',
            screenTreshold: 'large'
        },
        {
            title: 'Visible',
            dataIndex: 'visible',
            key: 'visible',
            screenTreshold: 'medium',
            render(visible, record) {
                return {
                  children: <Tag color={visible ? 'green' : 'red'}>{visible ? 'visible' : 'invisible'}</Tag>
                };
            }
        },
        {
            title: 'Online',
            dataIndex: 'online',
            key: 'online',
            screenTreshold: 'small',
            render(online, record) {
                return {
                  children: <Tag color={online ? 'green' : 'red'}>{online ? 'online' : 'offline'}</Tag>
                };
            }
        },
        {
            title: 'Capacity',
            dataIndex: 'capacity',
            key: 'capacity',
            screenTreshold: 'small',
            render(capacity, record) {
                return {
                  children: <Tag color={capacity > 33 ? (capacity > 66 ? 'red' : 'orange') : 'green'}>{capacity}</Tag>
                };
            }
        }
    ];

    const getResponsiveColumns = screenSize => {
        if (screenSize.large) {
            return columns;
        } else if (screenSize.medium) {
            return columns.filter(({ screenTreshold = 'small' }) => screenTreshold === 'small' || screenTreshold === 'medium');
        } else {
            return columns.filter(({ screenTreshold = 'small' }) => screenTreshold === 'small');
        }
    };

    return (
        <>
            <Row>
                <Space>
                    <Col span={8}>
                        <Button type="secondary" size="large" icon={<StopOutlined />} loading={fetchesStop.stop?.loading} onClick={stop}>
                            Stop
                        </Button>
                    </Col>
                    <Col span={8}>
                        <Button type="secondary" size="large" icon={<DashboardOutlined />} loading={fetchesBest.best?.loading} onClick={best}>
                            Switch To Best
                        </Button>
                    </Col>
                    <Col span={8}>
                        <Button type="secondary" size="large" icon={<ReloadOutlined />} loading={fetchesClients.clients?.loading} onClick={runClients}>
                            Refresh
                        </Button>
                    </Col>
                </Space>
            </Row>
            <Divider style={{ background: 'transparent' }}/>
            <Media queries={{
                small: "(max-width: 530px)",
                medium: "(min-width: 531px) and (max-width: 777px)",
                large: "(min-width: 778px)"
            }}>
                {screenSize => {
                    return (
                        <Table
                            size="small"
                            rowClassName={(record, index) => record.status !== 'ON' ? 'Table-row-off' : 'Table-row-on'}
                            columns={getResponsiveColumns(screenSize)}
                            dataSource={clients}
                            loading={fetchesClients.clients?.loading}
                            pagination={false}
                        />
                    );
                }}
            </Media>
        </>
    );
}

export default Clients;