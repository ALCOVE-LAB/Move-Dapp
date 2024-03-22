export type Task = {
  address: string;
  completed: boolean;
  content: string;
};

export type RawTicket = {
  numeros: string,
  timestamp: number
}

export type Ticket = {
  red: number[],
  blue: number
}
export interface MintEvent {
  type?: string;
  data: MintEventData
}
export interface MintEventData  {
  numeros: string,
  owner: string,
  token_id: string
  timestamp: number
}
export interface Event {
  events: []
}

export interface LotteryResults {
  history: LotteryResult[]
}
export interface LotteryResult {
  blue: number,
  red: string,
  timestamp: number
}