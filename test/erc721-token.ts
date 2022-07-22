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
			const value = await token.name()
			expect(value.toString()).to.equal('Digital Art')
		})
	})
	describe('symbol', () => {
		it('check symbol', async () => {
			const symbol = await token.symbol()
			expect(symbol.toString()).to.equal('DAT')
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
})
