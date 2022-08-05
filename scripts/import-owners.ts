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
	const args = []
	for (const tmp of tmpData) {
		args.push({
			tokenId: tmp.tokenId,
			owner: tmp.owner,
		})
	}

	await token.setNftData(args)
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
