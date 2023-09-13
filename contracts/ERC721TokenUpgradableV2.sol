// SPDX-License-Identifier: MPL-2.0
pragma solidity =0.8.16;

import {IERC1822ProxiableUpgradeable} from "@openzeppelin/contracts-upgradeable/interfaces/draft-IERC1822Upgradeable.sol";
import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {AccessControlEnumerableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import {StringsUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import {IERC721TokenUpgradableV2} from "./IERC721TokenUpgradableV2.sol";

contract ERC721TokenUpgradableV2 is
	UUPSUpgradeable,
	AccessControlEnumerableUpgradeable,
	ERC721Upgradeable,
	IERC721TokenUpgradableV2
{
	using StringsUpgradeable for uint256;
	bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
	//桁設定
	uint256 private constant SERIAL_ID_DECIMAL = 5;
	//基数設定
	uint256 private constant ASSET_ID_CARDINAL_NUMBER =
		10 ** uint256(SERIAL_ID_DECIMAL);
	uint256 public serialIdUpperLimit;
	mapping(uint256 => string) private _tokenURIs;
	// 互換のため、命名規則は無視
	// solhint-disable-next-line var-name-mixedcase
	mapping(uint256 => AssetData) public asset_info; //asset id => AssetData
	//生成したトークンIDリスト
	uint256[] private tokenList; // unuse、proxyパターンで記述しているため、削除できない

	function initialize() public initializer {
		__UUPSUpgradeable_init();
		__ERC721_init("Digital Art", "DAT");
		__AccessControlEnumerable_init();
		_setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
		_setupRole(MINTER_ROLE, _msgSender());
		serialIdUpperLimit = (10 ** uint256(SERIAL_ID_DECIMAL)) - 1;
	}

	function supportsInterface(
		bytes4 _interfaceId
	)
		public
		view
		override(ERC721Upgradeable, AccessControlEnumerableUpgradeable)
		returns (bool)
	{
		return
			_interfaceId == type(IERC721TokenUpgradableV2).interfaceId ||
			_interfaceId == type(IERC1822ProxiableUpgradeable).interfaceId ||
			AccessControlEnumerableUpgradeable.supportsInterface(
				_interfaceId
			) ||
			ERC721Upgradeable.supportsInterface(_interfaceId);
	}

	function tokenURI(
		uint256 _tokenId
	) public view virtual override returns (string memory) {
		_requireMinted(_tokenId);
		string memory tokenURI_ = _tokenURIs[_tokenId];

		// Even if there is a base URI, it is only appended to non-empty token-specific URIs
		if (bytes(tokenURI_).length == 0) {
			return "";
		} else {
			// abi.encodePacked is being used to concatenate strings
			return string(abi.encodePacked(_baseURI(), tokenURI_));
		}
	}

	function _baseURI() internal view virtual override returns (string memory) {
		return "https://playmining.com/metadata/";
	}

	function _transfer(
		address from,
		address to,
		uint256 tokenId
	) internal override {
		if (to == address(0)) {
			_burn(tokenId);
			delete _tokenURIs[tokenId];
			return;
		}
		super._transfer(from, to, tokenId);
	}

	/**
	 * @dev assetの名と同じasset idのトークン数量を取得する
	 *      互換を保つため、戻り値の変数名はそのまま
	 * @param _assetId uint256
	 * @return total_number uint256 紐づけシリアル数量
	 * @return asset_name string assetの名
	 * @return uri string
	 */
	function getAssetData(
		uint256 _assetId
	)
		public
		view
		returns (
			// solhint-disable-next-line var-name-mixedcase
			uint256 total_number,
			// solhint-disable-next-line var-name-mixedcase
			string memory asset_name,
			string memory uri
		)
	{
		AssetData storage assetData = asset_info[_assetId];

		return (
			assetData.totalNumberOfSerialId,
			assetData.assetName,
			assetData.uri
		);
	}

	/**
	 * @dev トークンをミント、管理者しか使えない
	 * @param _user address トークンを配布したいアドレス
	 * @param _assetId uint256
	 * @param _assetName string
	 * @param _total uint256　何回で作る
	 * @return bool
	 */
	function bulkMint(
		address _user,
		uint256 _assetId,
		string calldata _assetName,
		string calldata,
		uint256 _total
	) external onlyRole(MINTER_ROLE) returns (bool) {
		require(_assetId > 0, "the asset id is lower than 0");
		// solhint-disable-next-line reason-string
		require(_total > 0, "the number of running times is lower than 0");
		require(_user != address(0), "address is zero address");
		//require(bytes(_tokenUri).length > 0, "URI is empty");
		require(bytes(_assetName).length > 0, "asset name is empty");

		mintWithAssetId(_user, _assetId, _assetName, _total);

		return true;
	}

	/**
	 * @dev トークンを作る
	 * @param _user address トークンを配布したいアドレス
	 * @param _assetId uint256
	 * @param _assetName string
	 * @param _total uint256　何回で作る
	 * @return bool
	 */
	function mintWithAssetId(
		address _user,
		uint256 _assetId,
		string memory _assetName,
		uint256 _total
	) internal returns (bool) {
		uint256 tokenId;

		//アセットデータを取得する
		//get the asset data by asset id
		AssetData storage assetData = asset_info[_assetId];

		//アセットデータが存在しなければ作る
		//if asset id does not exist
		string memory uri = string(
			abi.encodePacked(_baseURI(), _assetId.toString())
		);
		if (assetData.totalNumberOfSerialId == 0) {
			//create new AssetData struct
			asset_info[_assetId] = AssetData(0, _assetName, uri);
			assetData = asset_info[_assetId];
		}

		//アセット名の確認
		//asset name validation
		require(
			keccak256(abi.encodePacked(assetData.assetName)) ==
				keccak256(abi.encodePacked(_assetName)),
			"asset name does not match"
		);

		//URIの確認
		//URI validation
		require(
			keccak256(abi.encodePacked(assetData.uri)) ==
				keccak256(abi.encodePacked(uri)),
			"URI does not match"
		);

		//シリアルの総量検証
		//total number of serial id validation
		// solhint-disable-next-line reason-string
		require(
			_total + assetData.totalNumberOfSerialId <= serialIdUpperLimit,
			"the total number of serial ids is out of bounds"
		);

		uint256 currentSerialId = assetData.totalNumberOfSerialId;

		for (uint256 index = 0; index < _total; index++) {
			//シリアルIDを生成する
			//create serial id
			currentSerialId = currentSerialId + 1;

			//トークンIDを生成する
			//creat token id
			tokenId = (_assetId * ASSET_ID_CARDINAL_NUMBER) + currentSerialId;

			//トークンを配布する
			//transfer token
			mintWithTokenURI(_user, tokenId, _assetId);
		}

		//アセットが紐づけシリアル総量を更新する
		//update the total number in the asset data
		assetData.totalNumberOfSerialId = currentSerialId;

		return true;
	}

	function _setTokenURI(uint256 _tokenId, uint256 _assetId) private {
		_requireMinted(_tokenId);
		_tokenURIs[_tokenId] = _assetId.toString();
	}

	function mintWithTokenURI(
		address _to,
		uint256 _tokenId,
		uint256 _assetId
	) private onlyRole(MINTER_ROLE) returns (bool) {
		_mint(_to, _tokenId);
		_setTokenURI(_tokenId, _assetId);
		return true;
	}

	// for test
	function setSerialIdUpperLimit(
		uint256 _serialIdUpperLimit
	) external onlyRole(DEFAULT_ADMIN_ROLE) {
		serialIdUpperLimit = _serialIdUpperLimit;
	}

	function _authorizeUpgrade(
		address
	) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

	// import function
	function setAssetData(
		uint256[] memory _assetIds,
		AssetData[] memory _assetDataList
	) external onlyRole(DEFAULT_ADMIN_ROLE) {
		require(_assetIds.length == _assetDataList.length, "illegal data");
		for (uint256 index = 0; index < _assetIds.length; index++) {
			AssetData memory tmp = _assetDataList[index];
			tmp.uri = string(
				abi.encodePacked(_baseURI(), _assetIds[index].toString())
			);
			asset_info[_assetIds[index]] = tmp;
		}
	}

	function setNftData(
		TokenOwner[] memory _tokenOwners
	) external onlyRole(DEFAULT_ADMIN_ROLE) {
		for (uint256 index = 0; index < _tokenOwners.length; index++) {
			TokenOwner memory tmp = _tokenOwners[index];
			_mint(tmp.owner, tmp.tokenId);
			_tokenURIs[tmp.tokenId] = tmp.assetId.toString();
		}
	}
}
