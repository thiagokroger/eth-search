import React, { useState, useEffect } from "react";
import Widget from "./Widget";
import nec from "./contracts/nec";
import { getTokenAddressInfo } from "./eth";
import { exampleAddress } from "./constants";

function App() {
  const fromBlock = 6000 * 30; //average number of blocks in a month;
  const [address, setAddress] = useState("");

  const [{ data, isLoading }, search] = useEthAddressSearch(fromBlock, nec);

  const onSubmit = e => {
    if (address) {
      search(address);
    }
    e.preventDefault();
  };

  return (
    <div className="App">
      <form onSubmit={onSubmit}>
        <br />
        <label htmlFor="address">Ethereum Address:</label>
        <input
          type="text"
          id="address"
          onChange={e => setAddress(e.target.value)}
          value={address}
          size={64}
        />
        <br />
        <br />
        <br />
        <button onClick={() => setAddress(exampleAddress)}>
          Use example address
        </button>
        <button type="submit" disabled={!address}>
          Search
        </button>
      </form>
      <br />
      <hr />
      <br />
      {isLoading ? "Loading..." : <Widget data={data} />}
    </div>
  );
}

function useEthAddressSearch(fromBlock, tokenInfo) {
  const [address, setAddress] = useState("");
  const [data, setData] = useState({ transactions: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const search = () => {
    const fetchData = async () => {
      if (tokenInfo) {
        setIsError(false);
        setIsLoading(true);
        try {
          const result = await getTokenAddressInfo(
            address,
            tokenInfo,
            fromBlock
          );
          setIsLoading(false);
          setData(result);
        } catch (e) {
          console.log(e);
          setIsLoading(false);
          setIsError(true);
        }
      }
    };
    if (address) {
      fetchData();
    }
  };

  useEffect(search, [address]);
  return [{ data, isLoading, isError }, setAddress];
}

export default App;
