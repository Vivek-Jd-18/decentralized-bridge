const ethers = require("ethers");
const polBridgeABI = require("../utils/ABI/polBridge.json");
const Web3 = require("web3")
// to burn tokens of Sepolia 
async function main() {

  // export const ethTokenAddress =  "0xe3776C783e80aA18ab5d66B195F0CD79A7e6dA53";
  // export const polTokenAddress =  "0xd56485Ec165a1344801A312190796f0Acb2bD073";
  // export const ethBridgeAddress = "0x2b1568b44cfD197e1c8D8F650B6b64399C50b0C7";
  // export const polBridgeAddress = "0x7Da23055DE1c200a836f4573c2b253e0f1e2b854";
  
  const privateKey = "488b4c368013bbb3feb381d2795a316bd1d2d153d49d150596bded29de46d202";
  const PolTokenAddress = "0xd56485Ec165a1344801A312190796f0Acb2bD073";
  const PolBridgeAddress = "0x7Da23055DE1c200a836f4573c2b253e0f1e2b854";


  try {
    const web3 = new Web3("https://rpc-mumbai.maticvigil.com");

    const polProvider = new ethers.providers.JsonRpcProvider(
      "https://rpc-mumbai.maticvigil.com"
    );
    const polygonWallet = new ethers.Wallet(privateKey, polProvider);

    const polBridgeContract = new ethers.Contract(PolBridgeAddress, polBridgeABI.abi, polygonWallet);

    console.log("burning Polygon Tokens..."," nonce :",nonce);

    const nonce = await polProvider.getTransactionCount("0x1cb0a69aA6201230aAc01528044537d0F9D718F3");

    const account = "0x1cb0a69aA6201230aAc01528044537d0F9D718F3";
    const amount = 100;

    const web3Message = web3.utils.soliditySha3(
      { t: 'address', v: account },
      { t: 'address', v: account },
      { t: 'uint256', v: amount },
      { t: 'uint256', v: nonce },
    ).toString('hex');

    const { signature } = web3.eth.accounts.sign(
      web3Message,
      privateKey
    );

    console.log("Web3's Signature :  ", signature, "\n");

    const ethMessage = ethers.utils.soliditySha256(
      ['address', 'address', 'uint256', 'uint256'],
      [account, account, amount, nonce]
    );

    const ethSignature = await polygonWallet.signMessage(ethers.utils.arrayify(ethMessage));

    console.log("Ether's Signature :  ", ethSignature, "\n");


    const response = await polBridgeContract.burn(account, amount, nonce, signature);
    console.log(response, "burned");

  }
  catch (error) {
    console.log("Unexpected Error happened!", error);
  }
}
main();