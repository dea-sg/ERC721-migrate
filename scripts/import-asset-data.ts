/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { ethers } from 'hardhat'
import { abi } from './../artifacts/contracts/ERC721TokenUpgradable.sol/ERC721TokenUpgradable.json'
import csv from 'csvtojson'

async function main() {
	// Type AssetData = {
	//     assetId: string;
	//     totalNumber: string;
	//     name: string;
	//     uri: number;
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
				const assetIds = []
				const totalNumbers = []
				const names = []
				const uris = []
				for (const d of tmp) {
					assetIds.push(d.assetId)
					totalNumbers.push(d.totalNumber)
					names.push(d.name)
					uris.push(d.uri)
				}

				await token.setAssetData(assetIds, totalNumbers, names, uris)
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
