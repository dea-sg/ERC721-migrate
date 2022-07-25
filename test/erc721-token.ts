/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/naming-convention */

import { expect } from 'chai'
import { ethers } from 'hardhat'
import { Wallet } from 'ethers'
import {
	takeSnapshot,
	SnapshotRestorer,
} from '@nomicfoundation/hardhat-network-helpers'
import { ERC721TokenUpgradable, InterfaceIdTest } from '../typechain-types'

describe('ERC721Token', () => {
	let token: ERC721TokenUpgradable
	let snapshot: SnapshotRestorer
	before(async () => {
		const factory = await ethers.getContractFactory('ERC721TokenUpgradable')
		token = (await factory.deploy()) as ERC721TokenUpgradable
		await token.deployed()
		await token.initialize()
		snapshot = await takeSnapshot()
	})
	afterEach(async () => {
		await snapshot.restore()
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
		it('ERC721TokenUpgradable', async () => {
			const interfaceId = await interfaceIdTest.getERC721TokenUpgradableId()
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

	describe('totalSupply', () => {
		it('dfault is 0', async () => {
			const result = await token.totalSupply()
			expect(result).to.equal(0)
		})
		it('count mint NFT', async () => {
			const user = Wallet.createRandom()
			await token.bulkMint(user.address, 1, 'test name', 'test uri', 1)
			const result = await token.totalSupply()
			expect(result).to.equal(1)
		})
	})

	describe('tokenURI', () => {
		describe('success', () => {
			it('get token uri', async () => {
				const user = Wallet.createRandom()
				await token.bulkMint(user.address, 1, 'test name', 'test uri', 1)
				const result = await token.tokenURI(100001)
				expect(result).to.equal('test uri')
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

	describe('getTokenId', () => {
		describe('success', () => {
			it('get token id', async () => {
				const user = Wallet.createRandom()
				await token.bulkMint(user.address, 1, 'test name', 'test uri', 1)
				const result = await token.getTokenId(0)
				expect(result).to.equal(100001)
			})
		})
		describe('fail', () => {
			it('dfault is 0', async () => {
				await expect(token.getTokenId(5)).to.be.revertedWith(
					'index out of bounds'
				)
			})
		})
	})

	describe('getTokenList', () => {
		describe('success', () => {
			it('1 minted', async () => {
				const user = Wallet.createRandom()
				await token.bulkMint(user.address, 1, 'test name', 'test uri', 1)
				const tokens = await token.getTokenList(0, 0)
				expect(tokens).to.deep.equal([100001])
			})
			it('many minted', async () => {
				const user = Wallet.createRandom()
				await token.bulkMint(user.address, 1, 'test name', 'test uri', 1)
				await token.bulkMint(user.address, 2, 'test name', 'test uri', 3)
				const tokens = await token.getTokenList(0, 3)
				expect(tokens).to.deep.equal([100001, 200001, 200002, 200003])
			})
			it('many many minted', async () => {
				const user = Wallet.createRandom()
				await token.bulkMint(user.address, 1, 'test name', 'test uri', 3)
				await token.bulkMint(user.address, 2, 'test name', 'test uri', 4)
				await token.bulkMint(user.address, 1, 'test name', 'test uri', 2)
				const tokens = await token.getTokenList(2, 7)
				expect(tokens).to.deep.equal([
					100003, 200001, 200002, 200003, 200004, 100004,
				])
			})
		})
		describe('fail', () => {
			it('range error', async () => {
				await expect(token.getTokenList(5, 3)).to.be.revertedWith(
					'input range error'
				)
			})
			it('end < totalSupply', async () => {
				await expect(token.getTokenList(3, 5)).to.be.revertedWith(
					'index out of bounds'
				)
			})
		})
	})

	describe('getOwnerTokenList', () => {
		describe('success', () => {
			it('1 minted', async () => {
				const user = Wallet.createRandom()
				await token.bulkMint(user.address, 1, 'test name', 'test uri', 1)
				const tokenIdList = await token.getOwnerTokenList(user.address)
				expect(tokenIdList).to.deep.equal([100001])
			})
			it('many minted', async () => {
				const user = Wallet.createRandom()
				await token.bulkMint(user.address, 1, 'test name', 'test uri', 1)
				await token.bulkMint(user.address, 2, 'test name', 'test uri', 3)
				const tokenIdList = await token.getOwnerTokenList(user.address)
				expect(tokenIdList).to.deep.equal([100001, 200001, 200002, 200003])
			})
			it('many many minted', async () => {
				const user = Wallet.createRandom()
				const user2 = Wallet.createRandom()
				await token.bulkMint(user.address, 1, 'test name', 'test uri', 3)
				await token.bulkMint(user2.address, 2, 'test name', 'test uri', 4)
				await token.bulkMint(user.address, 3, 'test name', 'test uri', 2)
				const user1Tokens = await token.getOwnerTokenList(user.address)
				expect(user1Tokens).to.deep.equal([
					100001, 100002, 100003, 300001, 300002,
				])
				const user2Tokens = await token.getOwnerTokenList(user2.address)
				expect(user2Tokens).to.deep.equal([200001, 200002, 200003, 200004])
			})
		})
		describe('fail', () => {
			it('address zero', async () => {
				await expect(
					token.getOwnerTokenList(ethers.constants.AddressZero)
				).to.be.revertedWith('address is zero address')
			})
		})
	})
	describe('getAssetData', () => {
		describe('success', () => {
			it('not minted', async () => {
				const assetData = await token.getAssetData(100001)
				expect(assetData.total_number).to.equal(0)
				expect(assetData.asset_name).to.equal('')
				expect(assetData.uri).to.equal('')
			})
			it('1 minted', async () => {
				const user = Wallet.createRandom()
				await token.bulkMint(user.address, 1, 'test name', 'test uri', 1)
				const assetData = await token.getAssetData(1)
				expect(assetData.total_number).to.equal(1)
				expect(assetData.asset_name).to.equal('test name')
				expect(assetData.uri).to.equal('test uri')
			})
			it('2 minted', async () => {
				const user = Wallet.createRandom()
				await token.bulkMint(user.address, 1, 'test name', 'test uri', 1)
				await token.bulkMint(user.address, 2, 'test name2', 'test uri2', 2)
				const assetData = await token.getAssetData(2)
				expect(assetData.total_number).to.equal(2)
				expect(assetData.asset_name).to.equal('test name2')
				expect(assetData.uri).to.equal('test uri2')
			})
		})
	})

	describe('bulkMint', () => {
		describe('success', () => {
			it('mint NFT', async () => {
				const user = Wallet.createRandom()
				const beforeCount = await token.totalSupply()
				expect(beforeCount).to.equal(0)
				const beforeBalance = await token.balanceOf(user.address)
				expect(beforeBalance).to.equal(0)
				await token.bulkMint(user.address, 1, 'token-name', 'toke uri', 1)
				const afterCount = await token.totalSupply()
				expect(afterCount).to.equal(1)
				const afterBalance = await token.balanceOf(user.address)
				expect(afterBalance).to.equal(1)
				const owner = await token.ownerOf(100001)
				expect(owner).to.equal(user.address)
				const beforeTokenURI = await token.tokenURI(100001)
				expect(beforeTokenURI).to.equal('toke uri')
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
				expect(afterAssetData.uri).to.equal('toke uri')
			})
			it('create many asset data', async () => {
				const user = Wallet.createRandom()
				const beforeCount = await token.totalSupply()
				expect(beforeCount).to.equal(0)
				const beforeBalance = await token.balanceOf(user.address)
				expect(beforeBalance).to.equal(0)
				await token.bulkMint(user.address, 1, 'token-name', 'toke uri', 3)
				const afterCount = await token.totalSupply()
				expect(afterCount).to.equal(3)
				const afterBalance = await token.balanceOf(user.address)
				expect(afterBalance).to.equal(3)
				const owner1 = await token.ownerOf(100001)
				expect(owner1).to.equal(user.address)
				const owner2 = await token.ownerOf(100001)
				expect(owner2).to.equal(user.address)
				const owner3 = await token.ownerOf(100001)
				expect(owner3).to.equal(user.address)
				const tokenURI1 = await token.tokenURI(100001)
				expect(tokenURI1).to.equal('toke uri')
				const tokenURI2 = await token.tokenURI(100002)
				expect(tokenURI2).to.equal('toke uri')
				const tokenURI3 = await token.tokenURI(100003)
				expect(tokenURI3).to.equal('toke uri')
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
			it('toke uri is empty', async () => {
				const user = Wallet.createRandom()
				await expect(
					token.bulkMint(user.address, 1, '', '', 1)
				).to.be.revertedWith('URI is empty')
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
			it('toke uri is different', async () => {
				const user = Wallet.createRandom()
				await token.bulkMint(user.address, 1, 'token-name', 'toke uri', 1)
				await expect(
					token.bulkMint(user.address, 1, 'token-name', 'toke uri2', 1)
				).to.be.revertedWith('URI does not match')
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
})
