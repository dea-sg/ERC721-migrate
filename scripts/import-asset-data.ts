/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { ethers } from 'hardhat'
import { Contract } from 'ethers'
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
	const token = new Contract(contractAddress, abi, account[0])
	const array = await csv().fromFile(csvpath)
	const tmpData = []
	for (const data of array) {
		tmpData.push(data)
		if (tmpData.length === 10000) {
			await insert(token, tmpData)
			tmpData.splice(0)
		}
	}

	if (tmpData.length === 0) {
		return
	}

	await insert(token, tmpData)
}

const insert = async (token: Contract, tmpData: any[]): Promise<void> => {
	const assetIds = []
	const assetDataList = []
	for (const tmp of tmpData) {
		assetIds.push(tmp.assetId)
		assetDataList.push({
			totalNumberOfSerialId: tmp.totalNumber,
			assetName: tmp.name,
			uri: '',
		})
	}

	await token.setAssetData(assetIds, assetDataList)
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
