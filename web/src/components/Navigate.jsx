import { Menu } from "antd";
import {
  InboxOutlined,
  IdcardOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { disconnectSocket } from "@/plugins/socket";

const Navigate = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleMenuSelect = ({ key }) => {
    if (key === "logout") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      disconnectSocket();
      window.dispatchEvent(new Event("auth-changed"));
      navigate("/");
    } else {
      navigate(key);
    }
  };

  return (
    <Menu
      mode="horizontal"
      theme="dark"
      selectedKeys={[location.pathname]}
      onClick={handleMenuSelect}
      items={[
        {
          key: "/products",
          icon: <InboxOutlined />,
          label: "Hàng",
        },
        {
          key: "/stages",
          icon: <InboxOutlined />,
          label: "Công đoạn",
        },
        {
          key: "/assigns",
          icon: <InboxOutlined />,
          label: "Phân công",
        },
        {
          key: "/workers",
          icon: <IdcardOutlined />,
          label: "Nhân công",
        },
        {
          key: "logout",
          icon: <LogoutOutlined />,
          label: "Đăng xuất",
          style: { marginLeft: "auto" },
        },
      ]}
      style={{
        display: "flex",
        width: "100%",
        alignItems: "center",
      }}
    />
  );
};

export default Navigate;