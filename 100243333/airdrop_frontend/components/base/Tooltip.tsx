import "tippy.js/dist/tippy.css"; // optional

import Tippy from "@tippyjs/react";
import { ReactNode } from "react";

import { PopoverProps } from "./Popover";

interface TooltipProps extends Omit<PopoverProps, "content" | "show"> {
  text: ReactNode;
}

export default function Tooltip({ text, ...rest }: TooltipProps) {
  return (
    <Tippy content={<span className="text-xs">{text}</span>}>
      <div className="m-0 inline-flex p-0">{rest.children}</div>
    </Tippy>
  );
}
