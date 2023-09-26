const ethers = require("ethers");
const sepBridgeABI = require("../utils/ABI/ethBridge.json");
const Web3 = require("web3")
// to burn tokens of Sepolia
 
async function main() {

  const privateKey = "488b4c368013bbb3feb381d2795a316bd1d2d153d49d150596bded29de46d202";
  const SepTokenAddress = "0xe3776C783e80aA18ab5d66B195F0CD79A7e6dA53";
  const SepBridgeAddress = "0x2b1568b44cfD197e1c8D8F650B6b64399C50b0C7";


  try {
    const web3 = new Web3("https://sepolia.infura.io/v3/9e9cdcaa2115404ba3a46fd15e888238");

    const sepProvider = new ethers.providers.JsonRpcProvider(
      "https://sepolia.infura.io/v3/9e9cdcaa2115404ba3a46fd15e888238"
    );
    const sepoliaWallet = new ethers.Wallet(privateKey, sepProvider);

    const sepBridgeContract = new ethers.Contract(SepBridgeAddress, sepBridgeABI.abi, sepoliaWallet);

    
    
    
    const nonce = await sepProvider.getTransactionCount("0x1cb0a69aA6201230aAc01528044537d0F9D718F3");
    console.log("burning Sepolia Tokens..."," nonce :",nonce);
    
    const account = "0x1cb0a69aA6201230aAc01528044537d0F9D718F3";
    const amount = "1000000000000000000";

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
    
    const ethMessage = ethers.utils.solidityKeccak256(
      ['address', 'address', 'uint256', 'uint256'],
      [account, account, amount, nonce]
    );

    const ethSignature = await sepoliaWallet.signMessage(ethers.utils.arrayify(ethMessage));

    console.log("Ether's Signature :  ", ethSignature, "\n");


    const response = await sepBridgeContract.burn(account, amount, nonce, ethSignature);
    console.log(response, "burned");

  }
  catch (error) {
    console.log("Unexpected Error happened!", error);
  }
}
main();