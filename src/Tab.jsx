import { Tabs } from "antd";
import { isEqual } from "lodash-es";
import { memo, useEffect, useRef, useState } from "react";

export const Tab = memo(
  // eslint-disable-next-line react/prop-types
  function Tab({ items }) {
    const [isSticky, stickyRef] = useDetectSticky();

    return (
      <Tabs
        animated={false}
        indicator={{ align: "center", size: 16 }}
        items={items}
        renderTabBar={(props, DefaultTabBar) => (
          <div
            className={`ant-tabs-nav-sticky${isSticky ? " stickied" : ""}`}
            ref={stickyRef}
          >
            <DefaultTabBar {...props} />
          </div>
        )}
        tabBarGutter={0}
      />
    );
  },
  function propsAreEqual(prevProps, nextProps) {
    return isEqual(prevProps.items, nextProps.items);
  }
);

const useDetectSticky = (ref) => {
  const [isSticky, setIsSticky] = useState(false);
  const newRef = useRef();
  ref ||= newRef;

  useEffect(() => {
    const cachedRef = ref.current,
      observer = new IntersectionObserver(
        ([e]) => setIsSticky(e.boundingClientRect.top < 0),
        { threshold: [1] }
      );

    observer.observe(cachedRef);

    return () => {
      observer.unobserve(cachedRef);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [isSticky, ref, setIsSticky];
};
