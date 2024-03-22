import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Spin } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { aptos } from "../utils/consts";
import {RawTicket} from "../utils/types";

import { ABI } from "../abi";
import SelectBall from "./SelectBall";
import Admin from "./admin";

export default function Content() {
  const [rawTickets, setRawTickets] = useState<RawTicket[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const { account } = useWallet();

  const accountAddr: `0x${string}` | null = account
    ? account.address.startsWith("0x")
      ? (account.address as `0x${string}`)
      : `0x${account.address}`
    : null;
  if (!!accountAddr && accountAddr === ABI.adm && !isAdmin) {
    setIsAdmin(accountAddr === ABI.adm);
  }
  const [transactionInProgress, setTransactionInProgress] =
    useState<boolean>(false);

  const fetchList = useCallback(async () => {
    if (!accountAddr) return [];
    try {
      const purchasedTickets = await aptos.getAccountResource({
        accountAddress: accountAddr,
        resourceType: `${ABI.address}::lottery::PurchasedTickets`,
      });
      let rawTickets: RawTicket[] =  purchasedTickets.tickets;
      console.log(rawTickets);
      setRawTickets(rawTickets);
      // setTasks(purchasedTickets.tickets as Task[]);
    } catch (e: any) {
    }
  }, [accountAddr]);

  useEffect(() => {
    fetchList();
  }, [account?.address, fetchList]);

  return (
      <div>
        <Spin spinning={transactionInProgress}>
          <SelectBall rawTickets={rawTickets}></SelectBall>
          {isAdmin && <Admin></Admin>}
        </Spin>

      </div>
  );
}
