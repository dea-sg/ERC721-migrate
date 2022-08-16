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
	const csvpath = '/ERC721-migrate/test/asset.csv'
	/// /////////////////////////////////////////////////////
	const account = await ethers.getSigners()
	const token = new Contract(contractAddress, abi, account[0])
	const array = await csv().fromFile(csvpath)
	const tmpData = []
	for (const data of array) {
		tmpData.push(data)
		// ガス指定した場合、
		// 100にしてもエラーにはならないが、データは保存されない
		// テスト環境では30が限界だった

		// gas 0の場合、80はアウトで70はセーフ
		if (tmpData.length === 70) {
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
	let first = 0
	let last = 0
	for (const tmp of tmpData) {
		if (first === 0) {
			first = tmp.assetId
		}

		assetIds.push(tmp.assetId)
		assetDataList.push({
			totalNumberOfSerialId: tmp.totalNumberOfSerialId,
			assetName: tmp.assetName,
			uri: '',
		})
		last = tmp.assetId
	}

	console.log(`first:${first}:  last:${last}`)
	const now = new Date()
	console.log(now)
	const tx = await token.setAssetData(assetIds, assetDataList)
	await tx.wait()
	const assetData = await token.getAssetData(last)
	if (assetData.assetName === '') {
		throw Error('data not found')
	}
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
