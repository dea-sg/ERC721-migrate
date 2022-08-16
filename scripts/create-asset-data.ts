/* eslint-disable @typescript-eslint/no-explicit-any */
import { createObjectCsvWriter } from 'csv-writer'
import { ObjectMap } from 'csv-writer/src/lib/lang/object'

async function main() {
	/// /////////////////////////////////////////////////////
	const filePath = '/ERC721-migrate/test/asset.csv'
	const recordCount = 1200
	/// /////////////////////////////////////////////////////
	const csvWriter = createObjectCsvWriter({
		path: filePath,
		header: [
			{ id: 'assetId', title: 'assetId' },
			{ id: 'totalNumberOfSerialId', title: 'totalNumberOfSerialId' },
			{ id: 'assetName', title: 'assetName' },
		],
		alwaysQuote: true,
		encoding: 'utf8',
	})
	const records: Array<ObjectMap<any>> = []
	for (let i = 0; i < recordCount; i++) {
		records.push({
			assetId: i.toString(),
			totalNumberOfSerialId: (i + 2).toString(),
			assetName: `name${i}`,
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
