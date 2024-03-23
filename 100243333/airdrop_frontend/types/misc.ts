export enum Network {
  Devnet = "Devnet",
  Testnet = "Testnet",
  Mainnet = "Mainnet",
}

export interface ICoinInfo {
  name: string;
  symbol: string;
  official_symbol?: string;
  coingecko_id?: string;
  decimals: number;
  logo_url?: string;
  project_url?: string;
  token_type: {
    type: string;
    account_address: string;
    module_name: string;
    struct_name: string;
  };
  extensions?: {
    data: [];
  };
}
