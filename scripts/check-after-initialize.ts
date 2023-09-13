/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/restrict-template-expressions */

import { ethers } from 'hardhat'
import { abi } from '../artifacts/contracts/ERC721TokenUpgradableV2.sol/ERC721TokenUpgradableV2.json'

async function main() {
	/// /////////////////////////////////////////////////////
	const contractAddress = '0xcCb3F56AA3e998ee6A662EA822DCd3238C002933'
	/// /////////////////////////////////////////////////////
	const account = await ethers.getSigners()
	const token = new ethers.Contract(contractAddress, abi, account[0])
	const name = await token.name()
	console.log(`name:${name}`)
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
