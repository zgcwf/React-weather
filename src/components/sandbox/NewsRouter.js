import React, { useEffect, useState } from 'react'
import Home from '../../views/sandbox/home/Home'
import Nopermission from '../../views/sandbox/nopermission/Nopermission'
import RightList from '../../views/sandbox/right-manage/RightList'
import RoleList from '../../views/sandbox/right-manage/RoleList'
import UserList from '../../views/sandbox/user-manage/UserList'
import { Switch, Route, Redirect } from 'react-router-dom'
import NewsAdd from '../../views/sandbox/news-manage/NewsAdd'
import NewsDraft from '../../views/sandbox/news-manage/NewsDraft'
import NewsCategory from '../../views/sandbox/news-manage/NewsCategory'
import Audit from '../../views/sandbox/audit-manage/Audit'
import AuditList from '../../views/sandbox/audit-manage/AuditList'
import Unpublished from '../../views/sandbox/publish-manage/Unpublished'
import Published from '../../views/sandbox/publish-manage/Published'
import Sunset from '../../views/sandbox/publish-manage/Sunset'
// import axios from '_axios@0.21.1@axios'
import axios from 'axios'
import NewsPreview from '../../views/sandbox/news-manage/NewsPreview'
import NewsUpdate from '../../views/sandbox/news-manage/NewsUpdate'
import { Spin } from 'antd'

import { connect } from 'react-redux'
// 路由映射表
const LocalRouterMap = {
    "/home": Home,
    "/user-manage/list": UserList,
    "/right-manage/role/list": RoleList,
    "/right-manage/right/list": RightList,
    "/news-manage/add": NewsAdd,
    "/news-manage/draft": NewsDraft,
    "/news-manage/category": NewsCategory,
    "/news-manage/preview/:id": NewsPreview,
    "/news-manage/update/:id": NewsUpdate,
    "/audit-manage/audit": Audit,
    "/audit-manage/list": AuditList,
    "/publish-manage/unpublished": Unpublished,
    "/publish-manage/published": Published,
    "/publish-manage/sunset": Sunset
}

function NewsRouter(props) {
    // 存储从后端接收到的数据
    const [BackRouteList, setBackRouteList] = useState([])
    useEffect(() => {
        Promise.all([
            axios.get("/rights"),
            axios.get("/children"),
        ]).then(res => {
            // console.log(res)
            setBackRouteList([...res[0].data, ...res[1].data])
            // console.log(BackRouteList)
        })
    }, [])
    // 从cookie中结构出rights--当前用户权限
    const { role: { rights } } = JSON.parse(localStorage.getItem("token"))

    const checkRoute = (item) => {
        // 后端必须返回此路由并且pagepermisson值为1（表示有权限渲染到侧边栏）
        return LocalRouterMap[item.key] && (item.pagepermisson || item.routepermisson)
    }

    const checkUserPermission = (item) => {
        // 当前用户权限必须包含这个路径
        return rights.includes(item.key)
    }

    return (
        <Spin size="large" spinning={props.isLoading}>
            <Switch>
                {
                    // 遍历动态生成路由组件
                    BackRouteList.map(item => {
                        // 控制权限:即动态生成路由的条件
                        if (checkRoute(item) && checkUserPermission(item)) {
                            // 动态生成路由组件时，因为后端返回的路径有一级路由，虽然匹配不到组件，但是在点击二级路由跳转页面时，路径会优先匹配到一级路由，为空，页面无法展示
                            return <Route path={item.key} key={item.key} component={LocalRouterMap[item.key]} exact />
                        }
                        return null
                    }
                    )
                }

                <Redirect from="/" to="/home" exact />
                {
                    // 初始数据没有获取，会导致直接匹配到这个组件，所以要在之前加上一个长度大于0的判断
                    BackRouteList.length > 0 && <Route path="*" component={Nopermission} />
                }
            </Switch>
        </Spin>
    )
}

const mapStateToProps = ({ LoadingReducer: { isLoading } }) => ({
    isLoading
})

export default connect(mapStateToProps)(NewsRouter)