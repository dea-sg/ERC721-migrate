/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ethers, upgrades } from 'hardhat'

async function main() {
	const tokenFactory = await ethers.getContractFactory('ERC721TokenUpgradable')
	const token = await upgrades.deployProxy(tokenFactory, [], { kind: 'uups' })
	await token.deployed()
	console.log('proxy was deployed to:', token.address)
	const filter = token.filters.Upgraded()
	const events = await token.queryFilter(filter)
	console.log('logic was deployed to:', events[0].args!.implementation)
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})

// Proxy was deployed to: 0x45B7d3a1187a8242dD7ae6CB1aDE9959cFE17fD3
// logic was deployed to: 0x848E40324046612317AEE3907B7D7Fe9a2F5f90a

// proxy was deployed to: 0xBa5FA098d36fbAdC0C21C31025180d05A7048126
// logic was deployed to: 0x848E40324046612317AEE3907B7D7Fe9a2F5f90a

// minterも忘れずに
// DummyURLを書き換える
