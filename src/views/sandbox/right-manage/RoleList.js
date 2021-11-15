import React, { useState, useEffect } from 'react'
import { Table, Button, Modal, Tree } from 'antd'
import axios from 'axios'
import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
const { confirm } = Modal
export default function RoleList() {
    // 存储渲染table表格的初始数据
    const [dataSource, setdataSource] = useState([])
    // 存储所有权限的初始数据
    const [rightList, setRightList] = useState([])
    // 存储当前选中项的权限
    const [currentRights, setcurrentRights] = useState([])
    // 存储当前选中项的id
    const [currentId, setcurrentId] = useState(0)
    // 设置是否可见
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
                        // 点击之后先设置为可见，然后将当前项的权限存储到currentRights，最后将当前项的id存储到currentId
                        setisModalVisible(true)
                        setcurrentRights(item.rights)
                        setcurrentId(item.id)
                    }} />
                </div>
            }
        }
    ]
    // 一个modal UI组件，用于删除
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
            // console.log(res.data)
            setdataSource(res.data)
        })
    }, [])
    // 获取初始所有的权限数据
    useEffect(() => {
        axios.get("/rights?_embed=children").then(res => {
            // console.log(res.data)
            setRightList(res.data)
        })
    }, [])



    const handleOk = () => {
        // console.log(currentRights, currentId)
        setisModalVisible(false)
        //同步datasource
        setdataSource(dataSource.map(item => {
            if (item.id === currentId) {
                return {
                    ...item,
                    rights: currentRights
                }
            } else {
                return item

            }
        }))

        //patch，更新数据到后端
        axios.patch(`/roles/${currentId}`, {
            rights: currentRights
        })
    }
    // 点击将isModalVisible设置为false，不可见
    const handleCancel = () => {
        setisModalVisible(false)
    }

    const onCheck = (checkKeys) => {
        // console.log(checkKeys)
        // checkedKeys	（受控）选中复选框的树节点
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
                    // checkedKeys	（受控）选中复选框的树节点
                    checkedKeys={currentRights}
                    onCheck={onCheck}
                    // checkStrictly，checkable 状态下节点选择完全受控（父子节点选中状态不再关联）
                    checkStrictly={true}
                    treeData={rightList}
                />

            </Modal>
        </div>
    )
}
