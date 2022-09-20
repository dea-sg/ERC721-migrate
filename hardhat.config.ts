import '@nomicfoundation/hardhat-toolbox'
import '@openzeppelin/hardhat-upgrades'
import '@nomicfoundation/hardhat-chai-matchers'
import * as dotenv from 'dotenv'

dotenv.config()

const privateKey =
	typeof process.env.PRIVATE_KEY === 'undefined'
		? '0000000000000000000000000000000000000000000000000000000000000000'
		: process.env.PRIVATE_KEY

const privateNetworkUrl =
	process.env.PRIVATE_NETWORK_URL === 'undefined'
		? 'https://hogehoge'
		: process.env.PRIVATE_NETWORK_URL

const config = {
	solidity: {
		version: '0.8.9',
		settings: {
			optimizer: {
				enabled: true,
				runs: 200,
			},
		},
	},
	networks: {
		testPrivate: {
			url: privateNetworkUrl,
			accounts: [privateKey],
			gasPrice: 0,
		},
	},
}

export default config
