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
	// Type Mapping = {
	//     tokenId: string;
	//     owner: string;
	//     assetId: string
	//   };

	/// /////////////////////////////////////////////////////
	const contractAddress = '0xcCb3F56AA3e998ee6A662EA822DCd3238C002933'
	const csvpath = '/Users/akira/dea/ERC721-migrate/scripts/tokens.csv'
	/// /////////////////////////////////////////////////////
	const account = await ethers.getSigners()
	const token = new Contract(contractAddress, abi, account[0])
	const array = await csv().fromFile(csvpath)
	const tmpData = []
	for (const data of array) {
		tmpData.push(data)
		// Oversized dataが発生するギリギリまでを設定する
		// transactionの格納されているdataが32KB以上の場合に発生
		// このエラーはDOS攻撃対策のためのエラー
		if (tmpData.length === 80) {
			// ガス設定したら100が限界
			// 25はデータ登録されない
			// 20はデータ登録される

			// gas 0だと90いける
			// あかんかったから80にした
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
	const args = []
	let first = 0
	let last = 0
	for (const tmp of tmpData) {
		if (first === 0) {
			first = tmp.tokenId
		}

		args.push({
			tokenId: tmp.tokenId,
			owner: tmp.holderAddress,
			assetId: tmp.assetId,
		})
		last = tmp.tokenId
	}

	console.log(`first:${first}:  last:${last}`)
	const now = new Date()
	console.log(now)
	const tx = await token.setNftData(args)
	await tx.wait()
	// Const owner = await token.ownerOf(last)
	// if (owner === ethers.constants.AddressZero) {
	// 	throw Error('data not found')
	// }
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})

// Npx hardhat run dist/scripts/import-owners.js --network private
