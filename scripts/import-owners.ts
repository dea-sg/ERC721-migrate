/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { ethers } from 'hardhat'
import { abi } from './../artifacts/contracts/ERC721TokenUpgradable.sol/ERC721TokenUpgradable.json'
import csv from 'csvtojson'

async function main() {
	// Type Mapping = {
	//     tokenId: string;
	//     owner: string;
	//   };

	/// /////////////////////////////////////////////////////
	const contractAddress = ''
	const csvpath = ''
	/// /////////////////////////////////////////////////////
	const account = await ethers.getSigners()
	const token = new ethers.Contract(contractAddress, abi, account[0])
	const array = await csv().fromFile(csvpath)
	const tmpData = []
	for (const data of array) {
		tmpData.push(data)
		if (tmpData.length === 10000) {
			for (const tmp of tmpData) {
				const tokenIds = []
				const owners = []
				for (const d of tmp) {
					tokenIds.push(d.tokenId)
					owners.push(d.owner)
				}

				await token.setNftData(tokenIds, owners)
				await token.setTokenIds(tokenIds)
			}

			tmpData.splice(0)
		}
	}
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
