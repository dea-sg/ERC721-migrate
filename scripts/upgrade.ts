import { ethers, upgrades } from 'hardhat'

async function main() {
	// アドレス確認！！！！
	const proxyAddress = '0xcCb3F56AA3e998ee6A662EA822DCd3238C002933'
	const tokenFactory = await ethers.getContractFactory('ERC721TokenUpgradable')
	const token = await upgrades.upgradeProxy(proxyAddress, tokenFactory)
	console.log('proxy was deployed to:', token.address)
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
