import React, { useState, useEffect } from 'react'
import { Table, Button, Modal, Tree } from 'antd'
import axios from 'axios'
import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
const { confirm } = Modal
export default function RoleList() {
    // 存储渲染table表格的初始数据
    const [dataSource, setdataSource] = useState([])
    const [rightList, setRightList] = useState([])
    const [currentRights, setcurrentRights] = useState([])
    const [currentId, setcurrentId] = useState(0)
    const [isModalVisible, setisModalVisible] = useState(false)
    // 表格渲染规则
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            render: (id) => {
                return <b>{id}</b>
            }
        },
        {
            title: '角色名称',
            dataIndex: 'roleName'
        },
        {
            title: "操作",
            render: (item) => {
                return <div>
                    <Button danger shape="circle" icon={<DeleteOutlined />} onClick={() => confirmMethod(item)} style={{ marginRight: '10px' }} />
                    <Button type="primary" shape="circle" icon={<EditOutlined />} onClick={() => {
                        setisModalVisible(true)
                        setcurrentRights(item.rights)
                        setcurrentId(item.id)
                    }} />
                </div>
            }
        }
    ]

    const confirmMethod = (item) => {
        confirm({
            title: '你确定要删除?',
            icon: <ExclamationCircleOutlined />,
            // content: 'Some descriptions',
            onOk() {
                //   console.log('OK');
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
        setdataSource([...dataSource.filter(data => data.id !== item.id)])
        axios.delete(`/roles/${item.id}`)
    }
    // 获取渲染table表格的初始数据

    useEffect(() => {
        axios.get("/roles").then(res => {
            console.log(res.data)
            setdataSource(res.data)
        })
    }, [])
    // 获取初始权限数据
    useEffect(() => {
        axios.get("/rights?_embed=children").then(res => {
            console.log(res.data)
            setRightList(res.data)
        })
    }, [])



    const handleOk = () => {
        console.log(currentRights, currentId)
        setisModalVisible(false)
        //同步datasource
        setdataSource(dataSource.map(item => {
            if (item.id === currentId) {
                return {
                    ...item,
                    rights: currentRights
                }
            }
            return item
        }))
        //patch

        axios.patch(`/roles/${currentId}`, {
            rights: currentRights
        })
    }

    const handleCancel = () => {
        setisModalVisible(false)
    }

    const onCheck = (checkKeys) => {
        // console.log(checkKeys)
        setcurrentRights(checkKeys.checked)
    }
    return (
        <div>
            {/* 在 Table 中，dataSource 和 columns 里的数据值都需要指定 key 值。对于 dataSource 默认将每列数据的 key 属性作为唯一的标识。
            如果 dataSource[i].key 没有提供，你应该使用 rowKey 来指定 dataSource 的主键。columns如果已经设置了唯一的 dataIndex，可以忽略key这个属性 */}
            <Table dataSource={dataSource} columns={columns}
                rowKey={(item) => item.id}></Table>

            <Modal title="权限分配" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
                <Tree
                    checkable
                    checkedKeys={currentRights}
                    onCheck={onCheck}
                    checkStrictly={true}
                    treeData={rightList}
                />

            </Modal>
        </div>
    )
}
