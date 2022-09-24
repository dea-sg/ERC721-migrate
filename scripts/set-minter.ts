/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable new-cap */

import { ethers } from 'hardhat'
import { abi } from '../artifacts/contracts/ERC721TokenUpgradable.sol/ERC721TokenUpgradable.json'

async function main() {
	/// /////////////////////////////////////////////////////
	const contractAddress = '0xB0071322dB5fcdA6DDA03aE456524C3E5E5D07A3'
	const minterAddress = '0x31ef290f34aadf560f686487099e63ab2fedb326'
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
