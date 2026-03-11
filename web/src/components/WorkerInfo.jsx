import { Card, Row, Col, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";

export default function WorkerInfo({ worker }) {
  if (!worker) return null;

  return (
    <Card style={{ marginBottom: 16 }}>
      <Row gutter={24} align="middle">
        
        {/* AVATAR */}
        <Col>
          <Avatar
            size={90}
            icon={<UserOutlined />}
            src={worker.avatar || "https://i.pravatar.cc/150?img=3"} // tmp
          />
        </Col>

        {/* INFO */}
        <Col flex="auto">
          <div style={{ fontSize: 20, fontWeight: 600 }}>
            {worker.name}
          </div>

          <div>SĐT: {worker.phone}</div>
          <div>Địa chỉ: {worker.address || "—"}</div>
          <div>Vai trò: {worker.role}</div>
        </Col>
      </Row>
    </Card>
  );
}