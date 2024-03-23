import { Options, Placement } from "@popperjs/core";
import React, {
  CSSProperties,
  forwardRef,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";
import { usePopper } from "react-popper";
import { useInterval } from "react-use";
import usePortal from "react-useportal";

import { classNames } from "@/lib/misc";

const PopoverContainer = forwardRef(
  (props: { show: boolean; children: ReactNode; style: any }, ref: any) => {
    const { show, children, style } = props;
    return (
      <div
        className={`z-[9999] text-sm text-[#272727] transition-opacity ${
          show ? "visible opacity-100" : "hidden opacity-0"
        }`}
        style={style}
        ref={ref}
      >
        {children}
      </div>
    );
  }
);
PopoverContainer.displayName = "PopoverContainer";

const Arrow = forwardRef((props: any, ref: any) => {
  const { placement = "top", style, ...restProps } = props;
  return (
    <div
      ref={ref}
      className={classNames(
        "z-[9998] h-2 w-2 before:absolute before:z-[9998] before:h-2 before:w-2 before:rotate-[45deg] before:transform before:border before:border-solid before:border-slate-200 before:bg-slate-100 before:content-['']",
        placement === "top"
          ? "-bottom-1 before:border-t-0 before:border-l-0"
          : placement === "bottom"
          ? "-top-1 before:border-b-0 before:border-r-0"
          : placement === "left"
          ? "-right-1 before:border-b-0 before:border-l-0"
          : placement === "right"
          ? "-left-1 before:border-t-0 before:border-r-0"
          : "-bottom-1 before:border-t-0 before:border-l-0"
      )}
      style={style}
      {...restProps}
    ></div>
  );
});
Arrow.displayName = "Arrow";

export interface PopoverProps {
  content: React.ReactNode;
  show: boolean;
  children?: React.ReactNode;
  placement?: Placement;
  offsetX?: number;
  offsetY?: number;
  hideArrow?: boolean;
  showInline?: boolean;
  style?: CSSProperties;
}

export default function Popover({
  content,
  show,
  children,
  placement = "auto",
  offsetX = 8,
  offsetY = 8,
  hideArrow = false,
  showInline = false,
  style,
}: PopoverProps) {
  const { Portal } = usePortal();
  const [referenceElement, setReferenceElement] =
    useState<HTMLDivElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null
  );
  const [arrowElement, setArrowElement] = useState<HTMLDivElement | null>(null);

  const options = useMemo(
    (): Options => ({
      placement,
      strategy: "fixed",
      modifiers: [
        { name: "offset", options: { offset: [offsetX, offsetY] } },
        { name: "arrow", options: { element: arrowElement } },
        { name: "preventOverflow", options: { padding: 8 } },
      ],
    }),
    [arrowElement, offsetX, offsetY, placement]
  );

  const { styles, update, attributes } = usePopper(
    referenceElement,
    popperElement,
    options
  );

  const updateCallback = useCallback(() => {
    update && update();
  }, [update]);
  useInterval(updateCallback, show ? 100 : null);

  return showInline ? (
    <PopoverContainer show={show} style={{}}>
      {content}
    </PopoverContainer>
  ) : (
    <>
      <div
        className="inline-block h-[inherit]"
        style={style}
        ref={setReferenceElement as any}
      >
        {children}
      </div>
      <Portal>
        <PopoverContainer
          show={show}
          ref={setPopperElement as any}
          style={styles.popper}
          {...attributes.popper}
        >
          {content}
          {!hideArrow && (
            <Arrow
              placement={attributes.popper?.["data-popper-placement"]}
              ref={setArrowElement as any}
              style={styles.arrow}
              {...attributes.arrow}
            />
          )}
        </PopoverContainer>
      </Portal>
    </>
  );
}
