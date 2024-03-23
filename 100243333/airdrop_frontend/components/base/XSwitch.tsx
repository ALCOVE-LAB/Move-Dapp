import { Switch } from "@headlessui/react";
import { useCallback, useEffect, useState } from "react";

import classNames from "@/lib/classNames";

interface SwitchProps {
  size?: "xs" | "sm" | "base" | "lg";
  checked?: boolean;
  defaultChecked?: boolean;
  onChange: (checked: boolean) => void;
}

export default function XSwitch({
  size = "base",
  checked,
  defaultChecked,
  onChange,
}: SwitchProps) {
  const [cachedChecked, setCachedChecked] = useState(false);

  useEffect(() => {
    if (typeof checked !== "undefined") {
      setCachedChecked(!!checked);
    } else if (typeof defaultChecked !== "undefined") {
      setCachedChecked(!!defaultChecked);
    }
  }, [checked, defaultChecked]);

  const handleChangeChecked = useCallback(
    (_checked: boolean) => {
      setCachedChecked(_checked);
      onChange(_checked);
    },
    [onChange]
  );

  return (
    <Switch
      checked={cachedChecked}
      onChange={handleChangeChecked}
      className={classNames(
        cachedChecked ? "bg-primary" : "bg-gray-200",
        "relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-0 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-0"
      )}
    >
      <span className="sr-only">Use setting</span>
      <span
        aria-hidden="true"
        className={classNames(
          cachedChecked ? "translate-x-5" : "translate-x-0",
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-slate-50 shadow ring-0 transition duration-200 ease-in-out"
        )}
      />
    </Switch>
  );
}
