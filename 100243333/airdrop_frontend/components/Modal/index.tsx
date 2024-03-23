import { Dialog, Transition } from "@headlessui/react";
import { XCircleIcon, XMarkIcon } from "@heroicons/react/24/solid";
import React, { Fragment, ReactNode, useCallback, useMemo } from "react";
import toast from "react-hot-toast";

interface ModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  maxWidth?: string;
  minHeight?: string;
  maxHeight?: string;
  initialFocusRef?: React.RefObject<any>;
  title?: ReactNode;
  footerSlot?: React.ReactNode;
  children?: React.ReactNode;
}

export default function Modal({
  isOpen,
  onDismiss,
  maxWidth = "100%",
  minHeight = "0",
  maxHeight,
  initialFocusRef,
  title,
  children,
}: ModalProps) {
  const dialogStyle = useMemo(() => {
    return {
      maxWidth: `${maxWidth}`,
      minHeight: `${minHeight || 0}`,
      maxHeight: `${maxHeight}`,
    };
  }, [maxWidth, minHeight, maxHeight]);

  return (
    <>
      <Transition appear show={!!isOpen} as={Fragment}>
        <Dialog
          initialFocus={initialFocusRef}
          as="div"
          className="fixed inset-0 z-40 mx-auto overflow-y-auto"
          onClose={() => onDismiss()}
        >
          <div className="border-lighter flex min-h-screen items-center justify-center border px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-black/30 bg-opacity-40 transition-opacity" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div
                className={`my-8 flex w-full transform flex-col self-center rounded-lg bg-white text-left align-middle text-gray-800 shadow-xl transition-all ${
                  title ? "p-6" : ""
                } ${
                  maxHeight
                    ? "overflow-hidden overflow-y-scroll"
                    : " overflow-visible"
                }`}
                style={dialogStyle}
              >
                {title && (
                  <Dialog.Title
                    as="h3"
                    className="text-base font-bold leading-6"
                  >
                    {title}
                  </Dialog.Title>
                )}

                {children}
                {title && (
                  <button
                    className="btn absolute top-4 right-4 p-2 text-sm"
                    onClick={() => onDismiss()}
                  >
                    <XCircleIcon className="h-5 w-5 font-light" />
                  </button>
                )}
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
