/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable new-cap */

import { ethers } from 'hardhat'
import { abi } from '../artifacts/contracts/ERC721TokenUpgradable.sol/ERC721TokenUpgradable.json'

async function main() {
	/// /////////////////////////////////////////////////////
	const contractAddress = '0xcCb3F56AA3e998ee6A662EA822DCd3238C002933'
	const minterAddress = '0xe1b73ac21f5e47e02e538a715ea76f5941b41d67'
	/// /////////////////////////////////////////////////////
	const account = await ethers.getSigners()
	const token = new ethers.Contract(contractAddress, abi, account[0])
	const minterRole = await token.MINTER_ROLE()
	await token.grantRole(minterRole, minterAddress)
	const hasRole = await token.hasRole(minterRole, minterAddress)
	console.log(`result:${hasRole}`)
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})

// npx hardhat run dist/scripts/set-minter.js --network private
