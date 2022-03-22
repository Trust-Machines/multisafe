import fs from "fs";
import { makeSafeContract } from "./index";

test("makeSafeContract mainnet", () => {
    const code = fs.readFileSync("contracts/safe.clar", { encoding: "utf-8" });
    const owners = [
        "SP3XD84X3PE79SHJAZCDW1V5E9EA8JSKRBPEKAEK7",
        "SP2DXHX9Q844EBT80DYJXFWXJKCJ5FFAX50CQQAWN",
        "SP2N7SK0W83NJSZHFH8HH31ZT3DXJG7NFE5VYT9SJ"
    ];

    expect(makeSafeContract(code, owners, 2, "mainnet")).toMatchSnapshot();
});


test("makeSafeContract testnet", () => {
    const code = fs.readFileSync("contracts/safe.clar", { encoding: "utf-8" });
    const owners = [
        "SP3XD84X3PE79SHJAZCDW1V5E9EA8JSKRBPEKAEK7",
        "SP2DXHX9Q844EBT80DYJXFWXJKCJ5FFAX50CQQAWN",
        "SP2N7SK0W83NJSZHFH8HH31ZT3DXJG7NFE5VYT9SJ"
    ];

    expect(makeSafeContract(code, owners, 2, "testnet")).toMatchSnapshot();
});