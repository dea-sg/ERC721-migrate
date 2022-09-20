/* eslint-disable @typescript-eslint/no-explicit-any */
import { createObjectCsvWriter } from 'csv-writer'
import { ObjectMap } from 'csv-writer/src/lib/lang/object'
import { Wallet } from 'ethers'

async function main() {
	/// /////////////////////////////////////////////////////
	const filePath = '/Users/akira/dea/ERC721-migrate/test/token_holder.csv'
	const recordCount = 650000
	/// /////////////////////////////////////////////////////
	const csvWriter = createObjectCsvWriter({
		path: filePath,
		header: [
			{ id: 'tokenId', title: 'tokenId' },
			{ id: 'holderAddress', title: 'holderAddress' },
			{ id: 'assetId', title: 'assetId' },
		],
		alwaysQuote: true,
		encoding: 'utf8',
	})
	const records: Array<ObjectMap<any>> = []
	const wallets = [
		Wallet.createRandom(),
		Wallet.createRandom(),
		Wallet.createRandom(),
		Wallet.createRandom(),
		Wallet.createRandom(),
		Wallet.createRandom(),
		Wallet.createRandom(),
		Wallet.createRandom(),
		Wallet.createRandom(),
		Wallet.createRandom(),
	]
	for (let i = 0; i < recordCount; i++) {
		const tmp = Math.floor(i / 1) % 10
		records.push({
			tokenId: i.toString(),
			holderAddress: wallets[tmp].address,
			assetId: (i + 5).toString(),
		})
	}

	await csvWriter.writeRecords(records)
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})

// Npx hardhat run dist/scripts/create-nft-data.js --network testPrivate
