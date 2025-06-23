import React from "react";
import { useRouter } from "next/router"; // dùng useRouter của next/router
import { Form, Input, Button, message } from "antd";
import axiosClient from "@/api/axiosClient";
import { setCookie } from 'cookies-next'; 

interface LoginFormValues {
  username: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const router = useRouter();

  const onFinish = async (values: LoginFormValues) => {
  try {
    const res = await axiosClient.post("/api/v1/Auth/sign-in", {
      username: values.username,
      password: values.password,
    });

    if (res.status === 200 && res.data.success) {
      setCookie('accessToken', res.data.result.accessToken, { maxAge: 60 * 60 * 24, path : '/' }); 
      console.log("Login response:", res.data);

      message.success("Đăng nhập thành công!");
      router.push("/");
    }
  } catch (error) {
    console.log("Lỗi API:", error); 
    message.error("Đăng nhập thất bại.");
  }
};

  const onFinishFailed = (errorInfo: any) => {
    console.log("Thất bại:", errorInfo);
    message.error("Vui lòng điền đầy đủ thông tin.");
  };

  return (
    <Form<LoginFormValues>
      name="login_form"
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
      layout="vertical"
    >
      <Form.Item
        label="Tên người dùng (địa chỉ email)"
        name="username"
        rules={[{ required: true, message: "Vui lòng nhập tên người dùng!" }]}
      >
        <Input placeholder="Tên người dùng (địa chỉ email)" size="large" />
      </Form.Item>

      <Form.Item
        label="Mật khẩu"
        name="password"
        rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
      >
        <Input.Password placeholder="Mật khẩu" size="large" />
      </Form.Item>

      <div className="forget-password">
        <a href="#">Quên mật khẩu?</a>
      </div>

      <Form.Item>
        <Button type="primary" htmlType="submit" size="large" block>
          Đăng Nhập
        </Button>
      </Form.Item>
    </Form>
  );
};

export default LoginForm;
