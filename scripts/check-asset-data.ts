/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { ethers } from 'hardhat'
import { abi } from '../artifacts/contracts/ERC721TokenUpgradable.sol/ERC721TokenUpgradable.json'

async function main() {
	/// /////////////////////////////////////////////////////
	const contractAddress = ''
	/// /////////////////////////////////////////////////////
	const account = await ethers.getSigners()
	const token = new ethers.Contract(contractAddress, abi, account[0])
	const asset1 = await token.getAssetData(1019)
	console.log(asset1)
	const asset2 = await token.getAssetData(464)
	console.log(asset2)
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
