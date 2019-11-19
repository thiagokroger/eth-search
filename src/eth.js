import Eth from "web3-eth";
import Utils from "web3-utils";
import { apiUrl } from "./constants";

export const getContractEventsByAddress = async (
  contract,
  eventName,
  address,
  fromBlock
) => {
  const transferTopic = Utils.sha3("Transfer(address,address,uint256)");

  const transferEvents = await contract.getPastEvents("Transfer", {
    fromBlock,
    filter: {
      isError: 0,
      txreceipt_status: 1
    },
    topics: [
      transferTopic,
      eventName === "in" ? null : address,
      eventName === "in" ? address : null
    ]
  });

  return transferEvents.map(item => ({ ...item, type: eventName }));
};

export const getTokenAddressInfo = async (ethAddress, tokenInfo, fromBlock) => {
  const { address, abi, decimals } = tokenInfo;
  const eth = new Eth(apiUrl);

  const currentBlockNumber = await eth.getBlockNumber();
  // if no block to start looking from is provided, look at tx from the last day
  // 86400s in a day / eth block time 10s ~ 8640 blocks a day
  fromBlock = currentBlockNumber - fromBlock;

  const contract = new eth.Contract(abi, address);

  const deposits = await getContractEventsByAddress(
    contract,
    "in",
    Utils.padLeft(ethAddress, 64),
    fromBlock
  );
  const transfers = await getContractEventsByAddress(
    contract,
    "out",
    Utils.padLeft(ethAddress, 64),
    fromBlock
  );

  let balance = 0;
  const transactions = deposits
    .concat(transfers)
    .sort((a, b) => b.blockNumber - a.blockNumber)
    .map(item => {
      const amount = item.returnValues._amount * Math.pow(10, -decimals);
      balance += item.type === "in" ? amount : -amount;
      return {
        ...item,
        amount,
        balance
      };
    });

  return { balance, transactions };
};
