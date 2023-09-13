/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/naming-convention */

import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Wallet } from 'ethers'
import {
	takeSnapshot,
	SnapshotRestorer,
} from '@nomicfoundation/hardhat-network-helpers'
import { ERC721TokenUpgradableV2, InterfaceIdTest } from '../typechain-types'

describe('ERC721Token', () => {
	let token: ERC721TokenUpgradableV2
	let snapshot: SnapshotRestorer
	before(async () => {
		const factory = await ethers.getContractFactory('ERC721TokenUpgradableV2')
		token = (await factory.deploy()) as ERC721TokenUpgradableV2
		await token.deployed()
		await token.initialize()
		snapshot = await takeSnapshot()
	})
	afterEach(async () => {
		await snapshot.restore()
	})

	const checkDefaultAssetData = async (assetId: number): Promise<void> => {
		const assetData = await token.getAssetData(assetId)
		expect(assetData.total_number).to.equal(0)
		expect(assetData.asset_name).to.equal('')
		expect(assetData.uri).to.equal('')
	}

	describe('transferFrom', () => {
		let user1: SignerWithAddress
		let user2: SignerWithAddress
		beforeEach(async () => {
			const accounts = await ethers.getSigners()

			user1 = accounts[1]
			user2 = accounts[2]
			await token.bulkMint(user1.address, 1, 'test name', 'test uri', 3)
		})
		it('if to address is 0, nft will be burn', async () => {
			const beforeBalance1 = await token.balanceOf(user1.address)
			expect(beforeBalance1).to.equal(3)
			const beforeOwner100001 = await token.ownerOf(100001)
			expect(beforeOwner100001).to.equal(user1.address)
			const beforeOwner100002 = await token.ownerOf(100002)
			expect(beforeOwner100002).to.equal(user1.address)
			const beforeOwner100003 = await token.ownerOf(100003)
			expect(beforeOwner100003).to.equal(user1.address)
			const beforeBalance2 = await token.balanceOf(user2.address)
			expect(beforeBalance2).to.equal(0)

			const beforeTokenURI100001 = await token.tokenURI(100001)
			expect(beforeTokenURI100001).to.equal('https://playmining.com/metadata/1')
			const beforeTokenURI100002 = await token.tokenURI(100002)
			expect(beforeTokenURI100002).to.equal('https://playmining.com/metadata/1')
			const beforeTokenURI100003 = await token.tokenURI(100003)
			expect(beforeTokenURI100003).to.equal('https://playmining.com/metadata/1')

			await token
				.connect(user1)
				.transferFrom(user1.address, ethers.constants.AddressZero, 100002)

			const afterBalance1 = await token.balanceOf(user1.address)
			expect(afterBalance1).to.equal(2)
			const afterOwner100001 = await token.ownerOf(100001)
			expect(afterOwner100001).to.equal(user1.address)
			const afterOwner100003 = await token.ownerOf(100003)
			expect(afterOwner100003).to.equal(user1.address)
			const afterBalance2 = await token.balanceOf(user2.address)
			expect(afterBalance2).to.equal(0)
			await expect(token.ownerOf(100002)).to.be.revertedWith(
				'ERC721: invalid token ID'
			)

			const afterTokenURI100001 = await token.tokenURI(100001)
			expect(afterTokenURI100001).to.equal('https://playmining.com/metadata/1')
			await expect(token.tokenURI(100002)).to.be.revertedWith(
				'ERC721: invalid token ID'
			)
			const afterTokenURI100003 = await token.tokenURI(100003)
			expect(afterTokenURI100003).to.equal('https://playmining.com/metadata/1')
		})
		it('if to address is not 0, nft will be transfer', async () => {
			const beforeBalance1 = await token.balanceOf(user1.address)
			expect(beforeBalance1).to.equal(3)
			const beforeOwner100001 = await token.ownerOf(100001)
			expect(beforeOwner100001).to.equal(user1.address)
			const beforeOwner100002 = await token.ownerOf(100002)
			expect(beforeOwner100002).to.equal(user1.address)
			const beforeOwner100003 = await token.ownerOf(100003)
			expect(beforeOwner100003).to.equal(user1.address)
			const beforeBalance2 = await token.balanceOf(user2.address)
			expect(beforeBalance2).to.equal(0)

			const beforeTokenURI100001 = await token.tokenURI(100001)
			expect(beforeTokenURI100001).to.equal('https://playmining.com/metadata/1')
			const beforeTokenURI100002 = await token.tokenURI(100002)
			expect(beforeTokenURI100002).to.equal('https://playmining.com/metadata/1')
			const beforeTokenURI100003 = await token.tokenURI(100003)
			expect(beforeTokenURI100003).to.equal('https://playmining.com/metadata/1')

			await token
				.connect(user1)
				.transferFrom(user1.address, user2.address, 100002)

			const afterBalance1 = await token.balanceOf(user1.address)
			expect(afterBalance1).to.equal(2)
			const afterOwner100001 = await token.ownerOf(100001)
			expect(afterOwner100001).to.equal(user1.address)
			const afterOwner100003 = await token.ownerOf(100003)
			expect(afterOwner100003).to.equal(user1.address)
			const afterBalance2 = await token.balanceOf(user2.address)
			expect(afterBalance2).to.equal(1)
			const afterOwner100002 = await token.ownerOf(100002)
			expect(afterOwner100002).to.equal(user2.address)

			const afterTokenURI100001 = await token.tokenURI(100001)
			expect(afterTokenURI100001).to.equal('https://playmining.com/metadata/1')
			const afterTokenURI100002 = await token.tokenURI(100002)
			expect(afterTokenURI100002).to.equal('https://playmining.com/metadata/1')
			const afterTokenURI100003 = await token.tokenURI(100003)
			expect(afterTokenURI100003).to.equal('https://playmining.com/metadata/1')
		})
	})

	describe('name', () => {
		it('check name', async () => {
			const name = await token.name()
			expect(name).to.equal('Digital Art')
		})
	})
	describe('symbol', () => {
		it('check symbol', async () => {
			const symbol = await token.symbol()
			expect(symbol).to.equal('DAT')
		})
	})

	describe('serialIdUpperLimit', () => {
		describe('success', () => {
			it('default', async () => {
				const serialIdUpperLimit = await token.serialIdUpperLimit()
				expect(serialIdUpperLimit).to.equal(99999)
			})
			it('change value', async () => {
				await token.setSerialIdUpperLimit(5)
				const serialIdUpperLimit = await token.serialIdUpperLimit()
				expect(serialIdUpperLimit).to.equal(5)
			})
		})
		describe('fail', () => {
			it('only owner', async () => {
				const account = await ethers.getSigners()
				const adminRole = await token.DEFAULT_ADMIN_ROLE()
				const sender = account[2]
				const msg = `AccessControl: account ${sender.address.toLowerCase()} is missing role ${adminRole}`
				await expect(
					token.connect(sender).setSerialIdUpperLimit(5)
				).to.be.revertedWith(msg)
			})
		})
	})

	describe('supportsInterface', () => {
		let interfaceIdTest: InterfaceIdTest
		beforeEach(async () => {
			const factory = await ethers.getContractFactory('InterfaceIdTest')
			interfaceIdTest = (await factory.deploy()) as InterfaceIdTest
			await interfaceIdTest.deployed()
		})
		it('ERC721TokenUpgradableV2', async () => {
			const interfaceId = await interfaceIdTest.getERC721TokenUpgradableV2Id()
			const result = await token.supportsInterface(interfaceId)
			expect(result).to.equal(true)
		})
		it('ERC721Upgradeable', async () => {
			const interfaceId = await interfaceIdTest.getERC721UpgradeableId()
			const result = await token.supportsInterface(interfaceId)
			expect(result).to.equal(true)
		})
		it('ERC1822ProxiableUpgradeable', async () => {
			const interfaceId =
				await interfaceIdTest.getERC1822ProxiableUpgradeableId()
			const result = await token.supportsInterface(interfaceId)
			expect(result).to.equal(true)
		})
		it('AccessControlEnumerableUpgradeable', async () => {
			const interfaceId =
				await interfaceIdTest.getAccessControlEnumerableUpgradeableId()
			const result = await token.supportsInterface(interfaceId)
			expect(result).to.equal(true)
		})
		it('not supported', async () => {
			const result = await token.supportsInterface('0x11223344')
			expect(result).to.equal(false)
		})
	})

	describe('tokenURI', () => {
		describe('success', () => {
			it('get token uri', async () => {
				const user = Wallet.createRandom()
				await token.bulkMint(user.address, 1, 'test name', 'test uri', 1)
				const result = await token.tokenURI(100001)
				expect(result).to.equal('https://playmining.com/metadata/1')
			})
		})
		describe('fail', () => {
			it('not minted token id', async () => {
				await expect(token.tokenURI(1)).to.be.revertedWith(
					'ERC721: invalid token ID'
				)
			})
		})
	})

	describe('getAssetData', () => {
		it('not minted', async () => {
			await checkDefaultAssetData(100001)
		})
		it('1 minted', async () => {
			const user = Wallet.createRandom()
			await token.bulkMint(user.address, 1, 'test name', 'test uri', 1)
			const assetData = await token.getAssetData(1)
			expect(assetData.total_number).to.equal(1)
			expect(assetData.asset_name).to.equal('test name')
			expect(assetData.uri).to.equal('https://playmining.com/metadata/1')
		})
		it('2 minted', async () => {
			const user = Wallet.createRandom()
			await token.bulkMint(user.address, 1, 'test name', 'test uri', 1)
			await token.bulkMint(user.address, 2, 'test name2', 'test uri2', 2)
			const assetData = await token.getAssetData(2)
			expect(assetData.total_number).to.equal(2)
			expect(assetData.asset_name).to.equal('test name2')
			expect(assetData.uri).to.equal('https://playmining.com/metadata/2')
		})
	})

	describe('bulkMint', () => {
		describe('success', () => {
			it('mint NFT', async () => {
				const user = Wallet.createRandom()
				const beforeBalance = await token.balanceOf(user.address)
				expect(beforeBalance).to.equal(0)
				await token.bulkMint(user.address, 1, 'token-name', 'toke uri', 1)
				const afterBalance = await token.balanceOf(user.address)
				expect(afterBalance).to.equal(1)
				const owner = await token.ownerOf(100001)
				expect(owner).to.equal(user.address)
				const afterTokenURI = await token.tokenURI(100001)
				expect(afterTokenURI).to.equal('https://playmining.com/metadata/1')
			})
			it('create asset data', async () => {
				const user = Wallet.createRandom()
				const beforeAssetData = await token.getAssetData(1)
				expect(beforeAssetData.total_number).to.equal(0)
				expect(beforeAssetData.asset_name).to.equal('')
				expect(beforeAssetData.uri).to.equal('')
				await token.bulkMint(user.address, 1, 'token-name', 'toke uri', 1)
				const afterAssetData = await token.getAssetData(1)
				expect(afterAssetData.total_number).to.equal(1)
				expect(afterAssetData.asset_name).to.equal('token-name')
				expect(afterAssetData.uri).to.equal('https://playmining.com/metadata/1')
			})
			it('create many asset data', async () => {
				const user = Wallet.createRandom()
				const beforeBalance = await token.balanceOf(user.address)
				expect(beforeBalance).to.equal(0)
				await token.bulkMint(user.address, 1, 'token-name', 'toke uri', 3)
				const afterBalance = await token.balanceOf(user.address)
				expect(afterBalance).to.equal(3)
				const owner1 = await token.ownerOf(100001)
				expect(owner1).to.equal(user.address)
				const owner2 = await token.ownerOf(100001)
				expect(owner2).to.equal(user.address)
				const owner3 = await token.ownerOf(100001)
				expect(owner3).to.equal(user.address)
				const tokenURI1 = await token.tokenURI(100001)
				expect(tokenURI1).to.equal('https://playmining.com/metadata/1')
				const tokenURI2 = await token.tokenURI(100002)
				expect(tokenURI2).to.equal('https://playmining.com/metadata/1')
				const tokenURI3 = await token.tokenURI(100003)
				expect(tokenURI3).to.equal('https://playmining.com/metadata/1')
			})
			it('added total number', async () => {
				const user = Wallet.createRandom()
				await token.bulkMint(user.address, 1, 'token-name', 'toke uri', 1)
				const beforeAssetData = await token.getAssetData(1)
				expect(beforeAssetData.total_number).to.equal(1)
				await token.bulkMint(user.address, 1, 'token-name', 'toke uri', 3)
				const afterAssetData = await token.getAssetData(1)
				expect(afterAssetData.total_number).to.equal(4)
			})
			it('added total number2', async () => {
				const accounts = await ethers.getSigners()
				const user = accounts[1]
				await token.bulkMint(user.address, 1, 'token-name', 'toke uri', 4)
				const beforeAssetData = await token.getAssetData(1)
				expect(beforeAssetData.total_number).to.equal(4)
				await token
					.connect(user)
					.transferFrom(user.address, ethers.constants.AddressZero, 100002)
				const afterAssetData = await token.getAssetData(1)
				expect(afterAssetData.total_number).to.equal(4)
			})
		})
		describe('fail', () => {
			it('has not minter role', async () => {
				const account = await ethers.getSigners()
				const mintRole = await token.MINTER_ROLE()
				const sender = account[2]
				const msg = `AccessControl: account ${sender.address.toLowerCase()} is missing role ${mintRole}`
				await expect(
					token
						.connect(account[2])
						.bulkMint(ethers.constants.AddressZero, 0, '', '', 0)
				).to.be.revertedWith(msg)
			})
			it('asset id is 0', async () => {
				await expect(
					token.bulkMint(ethers.constants.AddressZero, 0, '', '', 0)
				).to.be.revertedWith('the asset id is lower than 0')
			})
			it('total is 0', async () => {
				await expect(
					token.bulkMint(ethers.constants.AddressZero, 1, '', '', 0)
				).to.be.revertedWith('the number of running times is lower than 0')
			})
			it('address is 0', async () => {
				await expect(
					token.bulkMint(ethers.constants.AddressZero, 1, '', '', 1)
				).to.be.revertedWith('address is zero address')
			})
			it('name is empty', async () => {
				const user = Wallet.createRandom()
				await expect(
					token.bulkMint(user.address, 1, '', 'toke uri', 1)
				).to.be.revertedWith('asset name is empty')
			})
			it('name is different', async () => {
				const user = Wallet.createRandom()
				await token.bulkMint(user.address, 1, 'token-name', 'toke uri', 1)
				await expect(
					token.bulkMint(user.address, 1, 'token-name2', 'toke uri', 1)
				).to.be.revertedWith('asset name does not match')
			})
			it('over serial limit', async () => {
				const user = Wallet.createRandom()
				await token.setSerialIdUpperLimit(5)
				await token.bulkMint(user.address, 1, 'token-name', 'toke uri', 5)
				await expect(
					token.bulkMint(user.address, 1, 'token-name', 'toke uri', 1)
				).to.be.revertedWith('the total number of serial ids is out of bounds')
			})
		})
	})
	describe('setAssetData', () => {
		describe('success', () => {
			it('set asset data', async () => {
				await checkDefaultAssetData(1)
				await checkDefaultAssetData(2)
				await checkDefaultAssetData(3)
				await checkDefaultAssetData(4)

				await token.setAssetData(
					[1, 2],
					[
						{ totalNumberOfSerialId: 10, assetName: 'name1', uri: '' },
						{ totalNumberOfSerialId: 20, assetName: 'name2', uri: '' },
					]
				)
				await token.setAssetData(
					[3, 4],
					[
						{ totalNumberOfSerialId: 30, assetName: 'name3', uri: '' },
						{ totalNumberOfSerialId: 40, assetName: 'name4', uri: '' },
					]
				)

				const assetData1 = await token.getAssetData(1)
				expect(assetData1.total_number).to.deep.equal(10)
				expect(assetData1.asset_name).to.deep.equal('name1')
				expect(assetData1.uri).to.deep.equal(
					'https://playmining.com/metadata/1'
				)

				const assetData2 = await token.getAssetData(2)
				expect(assetData2.total_number).to.deep.equal(20)
				expect(assetData2.asset_name).to.deep.equal('name2')
				expect(assetData2.uri).to.deep.equal(
					'https://playmining.com/metadata/2'
				)

				const assetData3 = await token.getAssetData(3)
				expect(assetData3.total_number).to.deep.equal(30)
				expect(assetData3.asset_name).to.deep.equal('name3')
				expect(assetData3.uri).to.deep.equal(
					'https://playmining.com/metadata/3'
				)

				const assetData4 = await token.getAssetData(4)
				expect(assetData4.total_number).to.deep.equal(40)
				expect(assetData4.asset_name).to.deep.equal('name4')
				expect(assetData4.uri).to.deep.equal(
					'https://playmining.com/metadata/4'
				)
			})
		})
		describe('fail', () => {
			it('not owner', async () => {
				const account = await ethers.getSigners()
				const adminRole = await token.DEFAULT_ADMIN_ROLE()
				const sender = account[2]
				const msg = `AccessControl: account ${sender.address.toLowerCase()} is missing role ${adminRole}`
				await expect(
					token.connect(sender).setAssetData(
						[3, 4],
						[
							{ totalNumberOfSerialId: 30, assetName: 'name3', uri: '' },
							{ totalNumberOfSerialId: 40, assetName: 'name4', uri: '' },
						]
					)
				).to.be.revertedWith(msg)
			})
		})
	})
	describe('setNftData', () => {
		describe('success', () => {
			it('set id list', async () => {
				const user1 = Wallet.createRandom()
				const user2 = Wallet.createRandom()
				const user3 = Wallet.createRandom()
				const user4 = Wallet.createRandom()

				const beforeBalance1 = await token.balanceOf(user1.address)
				expect(beforeBalance1).to.deep.equal(0)
				const beforeBalance2 = await token.balanceOf(user2.address)
				expect(beforeBalance2).to.deep.equal(0)
				const beforeBalance3 = await token.balanceOf(user3.address)
				expect(beforeBalance3).to.deep.equal(0)
				const beforeBalance4 = await token.balanceOf(user4.address)
				expect(beforeBalance4).to.deep.equal(0)

				await token.setNftData([
					{ tokenId: 1, owner: user1.address, assetId: 10 },
					{ tokenId: 2, owner: user2.address, assetId: 20 },
				])
				await token.setNftData([
					{ tokenId: 3, owner: user3.address, assetId: 30 },
					{ tokenId: 4, owner: user4.address, assetId: 40 },
				])

				const afterBalance1 = await token.balanceOf(user1.address)
				expect(afterBalance1).to.deep.equal(1)
				const afterBalance2 = await token.balanceOf(user2.address)
				expect(afterBalance2).to.deep.equal(1)
				const afterBalance3 = await token.balanceOf(user3.address)
				expect(afterBalance3).to.deep.equal(1)
				const afterBalance4 = await token.balanceOf(user4.address)
				expect(afterBalance4).to.deep.equal(1)

				const owner1 = await token.ownerOf(1)
				expect(owner1).to.deep.equal(user1.address)
				const owner2 = await token.ownerOf(2)
				expect(owner2).to.deep.equal(user2.address)
				const owner3 = await token.ownerOf(3)
				expect(owner3).to.deep.equal(user3.address)
				const owner4 = await token.ownerOf(4)
				expect(owner4).to.deep.equal(user4.address)

				const uri1 = await token.tokenURI(1)
				expect(uri1).to.deep.equal('https://playmining.com/metadata/10')
				const uri2 = await token.tokenURI(2)
				expect(uri2).to.deep.equal('https://playmining.com/metadata/20')
				const uri3 = await token.tokenURI(3)
				expect(uri3).to.deep.equal('https://playmining.com/metadata/30')
				const uri4 = await token.tokenURI(4)
				expect(uri4).to.deep.equal('https://playmining.com/metadata/40')
			})
		})
		describe('fail', () => {
			it('not owner', async () => {
				const user1 = Wallet.createRandom()
				const user2 = Wallet.createRandom()
				const account = await ethers.getSigners()
				const adminRole = await token.DEFAULT_ADMIN_ROLE()
				const sender = account[2]
				const msg = `AccessControl: account ${sender.address.toLowerCase()} is missing role ${adminRole}`
				await expect(
					token.connect(sender).setNftData([
						{ tokenId: 100001, owner: user1.address, assetId: 10 },
						{ tokenId: 200001, owner: user2.address, assetId: 20 },
					])
				).to.be.revertedWith(msg)
			})
		})
	})
})
