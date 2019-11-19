import React from "react";
import Chart from "react-apexcharts";

function Widget({ data }) {
  const today = new Date();
  const dates = new Array(30)
    .fill()
    .map((item, index) => {
      const initialDate = new Date(today);
      initialDate.setDate(today.getDate() - index);
      return getMonthDateFormat(initialDate);
    })
    .reverse();

  const groupedTransactions = data.transactions.reduce((map, transaction) => {
    const key = getMonthDateFormat(new Date(transaction.timestamp));
    map[key] = map[key] ? map[key] + transaction.amount : transaction.amount;
    return map;
  }, {});

  let balance = 0;

  const chartValues = dates.map(date => {
    balance += groupedTransactions[date] || 0;
    return balance;
  });

  const chart = {
    options: {
      chart: {
        id: "basic-bar",
        width: 1024
      },
      xaxis: {
        categories: dates
      }
    },
    series: [
      {
        name: "Balance",
        data: chartValues
      }
    ]
  };

  return data.transactions.length ? (
    <div>
      {data.balance} {data.suffix}
      <Chart
        options={chart.options}
        series={chart.series}
        type="line"
        width="1280px"
      />
    </div>
  ) : null;
}

function getMonthDateFormat(date) {
  return date.getMonth() + 1 + "/" + date.getDate();
}

export default Widget;
