import { ethers, upgrades } from 'hardhat'

async function main() {
	// アドレス確認！！！！
	// const proxyAddress = '0xb0071322db5fcda6dda03ae456524c3e5e5d07a3'
	const proxyAddress = '0x1f40cc97b4d5163eef61466859ce531c609cc492'
	const tokenFactoryOld = await ethers.getContractFactory(
		'ERC721TokenUpgradable'
	)
	const tokenFactory = await ethers.getContractFactory(
		'ERC721TokenUpgradableV2'
	)
	await upgrades.forceImport(proxyAddress, tokenFactoryOld)
	const token = await upgrades.upgradeProxy(proxyAddress, tokenFactory)
	console.log('proxy was deployed to:', token.address)
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
