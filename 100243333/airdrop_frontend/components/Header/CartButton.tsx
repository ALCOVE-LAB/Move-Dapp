import { ShoppingCartIcon } from "@heroicons/react/24/solid";

export default function CartButton() {
  return (
    <>
      <button className="relative inline-flex overflow-visible">
        <ShoppingCartIcon className="h-19 w-10" />
      </button>
    </>
  );
}
