const ethers = require("ethers");

const polBridgeABI = require("../utils/ABI/polBridge.json");
const sepBridgeABI = require("../utils/ABI/ethBridge.json");
// const { BinBridge } = require("../utils/address");

async function main() {

  const privateKey = "488b4c368013bbb3feb381d2795a316bd1d2d153d49d150596bded29de46d202";

  const SepTokenAddress = "0xe3776C783e80aA18ab5d66B195F0CD79A7e6dA53";
  const PolTokenAddress = "0xd56485Ec165a1344801A312190796f0Acb2bD073";
  const SepBridgeAddress = "0x2b1568b44cfD197e1c8D8F650B6b64399C50b0C7";
  const PolBridgeAddress = "0x7Da23055DE1c200a836f4573c2b253e0f1e2b854";


  const polProvider = new ethers.providers.JsonRpcProvider(
    "https://rpc-mumbai.maticvigil.com"
  );

  const sepProvider = new ethers.providers.JsonRpcProvider(
    "https://sepolia.infura.io/v3/9e9cdcaa2115404ba3a46fd15e888238"
  );

  const sepoliaWallet = new ethers.Wallet(privateKey, sepProvider);
  const polygonWallet = new ethers.Wallet(privateKey, polProvider);

  const sepBridgeContract = new ethers.Contract(SepBridgeAddress, sepBridgeABI.abi, sepoliaWallet);
  const polBridgeContract = new ethers.Contract(PolBridgeAddress, polBridgeABI.abi, polygonWallet);


  console.log("Listening Events for Eth to Polygon and Polygon to Eth Transfers ...");


  // 1) Ethereum to Polygon Listener
  sepBridgeContract.on("Transfer", async (from, to, amount, date, nonce, signature) => {
    console.log("Hoooorrrraaay, We've caught the fish...!");

    console.log(from, to,
      parseInt((amount?._hex).toString(), 16).toString(),
      parseInt((date?._hex).toString(), 16).toString(),
      parseInt((nonce?._hex).toString(), 16).toString(),
      signature, " Event data...! \n ");

    const data = polBridgeContract.interface.encodeFunctionData('mint', [from, to, amount, nonce,signature]);
    // to, uint amount, uint nonce, bytes calldata signature 
    let _gasCost = await polBridgeContract.estimateGas.mint(from, to, amount, nonce,signature);
    let _gasprice = await polProvider.getGasPrice();

    console.log(from, to, parseInt((amount?._hex).toString(), 16).toString(),
        parseInt((date?._hex).toString(), 16).toString(),
        parseInt((nonce?._hex).toString(), 16).toString(), _gasCost, _gasprice, "event data");


    let tx = {
        from: from,
        to: PolBridgeAddress,
        data,
        gasLimit: _gasCost,
        gasPrice: _gasprice,
    };
    console.log("transaction under Progress...");
    const receipt = await polygonWallet.sendTransaction(tx);
    console.log(`DEC ETH-POLYGON Transaction hash: ${receipt.hash}`);
  });


  // 2) Polygon to Ethereum Listener
  polBridgeContract.on("Transfer", async (from, to, amount, date, nonce) => {
    console.log("Hoooorrrraaay, We've caught the fish...!");

    const data = sepBridgeContract.interface.encodeFunctionData('mint', [to, amount, nonce]);
    let _gasCost = await sepBridgeContract.estimateGas.mint(to, amount, nonce);
    let _gasprice = await sepProvider.getGasPrice();

    console.log(from, to, parseInt((amount?._hex).toString(), 16).toString(),
      parseInt((date?._hex).toString(), 16).toString(),
      parseInt((nonce?._hex).toString(), 16).toString(), _gasCost, _gasprice, "event data");


    let tx = {
      from: from,
      to: SepBridgeAddress,
      data,
      gasLimit: _gasCost,
      gasPrice: _gasprice,
    };
    console.log("transaction under Progress...");
    const receipt = await sepoliaWallet.sendTransaction(tx);
    console.log(`ETH-POLYGON Transaction hash: ${receipt.hash}`);
  });
}

main();