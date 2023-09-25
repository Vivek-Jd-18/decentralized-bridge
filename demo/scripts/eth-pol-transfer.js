const ethers = require("ethers");
const sepBridgeABI = require("../utils/ABI/ethBridge.json");

// to burn tokens of Sepolia 
async function main() {

  const privateKey = "488b4c368013bbb3feb381d2795a316bd1d2d153d49d150596bded29de46d202";
  const SepTokenAddress = "0xe3776C783e80aA18ab5d66B195F0CD79A7e6dA53";
  const SepBridgeAddress = "0x2b1568b44cfD197e1c8D8F650B6b64399C50b0C7";
  try {


    const sepProvider = new ethers.providers.JsonRpcProvider(
      "https://sepolia.infura.io/v3/9e9cdcaa2115404ba3a46fd15e888238"
    );

    const sepoliaWallet = new ethers.Wallet(privateKey, sepProvider);

    const sepBridgeContract = new ethers.Contract(SepBridgeAddress, sepBridgeABI.abi, sepoliaWallet);

    console.log("burning Sepolia Tokens...");

    const nonce = 6;
    const account = "0x1cb0a69aA6201230aAc01528044537d0F9D718F3";
    const amount = 100;

    const message = ethers.utils.solidityKeccak256(
      ['address', 'address', 'uint256', 'uint256'], [account, account, amount, nonce]
    );

    const signature = await sepoliaWallet.signMessage(message);
    console.log("Signature","\n",signature,"\n");
    // const response = await sepBridgeContract.burn(account, amount, nonce, signature);
    // console.log(response, "burned");
  }
  catch (error) {
    console.log("Unexpected Error happened!",error);
  }
}
main();



















