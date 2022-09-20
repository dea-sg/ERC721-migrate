/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable new-cap */

import { ethers } from 'hardhat'
import { abi } from '../artifacts/contracts/ERC721TokenUpgradable.sol/ERC721TokenUpgradable.json'

async function main() {
	/// /////////////////////////////////////////////////////
	const contractAddress = '0x7c72c6C5121F74a67D8dcC2d3FC419315a275334'
	const minterAddress = '0x219fbdec0e20ef46aadff75861747df9cd83c65f'
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

// Npx hardhat run dist/scripts/set-minter.js --network testPrivate
