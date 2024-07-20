// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    // function to get price of ETH in terms of USD
    function getPrice(
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        // ETH in terms of USD
        // price has 8 decimal places (check chainlink documentation) msg.Value has 18 decimal places
        return uint256(price * 1e10); // 1**10
    }

    // function to get the conversion rate
    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 ethPrice = getPrice(priceFeed);
        return (ethAmount * ethPrice) / 1e18; // since both ethAmount and ethPrice have 18 decimals it would make it 36
    }
}
