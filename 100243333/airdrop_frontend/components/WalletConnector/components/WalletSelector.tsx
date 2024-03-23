import { useWallet } from "@manahippo/aptos-wallet-adapter";
import { useMemo } from "react";

type TOptionProps = {
  onClick?: () => void;
  label: string;
  icon?: string;
};

const Option: React.FC<TOptionProps> = ({
  onClick,
  label,
  icon,
}: TOptionProps) => {
  return (
    <button
      onClick={onClick ? onClick : undefined}
      className="mt-2 flex w-full grow justify-start gap-2 rounded-[0px]"
    >
      <img
        src={icon}
        width={24}
        height={24}
        className="block rounded-full"
        alt=""
      />
      <div className="text-left font-bold">{label}</div>
    </button>
  );
};

const WalletSelector = ({ onConnected }: { onConnected: () => any }) => {
  const { wallets, select } = useWallet();

  const renderButtonGroup = useMemo(() => {
    return wallets.map((wallet) => {
      const option = wallet.adapter;
      return (
        <Option
          key={option.name}
          label={option.name}
          icon={option.icon}
          onClick={async () => {
            await select(option.name);
            onConnected();
          }}
        />
      );
    });
  }, [wallets, select, onConnected]);

  return (
    <div className="flex flex-col gap-6 px-0 py-4">
      <div className="flex flex-col gap-2">{renderButtonGroup}</div>
    </div>
  );
};

export default WalletSelector;
