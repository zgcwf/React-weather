import React, { useEffect, useState } from 'react'
import { Layout, Menu } from 'antd';
import './index.css'
import { withRouter } from 'react-router-dom'
import {
  UserOutlined
} from '@ant-design/icons';
import axios from 'axios'
import { connect } from 'react-redux'
const { Sider } = Layout;
const { SubMenu } = Menu

//模拟数组结构
// const  menuList = [
//   {
//     key:"/home",
//     title:"首页",
//     icon:<UserOutlined />
//   },
//   {
//     key:"/user-manage",
//     title:"用户管理",
//     icon:<UserOutlined />,
//     children:[
//       {
//         key:"/user-manage/list",
//         title:"用户列表",
//         icon:<UserOutlined />
//       }
//     ]
//   },
//   {
//     key:"/right-manage",
//     title:"权限管理",
//     icon:<UserOutlined />,
//     children:[
//       {
//         key:"/right-manage/role/list",
//         title:"角色列表",
//         icon:<UserOutlined />
//       },
//       {
//         key:"/right-manage/right/list",
//         title:"权限列表",
//         icon:<UserOutlined />
//       }
//     ]
//   }
// ]

// 路径对应的图标
const iconList = {
  "/home": <UserOutlined />,
  "/user-manage": <UserOutlined />,
  "/user-manage/list": <UserOutlined />,
  "/right-manage": <UserOutlined />,
  "/right-manage/role/list": <UserOutlined />,
  "/right-manage/right/list": <UserOutlined />
  //.......
}


function SideMenu(props) {
  const [meun, setMeun] = useState([])
  useEffect(() => {
    // 页面一挂载就获取到数据，并将其赋给meun
    axios.get("http://localhost:5000/rights/?_embed=children").then(res => {
      // console.log(res.data)
      setMeun(res.data)
    })
  }, [])
  // 从token中取出当前用户的权限列表，解构出来
  const { role: { rights } } = JSON.parse(localStorage.getItem("token"))
  // 控制获取到的数据是否渲染到侧边栏的函数，如果pagepermisson的值为1并且当前用户权限列表包含key值，返回true
  const checkPagePermission = (item) => {
    return item.pagepermisson === 1 && rights.includes(item.key)
  }
  // 根据后端返回的数据动态生成侧边栏的渲染结果的函数
  const renderMenu = (menuList) => {
    return menuList.map(item => {
      // 如果item项中存在 children属性并且数组长度大于0，checkPagePermission函数返回值为true，则生成SubMenu，之后再递归调用
      if (item.children && item.children.length > 0 && checkPagePermission(item)) {
        return <SubMenu key={item.key} icon={iconList[item.key]} title={item.title}>
          {renderMenu(item.children)}
        </SubMenu>
      } else {
        return checkPagePermission(item) && <Menu.Item key={item.key} icon={iconList[item.key]} onClick={() => {
          //  向目标路径跳转，注意普通组件的props没有history，需要withRouter
          props.history.push(item.key)
        }}>{item.title}</Menu.Item>
      }


    })
  }

  console.log(props.location.pathname)
  // 拿到当前路由跳转的路径
  const selectKeys = [props.location.pathname]
  // 拿到当前路由跳转的一级路径
  const openKeys = ["/" + props.location.pathname.split("/")[1]]
  return (
    <Sider trigger={null} collapsible collapsed={props.isCollapsed} >
      <div style={{ display: "flex", height: "100%", "flexDirection": "column" }}>
        <div className="logo" >全球新闻发布管理系统</div>
        <div style={{ flex: 1, "overflow": "auto" }}>
          {/* defaultOpenKeys初始展开的 SubMenu 菜单项 key 数组 selectedKeys 当前选中的菜单项高亮 key 数组*/}
          <Menu theme="dark" mode="inline" selectedKeys={selectKeys} defaultOpenKeys={openKeys}>
            {renderMenu(meun)}
            {/* 动态生成侧边栏渲染结构 */}
          </Menu>
        </div>
      </div>
    </Sider>
  )
}
const mapStateToProps = ({ CollApsedReducer: { isCollapsed } }) => ({
  isCollapsed
})
export default connect(mapStateToProps)(withRouter(SideMenu))