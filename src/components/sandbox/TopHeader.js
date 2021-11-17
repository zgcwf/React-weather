import React from 'react'
import { Layout, Dropdown, Menu, Avatar } from 'antd';
import {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    UserOutlined
} from '@ant-design/icons';
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'

const { Header } = Layout;

function TopHeader(props) {

    // console.log(props)
    // const [collapsed, setCollapsed] = useState(false)
    const changeCollapsed = () => {
        //改变state的isCollapsed
        // console.log(props)
        props.changeCollapsed()
    }
    // 读取token值并解构
    const { role: { roleName }, username } = JSON.parse(localStorage.getItem("token"))

    const menu = (
        <Menu>
            <Menu.Item key="x">
                {roleName}
            </Menu.Item>
            <Menu.Item key="y" danger onClick={() => {
                localStorage.removeItem("token")
                // console.log(props.history)
                props.history.replace("/login")
            }}>退出</Menu.Item>
        </Menu>
    );

    return (
        <Header className="site-layout-background" style={{ padding: '0 16px' }}>
            {
                props.isCollapsed ? <MenuUnfoldOutlined onClick={changeCollapsed} /> : <MenuFoldOutlined onClick={changeCollapsed} />
            }

            <div style={{ float: "right" }}>
                <span>欢迎<span style={{ color: "#1890ff" }}>{username}</span>回来</span>
                <Dropdown overlay={menu} placement="bottomRight" arrow>
                    <Avatar size={{ xs: 24, sm: 32, md: 40, lg: 52, xl: 52, xxl: 52 }} icon={<UserOutlined />} style={{ backgroundColor: '#87d068', marginLeft: '10px' }} />
                </Dropdown>
            </div>
        </Header>

    )
}
/*
 connect(
  // mapStateToProps  
  // mapDispatchToProps
 )(被包装的组件)
*/

const mapStateToProps = ({ CollApsedReducer: { isCollapsed } }) => {
    // console.log(state)
    return {
        isCollapsed
    }
}

const mapDispatchToProps = {
    changeCollapsed() {
        return {
            type: "change_collapsed"
            // payload:
        }//action 
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(TopHeader))