// SPDX-License-Identifier: MPL-2.0
pragma solidity =0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/IAccessControlEnumerableUpgradeable.sol";

contract ERC721Token is
	UUPSUpgradeable,
	AccessControlEnumerableUpgradeable,
	ERC721Upgradeable
{
	struct AssetData {
		//紐づけシリアル総量
		//the total number of serial ids in this asset id
		uint256 totalNumberOfSerialId;
		string assetName;
		string uri;
	}
	bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
	//桁設定
	uint256 private constant SERIAL_ID_DECIMAL = 5;
	//基数設定
	uint256 private constant ASSET_ID_CARDINAL_NUMBER =
		10**uint256(SERIAL_ID_DECIMAL);
	uint256 private constant SERIAL_ID_UPPER_LIMIT =
		(10**uint256(SERIAL_ID_DECIMAL)) - 1;
	mapping(uint256 => string) private _tokenURIs;
	// 互換のため、命名規則は無視
	// solhint-disable-next-line var-name-mixedcase
	mapping(uint256 => AssetData) public asset_info; //asset id => AssetData
	//生成したトークンIDリスト
	uint256[] private tokenList;

	function initialize(string memory _name, string memory _symbol)
		public
		initializer
	{
		__UUPSUpgradeable_init();
		__ERC721_init(_name, _symbol);
		__AccessControlEnumerable_init();
		_setupRole(MINTER_ROLE, _msgSender());
	}

	function totalSupply() public view returns (uint256) {
		return tokenList.length;
	}

	/**
	 * @dev Gets the token ID at a given index of all the tokens in this contract
	 * Reverts if the index is greater or equal to the total number of tokens.
	 * @param _index uint256 representing the index to be accessed of the tokens list
	 * @return uint256 token ID at the given index of the tokens list
	 */
	function getTokenId(uint256 _index) public view returns (uint256) {
		require(_index < totalSupply(), "index out of bounds");
		return tokenList[_index];
	}

	/**
	 * @dev トークンidリストを取得する
	 * @param _start uint256 start index
	 * @param _end uint256 end index
	 * @return tokenIdList uint256[] トークンidリスト
	 */
	function getTokenList(uint256 _start, uint256 _end)
		public
		view
		returns (uint256[] memory tokenIdList)
	{
		uint256 totalSupply_ = totalSupply();
		uint256 tokenId;
		uint256 tokenIndex = 0;

		require(_end >= _start, "input range error");
		require(_start >= 0, "index out of bounds");
		require(_end < totalSupply_, "index out of bounds");

		uint256 dataLength = _end - _start + 1;

		tokenIdList = new uint256[](dataLength);

		for (uint256 index = _start; index <= _end; index++) {
			tokenId = getTokenId(index);
			tokenIdList[tokenIndex] = tokenId;
			tokenIndex = tokenIndex + 1;
		}

		return tokenIdList;
	}

	/**
	 * @dev user addressによって、トークンidリストを取得する
	 * @param _owner address
	 * @return tokenIdList uint256[] トークンidリスト
	 */
	function getOwnerTokenList(address _owner)
		public
		view
		returns (uint256[] memory tokenIdList)
	{
		require(_owner != address(0), "address is zero address");
		uint256 totalSupply_ = totalSupply();
		uint256 userBalance = balanceOf(_owner);
		uint256 tokenId;
		uint256 tokenIndex = 0;

		tokenIdList = new uint256[](userBalance);

		for (uint256 index = 0; index < totalSupply_; index++) {
			tokenId = getTokenId(index);
			if (ownerOf(tokenId) == _owner) {
				tokenIdList[tokenIndex] = tokenId;
				tokenIndex = tokenIndex + 1;
			}
		}

		return tokenIdList;
	}

	/**
	 * @dev assetの名と同じasset idのトークン数量を取得する
	 * @param _assetId uint256
	 * @return total_number uint256 紐づけシリアル数量
	 * @return asset_name string assetの名
	 * @return uri string
	 * // 互換を保つため、変数名はそのまま
	 */
	function getAssetData(uint256 _assetId)
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
	 * @param _tokenUri string
	 * @param _total uint256　何回で作る
	 * @return bool
	 */
	function bulkMint(
		address _user,
		uint256 _assetId,
		string calldata _assetName,
		string calldata _tokenUri,
		uint256 _total
	) external onlyRole(MINTER_ROLE) returns (bool) {
		require(_assetId > 0, "the asset id is lower than 0");
		// solhint-disable-next-line reason-string
		require(_total > 0, "the number of running times is lower than 0");
		require(_user != address(0), "address is zero address");
		require(bytes(_tokenUri).length > 0, "URI is empty");
		require(bytes(_assetName).length > 0, "asset name is empty");

		mintWithAssetId(_user, _assetId, _assetName, _tokenUri, _total);

		return true;
	}

	/**
	 * @dev トークンを作る
	 * @param _user address トークンを配布したいアドレス
	 * @param _assetId uint256
	 * @param _assetName string
	 * @param _tokenUri string
	 * @param _total uint256　何回で作る
	 * @return bool
	 */
	function mintWithAssetId(
		address _user,
		uint256 _assetId,
		string memory _assetName,
		string memory _tokenUri,
		uint256 _total
	) internal returns (bool) {
		uint256 tokenId;

		//アセットデータを取得する
		//get the asset data by asset id
		AssetData storage assetData = asset_info[_assetId];

		//アセットデータが存在しなければ作る
		//if asset id does not exist
		if (assetData.totalNumberOfSerialId == 0) {
			//create new AssetData struct
			asset_info[_assetId] = AssetData(0, _assetName, _tokenUri);
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
				keccak256(abi.encodePacked(_tokenUri)),
			"URI does not match"
		);

		//シリアルの総量検証
		//total number of serial id validation
		// solhint-disable-next-line reason-string
		require(
			_total + assetData.totalNumberOfSerialId <= SERIAL_ID_UPPER_LIMIT,
			"the total number of serial ids is out of bounds"
		);

		uint256 currentSerialId = assetData.totalNumberOfSerialId;

		for (uint256 index = 0; index < _total; index++) {
			//シリアルIDを生成する
			//create serial id
			currentSerialId = currentSerialId + 1;

			//トークンIDを生成する
			//creat token id
			tokenId = _assetId * ASSET_ID_CARDINAL_NUMBER + currentSerialId;

			//トークン生成情報を記録する
			//recore the structure of token id
			tokenList.push(tokenId);

			//トークンを配布する
			//transfer token
			mintWithTokenURI(_user, tokenId, _tokenUri);
		}

		//アセットが紐づけシリアル総量を更新する
		//update the total number in the asset data
		assetData.totalNumberOfSerialId = currentSerialId;

		return true;
	}

	function _setTokenURI(uint256 _tokenId, string memory _tokenURI) private {
		_requireMinted(_tokenId);
		_tokenURIs[_tokenId] = _tokenURI;
	}

	function tokenURI(uint256 _tokenId)
		public
		view
		virtual
		override
		returns (string memory)
	{
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

	function _burn(uint256 _tokenId) internal override {
		super._burn(_tokenId);

		// Clear metadata (if any)
		if (bytes(_tokenURIs[_tokenId]).length != 0) {
			delete _tokenURIs[_tokenId];
		}
	}

	function mintWithTokenURI(
		address _to,
		uint256 _tokenId,
		string memory _tokenURI
	) public onlyRole(MINTER_ROLE) returns (bool) {
		_mint(_to, _tokenId);
		_setTokenURI(_tokenId, _tokenURI);
		return true;
	}

	function _authorizeUpgrade(address)
		internal
		override
		onlyRole(DEFAULT_ADMIN_ROLE)
	{}

	function supportsInterface(bytes4 interfaceId)
		public
		view
		override(ERC721Upgradeable, AccessControlEnumerableUpgradeable)
		returns (bool)
	{
		return
			interfaceId ==
			type(IAccessControlEnumerableUpgradeable).interfaceId ||
			super.supportsInterface(interfaceId);
	}
}

// TODO コメントつける
// testする
