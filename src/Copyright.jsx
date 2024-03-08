import { Modal, Typography } from "antd";
import { forwardRef, memo, useImperativeHandle, useState } from "react";

const { Link, Text } = Typography;

export const Copyright = forwardRef(function Copyright(_, ref) {
  useImperativeHandle(ref, () => ({ show }));

  const [open, setOpen] = useState(false);

  const show = () => {
    setOpen(true);
  };

  const dismiss = () => {
    setOpen(false);
  };

  return (
    <Modal
      centered
      footer={null}
      open={open}
      title={`© ${new Date().getFullYear()} ${document.title}`}
      onCancel={dismiss}
    >
      <Text>
        Powered by{" "}
        <Link href="https://github.com/naiba/nezha" target="_blank">
          Nezha
        </Link>
        , Designed by{" "}
        <Link href="https://blog.amzayo.com" target="_blank">
          Amzayo
        </Link>
        {" & "}
        <Link href="https://github.com/reg233/nezha-theme-world-map" target="_blank">
          Reg233
        </Link>
      </Text>
    </Modal>
  );
});

export const MemoizedCopyright = memo(Copyright);
