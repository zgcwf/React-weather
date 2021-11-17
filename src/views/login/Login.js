import React from 'react'
import { Form, Button, Input, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import './Login.css'
// 引入一个react特效粒子库
import Particles from 'react-particles-js';
import axios from 'axios'
export default function Login(props) {

  const onFinish = (values) => {
    console.log(values)

    axios.get(`http://localhost:5000/users?username=${values.username}&password=${values.password}&roleState=true&_expand=role`).then(res => {
      console.log(res.data)
      if (res.data.length === 0) {
        message.error("用户名或密码不匹配")
      } else {
        // 将得到的数据存储到token中
        localStorage.setItem("token", JSON.stringify(res.data[0]))
        props.history.push("/")
      }
    })
  }
  return (
    <div style={{ background: 'rgb(35, 39, 65)', height: "100%", overflow: 'hidden' }}>
      {/* 一个粒子特效库 */}
      <Particles height={document.documentElement.clientHeight} params={
        {
          "background": {
            "color": {
              "value": "#000000"
            }
          },
          "fullScreen": {
            "zIndex": 1
          },
          "interactivity": {
            "events": {
              "onClick": {
                "enable": true,
                "mode": "push"
              },
              "onHover": {
                "enable": true,
                "mode": "repulse"
              }
            }
          },
          "particles": {
            "color": {
              "value": "#ff0000",
              "animation": {
                "h": {
                  "enable": true,
                  "speed": 20
                }
              }
            },
            "links": {
              "color": {
                "value": "#ffffff"
              },
              "enable": true,
              "opacity": 0.4
            },
            "move": {
              "enable": true,
              "outModes": {
                "bottom": "out",
                "left": "out",
                "right": "out",
                "top": "out"
              },
              "speed": 6
            },
            "number": {
              "density": {
                "enable": true
              },
              "value": 100
            },
            "opacity": {
              "value": 0.5
            },
            "size": {
              "value": {
                "min": 0.1,
                "max": 3
              }
            }
          }
        }
      } />
      <div className="formContainer">
        <div className="logintitle">全球新闻发布管理系统</div>
        <Form
          name="normal_login"
          className="login-form"
          // 提交表单且数据验证成功后回调事件,点击提交之后所有的表单内容都会在次收到
          onFinish={onFinish}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your Username!' }]}
          >
            <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your Password!' }]}
          >
            <Input
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="Password"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="login-form-button">
              登录
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}
