import React, { forwardRef, useEffect, useState } from 'react'
import { Form, Input, Select } from 'antd'
const { Option } = Select
// forwardRef包裹一个函数组件，接受两个形参props, ref,ref是形参，参数由父组件传递过来
const UserForm = forwardRef((props, ref) => {
    // 存储状态--是否禁用
    const [isDisabled, setisDisabled] = useState(false)
    // 接收到传递过来的isUpdateDisabled并监听，一旦改变就修改isDisabled的值，设置其是否禁用
    useEffect(() => {
        setisDisabled(props.isUpdateDisabled)
    }, [props.isUpdateDisabled])

    const { roleId, region } = JSON.parse(localStorage.getItem("token"))
    const roleObj = {
        "1": "superadmin",
        "2": "admin",
        "3": "editor"
    }
    // Region 关于不同角色登录后角色列表添加和更新用户时表单区域选择的一些功能限制
    const checkRegionDisabled = (item) => {
        // 如果在更新中使用
        if (props.isUpdate) {
            // 如果是超级管理员，返回false，全都能用
            if (roleObj[roleId] === "superadmin") {
                return false
            } else {
                // 如果不是超级管理员，返回true，全都不能用
                return true
            }
        } else {
            // 如果在添加中使用
            if (roleObj[roleId] === "superadmin") {
                // 如果是超级管理员，返回false，全都能用
                return false
            } else {
                // 只有返回false的能用，即当前项的地域等于当前登陆者的地域
                return item.value !== region
            }
        }
    }
    // Role 关于不同角色登录后角色列表添加和更新用户时表单角色选择的一些功能限制
    const checkRoleDisabled = (item) => {
        // 如果在更新中使用
        if (props.isUpdate) {
            if (roleObj[roleId] === "superadmin") {
                // 如果是超级管理员，返回false，全都能用
                return false
            } else {
                // 如果不是超级管理员，返回true，全都不能用
                return true
            }
        } else {
            // 如果在添加中使用
            if (roleObj[roleId] === "superadmin") {
                // 如果是超级管理员，返回false，全都能用
                return false
            } else {
                // 只有返回false的能用，即当前项的id映射等于编辑
                return roleObj[item.id] !== "editor"
            }
        }
    }

    return (
        <Form
            // 接收ref
            ref={ref}
            // 表单布局
            layout="horizontal "
            // 偏移量
            labelCol={{
                span: 4,
            }}
            // 宽度
            wrapperCol={{
                span: 20,
            }}
        >
            <Form.Item
                // name:用于获取或设置当前表单项的字段，label表单项的名字。rules校验规则
                name="username"
                label="用户名"
                rules={[{ required: true, message: 'Please input the title of collection!' }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                name="password"
                label="密码"
                rules={[{ required: true, message: 'Please input the title of collection!' }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                name="region"
                label="区域"
                // 如果是超级管理员状态，此项会被禁用，所以要判断，将禁用状态的规则设置为空
                rules={isDisabled ? [] : [{ required: true, message: 'Please input the title of collection!' }]}
            >
                <Select disabled={isDisabled}>
                    {
                        props.regionList.map(item =>
                            <Option value={item.value} key={item.id} disabled={checkRegionDisabled(item)}>{item.title}</Option>
                        )
                    }
                </Select>
            </Form.Item>
            <Form.Item
                name="roleId"
                label="角色"
                rules={[{ required: true, message: 'Please input the title of collection!' }]}
            >
                <Select onChange={(value) => {
                    // console.log(value)，value即选中的option的value
                    if (value === 1) {
                        // value === 1,超级管理员，禁用
                        setisDisabled(true)
                        // console.log(ref);
                        // 可以使用 form.setFieldsValue 来动态设定表单值，将地域设置为空
                        ref.current.setFieldsValue({
                            region: ""
                        })
                    } else {
                        setisDisabled(false)
                    }
                }}>
                    {
                        props.roleList.map(item =>
                            <Option value={item.id} key={item.id} disabled={checkRoleDisabled(item)}>{item.roleName}</Option>
                        )
                    }
                </Select>
            </Form.Item>
        </Form>
    )
})
export default UserForm