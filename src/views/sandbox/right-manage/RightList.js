import React, { useState, useEffect } from 'react'
import { Button, Table, Tag, Modal, Popover, Switch } from 'antd'
import axios from 'axios'
import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
const { confirm } = Modal
export default function RightList() {
    const [dataSource, setdataSource] = useState([])

    useEffect(() => {
        axios.get("http://localhost:5000/rights?_embed=children").then(res => {
            const list = res.data
            // 判断item项中的children，因为树形表格会将带children的空数组也渲染出一个树形结构，而我们不需要
            list.forEach(item => {
                if (item.children.length === 0) {
                    item.children = ""
                }
            })
            setdataSource(list)
        })
    }, [])

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            //render渲染效果， 这里render接收的参数为dataIndex的值
            render: (id) => {
                return <b>{id}</b>
            }
        },
        {
            title: '权限名称',
            dataIndex: 'title'
        },
        {
            title: "权限路径",
            dataIndex: 'key',
            render: (key) => {
                return <Tag color="green">{key}</Tag>
            }
        },
        {
            title: "操作",
            // 如果没有dataIndex，则接受的参数为每个item项
            render: (item) => {
                return <div>
                    {/* 删除 */}
                    <Button danger shape="circle" icon={<DeleteOutlined />} onClick={() => confirmMethod(item)} style={{ marginRight: '10px' }} />
                    {/* 配置权限 */}
                    <Popover content={<div style={{ textAlign: "center" }}>
                        <Switch checked={item.pagepermisson} onChange={() => switchMethod(item)}></Switch>
                    </div>} title="页面配置项" trigger={item.pagepermisson === undefined ? '' : 'click'}>
                        <Button type="primary" shape="circle" icon={<EditOutlined />} disabled={item.pagepermisson === undefined} />
                    </Popover>
                </div>
            }
        }
    ];
    // 通过气泡卡片开关选择是否拥有某个权限
    const switchMethod = (item) => {
        // pagepermisson 控制其是否有权限在侧边导航栏加载出来。
        item.pagepermisson = item.pagepermisson === 1 ? 0 : 1
        // console.log(item)
        setdataSource([...dataSource])

        if (item.grade === 1) {
            axios.patch(`/rights/${item.id}`, {
                pagepermisson: item.pagepermisson
            })
        } else {
            axios.patch(`/children/${item.id}`, {
                pagepermisson: item.pagepermisson
            })
        }
    }
    // 点击删除按钮后调用
    const confirmMethod = (item) => {
        confirm({
            title: '你确定要删除?',
            icon: <ExclamationCircleOutlined />,
            onOk() {
                // console.log(item);
                deleteMethod(item)
            },
            onCancel() {
                //   console.log('Cancel');
            },
        });

    }
    //删除
    const deleteMethod = (item) => {
        // console.log(item)
        // 当前页面同步状态 + 后端同步
        if (item.grade === 1) { //如果是一级路由
            setdataSource([...dataSource.filter(data => data.id !== item.id)])
            axios.delete(`/rights/${item.id}`)
        } else {
            // 找出当前点击删除的二级路由的一级路由
            let list = dataSource.filter(data => data.id === item.rightId)
            // console.log(list);
            //   过滤掉一级路由的被删除二级路由
            list[0].children = list[0].children.filter(data => data.id !== item.id)
            setdataSource([...dataSource])
            axios.delete(`/children/${item.id}`)
            // 不是唯一方法，可以通过删除后重新获取接口数据实现页面更新
        }
    }

    return (
        <div>
            <Table dataSource={dataSource} columns={columns}
                pagination={{
                    pageSize: 3
                }} />
        </div>
    )
}
