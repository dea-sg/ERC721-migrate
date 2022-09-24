/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable @typescript-eslint/restrict-template-expressions */

import { ethers } from 'hardhat'
import { abi } from '../artifacts/contracts/ERC721TokenUpgradable.sol/ERC721TokenUpgradable.json'

async function main() {
	/// /////////////////////////////////////////////////////
	const contractAddress = '0xB0071322dB5fcdA6DDA03aE456524C3E5E5D07A3'
	/// /////////////////////////////////////////////////////
	const account = await ethers.getSigners()
	const token = new ethers.Contract(contractAddress, abi, account[0])
	// Const totalSupply = await token.totalSupply()
	// console.log(`totalSupply:${totalSupply}`)
	// const tokenURI1 = await token.tokenURI(1080)
	// console.log(`tokenURI1:${tokenURI1}`)
	// const tokenURI2 = await token.tokenURI(361)
	// console.log(`tokenURI2:${tokenURI2}`)
	// const tokenId1 = await token.getTokenId(1080)
	// console.log(`tokenId1:${tokenId1}`)
	// const tokenId2 = await token.getTokenId(361)
	// console.log(`tokenId2:${tokenId2}`)
	const owner1 = await token.ownerOf(167100175)
	console.log(`owner1:${owner1}`)
	const owner2 = await token.ownerOf(167100075)
	console.log(`owner2:${owner2}`)
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
