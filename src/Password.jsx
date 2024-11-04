import { useRequest } from "ahooks";
import { Button, Input, message, Modal, Space } from "antd";
import { forwardRef, memo, useImperativeHandle, useState } from "react";

export const Password = forwardRef(function Password(_, ref) {
  useImperativeHandle(ref, () => ({ show }));

  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");

  const show = () => {
    setOpen(true);
  };

  const dismiss = () => {
    setOpen(false);
  };

  const { loading, run } = useRequest(
    async () => {
      const response = await fetch("/view-password", {
        body: JSON.stringify({ Password: password }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
        redirect: "follow",
      });
      return response.ok && response.redirected;
    },
    {
      manual: true,
      onSuccess: (data) => {
        if (data) {
          dismiss();
        } else {
          message.error("密码错误");
        }
      },
    }
  );

  return (
    <Modal centered footer={null} open={open} title="密码" onCancel={dismiss}>
      <Space.Compact style={{ marginTop: 8, width: "100%" }}>
        <Input.Password
          allowClear
          onChange={(e) => setPassword(e.target.value)}
          onPressEnter={run}
        />
        <Button
          disabled={!password}
          loading={loading}
          type="primary"
          onClick={run}
        >
          确认
        </Button>
      </Space.Compact>
    </Modal>
  );
});

export const MemoizedPassword = memo(Password);
