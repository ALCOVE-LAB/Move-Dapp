import { MagnifyingGlassIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { CompositionEvent, useCallback, useEffect, useState } from "react";

interface SearchBoxProps {
  className?: string;
  value?: string;
  disabled?: boolean;
  placeholder?: string;
  onChange?: (value: string | undefined) => void;
}
export default function SearchBox({
  className,
  value,
  placeholder,
  disabled,
  onChange,
}: SearchBoxProps) {
  const [q, setQ] = useState<string>("");
  const [isComposition, setIsComposition] = useState(false);

  useEffect(() => {
    setQ(value || "");
  }, [value]);

  const onBlur = (event: any) => {
    if (!isComposition) {
      setQ((prevQ) => prevQ.trim());
      onChange && onChange(q.trim());
    }
  };

  const onKeyDown = (event: any) => {
    if (event.key === "Enter") {
      // Cancel the default action, if needed
      event.preventDefault();
      // Trigger the button element with a click
      if (!isComposition) {
        onChange && onChange(q.trim());
      }
    }
  };

  const handleComposition = (ev: CompositionEvent<HTMLInputElement>) => {
    setIsComposition(ev.type === "compositionend" ? false : true);
  };

  const onClear = useCallback(() => {
    setQ("");
    onChange && onChange("");
  }, [onChange]);

  return (
    <div className={className}>
      <div className="group relative flex w-full items-center">
        <input
          placeholder={placeholder || "Search Collections"}
          className={`w-full rounded-md border-0 border-border bg-input-bg-default py-2 pr-3 pl-8 text-sm leading-6 shadow-sm hover:border-border-hover focus:border-border-focus ${
            disabled ? " cursor-not-allowed opacity-50" : ""
          }`}
          type="text"
          value={q}
          disabled={disabled}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKeyDown}
          onCompositionStart={handleComposition}
          onCompositionEnd={handleComposition}
        />
        {q && (
          <button
            onClick={onClear}
            className="invisible absolute top-1/2 right-0 -translate-y-1/2 transform p-2 group-hover:visible"
          >
            <XCircleIcon className="h-4 w-4" />
          </button>
        )}
        <MagnifyingGlassIcon
          className={`visible absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 transform`}
        />
      </div>
    </div>
  );
}
