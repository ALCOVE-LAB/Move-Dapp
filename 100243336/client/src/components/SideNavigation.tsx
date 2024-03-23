'use client';

import Link from "next/link";
import { RocketIcon, FaceIcon, HomeIcon } from '@radix-ui/react-icons'
import { usePathname } from "next/navigation";

export default function SideNavigation() {
    const path = usePathname();

    return (
        <aside className="w-60 border-r border-gray-300 h-screen p-5 fixed left-0 bottom-0 top-0 bg-white">

            <div>
                <Link href={"/welcome"}>
                    <h1 className="font-bold text-2xl space-x-3 px-4">Neighbor</h1>
                    <h1 className="font-normal text-sm text-gray-400 px-4">Parking</h1>
                </Link>
            </div>
            <div className="mt-5">
                <ul>
                    <li className="mb-2">
                        <Link href={"/account"} className={`${path === "/account" ? 'bg-gray-100' : ''} hover:bg-gray-100 px-3 py-2 rounded text-gray-600 hover:text-gray-800 flex items-center gap-2`}>
                            <HomeIcon />
                            My Aptos Account
                        </Link>
                    </li>
                    <li className="mb-2">
                        <Link href={"/nft"} className={`${path === "/nft" ? 'bg-gray-100' : ''} hover:bg-gray-100 px-3 py-2 rounded text-gray-600 hover:text-gray-800 flex items-center gap-2`}>
                            <FaceIcon />
                            My Parking Slot
                        </Link>
                    </li>
                    <li className="mb-2">
                        <Link href={"/market"} className={`${path === "/market" ? 'bg-gray-100' : ''} hover:bg-gray-100 px-3 py-2 rounded text-gray-600 hover:text-gray-800 flex items-center gap-2`}>
                            <RocketIcon />
                            Buy Parking Slot
                        </Link>
                    </li>
                </ul>
            </div>
        </aside>
    );
}
