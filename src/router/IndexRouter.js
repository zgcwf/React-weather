import React from 'react'
import { HashRouter, Redirect, Route, Switch } from 'react-router-dom'
import Login from '../views/login/Login'
import Detail from '../views/news/Detail'
import News from '../views/news/News'
import NewsSandBox from '../views/sandbox/NewsSandBox'
export default function IndexRouter() {
    return (
        <HashRouter>
            <Switch>
                {/* 路由组件，component={组件}展示 */}
                <Route path="/login" component={Login} />
                <Route path="/news" component={News} />
                <Route path="/detail/:id" component={Detail} />
                {/* <Route path="/" component={NewsSandBox}/> */}
                {/* 可以写成一个函数，函数的返回值就是你要渲染的组件，如果已授权，则展示 NewsSandBox 组件，否则重定向到 login*/}
                <Route path="/" render={() =>
                    localStorage.getItem("token") ?
                        <NewsSandBox ></NewsSandBox> :
                        // 普通组件，标签展示
                        <Redirect to="/login" />
                } />
            </Switch>
        </HashRouter>
    )
}
