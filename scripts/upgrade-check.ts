/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ethers } from 'hardhat'

async function main() {
	// アドレス確認！！！！
	// const proxyAddress = '0xb0071322db5fcda6dda03ae456524c3e5e5d07a3'
	const proxyAddress = '0x1f40cc97b4d5163eef61466859ce531c609cc492'
	const tokenFactory = await ethers.getContractFactory(
		'ERC721TokenUpgradableV2'
	)
	const token = tokenFactory.attach(proxyAddress)
	const filter = token.filters.Upgraded()
	const events = await token.queryFilter(filter)
	console.log(events.length)
	console.log('implementation to:', events[0].args!.implementation)
	console.log('implementation to:', events[1].args!.implementation)
	console.log('implementation to:', events[2].args!.implementation)
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
