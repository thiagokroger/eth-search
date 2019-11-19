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
  let transactions = deposits
    .concat(transfers)
    .sort((a, b) => b.blockNumber - a.blockNumber)
    .map(item => {
      const amount =
        item.returnValues._amount *
        Math.pow(10, -decimals) *
        (item.type === "in" ? 1 : -1);
      balance += amount;
      return {
        ...item,
        currentBlockNumber,
        amount,
        balance
      };
    });

  // I'm sure there's a way to improve this with batch requests or another way to calculate the timestamp
  for (let item of transactions) {
    const block = await eth.getBlock(item.blockNumber, false, () => {});
    item.timestamp = block.timestamp * 1000;
  }

  return { balance, transactions, suffix: tokenInfo.id };
};
