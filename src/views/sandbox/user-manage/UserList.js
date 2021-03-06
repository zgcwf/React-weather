import React, { useState, useEffect, useRef } from 'react'
import { Button, Table, Modal, Switch } from 'antd'
import axios from 'axios'
import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import UserForm from '../../../components/user-manage/UserForm'
const { confirm } = Modal

export default function UserList() {
    // 存储从/users?_expand=role接口返回的数据
    const [dataSource, setdataSource] = useState([])
    // 存储添加表单是否能够看见的状态
    const [isAddVisible, setisAddVisible] = useState(false)
    // 存储更新表单是否能够看见的状态
    const [isUpdateVisible, setisUpdateVisible] = useState(false)
    // 存储从/roles接口返回的数据，三个角色管理员
    const [roleList, setroleList] = useState([])
    // 存储从/regions接口返回的数据，各大洲
    const [regionList, setregionList] = useState([])
    // 用于存储当前更新项的item
    const [current, setcurrent] = useState(null)
    // 更新按钮中的禁用状态
    const [isUpdateDisabled, setisUpdateDisabled] = useState(false)
    // 添加form表单的ref
    const addForm = useRef(null)
    // 更新form表单的ref
    const updateForm = useRef(null)

    const { roleId, region, username } = JSON.parse(localStorage.getItem("token"))

    useEffect(() => {
        const roleObj = {
            "1": "superadmin",
            "2": "admin",
            "3": "editor"
        }
        axios.get("/users?_expand=role").then(res => {
            const list = res.data
            // 登录后进行用户列表table渲染权限判断，如果是超级管理员，获得所有的权限列表，否则获取到和登录名字相同的项的权限列表以及和自己地区相同并且是编辑的权限列表
            setdataSource(roleObj[roleId] === "superadmin" ? list : [
                ...list.filter(item => item.username === username), //自己的权限
                ...list.filter(item => item.region === region && roleObj[item.roleId] === "editor") //自己下属的权限
            ])
        })
    }, [roleId, region, username])

    useEffect(() => {
        axios.get("/regions").then(res => {
            const list = res.data
            setregionList(list)
        })
    }, [])

    useEffect(() => {
        axios.get("/roles").then(res => {
            const list = res.data
            setroleList(list)
        })
    }, [])
    // table表格渲染规则
    const columns = [
        {
            title: '区域',
            dataIndex: 'region',
            // filters 属性来指定需要筛选菜单的列
            filters: [
                // 遍历出需要筛选菜单的列，并重新命名使其符合渲染规则
                ...regionList.map(item => ({
                    text: item.title,
                    value: item.value
                })),
                // 后端数据中没有全球，添加上
                {
                    text: "全球",
                    value: "全球"
                }

            ],
            // onFilter 用于筛选当前数据，value为选中的值，item为每一项
            onFilter: (value, item) => {
                if (value === "全球") {
                    return item.region === ""
                }
                return item.region === value
            },

            render: (region) => {
                // 如果region的值为空字符串，就显示为全球,因为后端数据默认全球为''
                return <b>{region === "" ? '全球' : region}</b>
            }
        },
        {
            title: '角色名称',
            dataIndex: 'role',
            render: (role) => {
                return role?.roleName
            }
        },
        {
            title: "用户名",
            dataIndex: 'username'
        },
        {
            title: "用户状态",
            dataIndex: 'roleState',
            // 第一个参数为roleState，第二个参数为当前项
            render: (roleState, item) => {
                return <Switch checked={roleState} disabled={item.default} onChange={() => handleChange(item)}></Switch>
            }
        },
        {
            title: "操作",
            render: (item) => {
                return <div>
                    <Button danger shape="circle" icon={<DeleteOutlined />} onClick={() => confirmMethod(item)} disabled={item.default} style={{ marginRight: '10px' }} />

                    <Button type="primary" shape="circle" icon={<EditOutlined />} disabled={item.default} onClick={() => handleUpdate(item)} />
                </div>
            }
        }
    ];
    // 点击更新按钮调用
    const handleUpdate = (item) => {
        // 用setTimeout将其变为同步触发
        setTimeout(() => {
            // 点击更新按钮将form表单设置为可见
            setisUpdateVisible(true)
            if (item.roleId === 1) {
                //如果是超级管理员，传递true，禁用
                setisUpdateDisabled(true)
            } else {
                //取消禁用
                setisUpdateDisabled(false)
            }
            // 获取到item的值，放到到表单域中
            updateForm.current.setFieldsValue(item)
        }, 0)

        setcurrent(item)
    }
    // "roleState"开关状态发生变化调用此函数更改状态
    const handleChange = (item) => {
        // console.log(item)
        item.roleState = !item.roleState
        setdataSource([...dataSource])

        axios.patch(`/users/${item.id}`, {
            roleState: item.roleState
        })
    }
    // 点击删除按钮时调用
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
        // 当前页面同步状态 + 后端同步

        setdataSource(dataSource.filter(data => data.id !== item.id))

        axios.delete(`/users/${item.id}`)
    }
    // 点击确定后，添加用户信息
    const addFormOK = () => {
        //validateFields() 触发表单验证,得到了表单提交的数据value
        addForm.current.validateFields().then(value => {
            // console.log(1, addForm)
            // console.log(2, value)
            // addForm，表单的ref

            setisAddVisible(false)
            // 表单重置
            addForm.current.resetFields()
            //post到后端，生成id，再设置 datasource, 方便后面的删除和更新
            axios.post(`/users`, {
                ...value,
                "roleState": true,
                "default": false,
            }).then(res => {
                // console.log(3, res.data)
                setdataSource([...dataSource, {
                    ...res.data,
                    role: roleList.filter(item => item.id === value.roleId)[0]
                }])
            })
        }).catch(err => {
            console.log(err)
        })
    }
    // 点击确定后，更新用户信息
    const updateFormOK = () => {
        updateForm.current.validateFields().then(value => {
            // console.log(value)
            setisUpdateVisible(false)

            setdataSource(dataSource.map(item => {
                if (item.id === current.id) {
                    return {
                        ...item,
                        ...value,
                        role: roleList.filter(data => data.id === value.roleId)[0]
                    }
                }
                return item
            }))
            setisUpdateDisabled(!isUpdateDisabled)

            axios.patch(`/users/${current.id}`, value)
        })
    }

    return (
        <div>
            <Button type="primary" onClick={() => {
                // 点击按钮展示modal框
                setisAddVisible(true)
            }}>添加用户</Button>
            <Table dataSource={dataSource} columns={columns}
                pagination={{
                    pageSize: 5
                }}
                rowKey={item => item.id}
            // 设置key值
            />

            <Modal
                visible={isAddVisible}
                title="添加用户"
                okText="确定"
                cancelText="取消"
                onCancel={() => {
                    // 点击取消时的回调，将modal设置为不可见
                    setisAddVisible(false)
                }}
                onOk={() => addFormOK()}
            >
                {/* 通过props传递数据，ref会传到form表单中被接收，相当于ref也绑定到了form上 */}
                <UserForm regionList={regionList} roleList={roleList} ref={addForm}></UserForm>
            </Modal>

            <Modal
                visible={isUpdateVisible}
                title="更新用户"
                okText="更新"
                cancelText="取消"
                onCancel={() => {
                    setisUpdateVisible(false)
                    // 为了修复你点击了超级管理员之后地域选项被禁用，但没有确定，而是点击了取消，这样第二次点开，地域选项还是被禁用，取一下反，会让页面更新一下，而且对页面没影响
                    setisUpdateDisabled(!isUpdateDisabled)
                }}
                onOk={() => updateFormOK()}
            >
                {/* isUpdate 用来标志是更新，在UserForm中使用 */}
                <UserForm regionList={regionList} roleList={roleList} ref={updateForm} isUpdateDisabled={isUpdateDisabled} isUpdate={true}></UserForm>
            </Modal>

        </div>
    )
}
