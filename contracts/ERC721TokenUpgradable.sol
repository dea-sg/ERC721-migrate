// SPDX-License-Identifier: MPL-2.0
pragma solidity =0.8.16;

import "@openzeppelin/contracts-upgradeable/interfaces/draft-IERC1822Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import "./IERC721TokenUpgradable.sol";

contract ERC721TokenUpgradable is
	UUPSUpgradeable,
	AccessControlEnumerableUpgradeable,
	ERC721Upgradeable,
	IERC721TokenUpgradable
{
	using StringsUpgradeable for uint256;
	bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
	//桁設定
	uint256 private constant SERIAL_ID_DECIMAL = 5;
	//基数設定
	uint256 private constant ASSET_ID_CARDINAL_NUMBER =
		10**uint256(SERIAL_ID_DECIMAL);
	uint256 public serialIdUpperLimit;
	mapping(uint256 => string) private _tokenURIs;
	// 互換のため、命名規則は無視
	// solhint-disable-next-line var-name-mixedcase
	mapping(uint256 => AssetData) public asset_info; //asset id => AssetData
	//生成したトークンIDリスト
	uint256[] private tokenList;

	function initialize() public initializer {
		__UUPSUpgradeable_init();
		__ERC721_init("Digital Art", "DAT");
		__AccessControlEnumerable_init();
		_setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
		_setupRole(MINTER_ROLE, _msgSender());
		serialIdUpperLimit = (10**uint256(SERIAL_ID_DECIMAL)) - 1;
	}

	function supportsInterface(bytes4 _interfaceId)
		public
		view
		override(ERC721Upgradeable, AccessControlEnumerableUpgradeable)
		returns (bool)
	{
		return
			_interfaceId == type(IERC721TokenUpgradable).interfaceId ||
			_interfaceId == type(IERC1822ProxiableUpgradeable).interfaceId ||
			AccessControlEnumerableUpgradeable.supportsInterface(
				_interfaceId
			) ||
			ERC721Upgradeable.supportsInterface(_interfaceId);
	}

	/**
	 * @dev 生成したトークン総量を取得する
	 * @return uint256
	 */
	function totalSupply() public view returns (uint256) {
		return tokenList.length;
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

	function _baseURI() internal view virtual override returns (string memory) {
		return "https://playmining.com/metadata/";
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
	 *      引数次第で全件検索が走るが、移行もとの関数そのままで一旦実装
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
		// どう考えても無理だが、残しておく
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
	 *      全件検索が走るが、移行もとの関数そのままで一旦実装
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
	 *      互換を保つため、戻り値の変数名はそのまま
	 * @param _assetId uint256
	 * @return total_number uint256 紐づけシリアル数量
	 * @return asset_name string assetの名
	 * @return uri string
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

			//トークン生成情報を記録する
			//recore the structure of token id
			tokenList.push(tokenId);

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
	function setSerialIdUpperLimit(uint256 _serialIdUpperLimit)
		external
		onlyRole(DEFAULT_ADMIN_ROLE)
	{
		serialIdUpperLimit = _serialIdUpperLimit;
	}

	function _authorizeUpgrade(address)
		internal
		override
		onlyRole(DEFAULT_ADMIN_ROLE)
	{}

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

	function setNftData(TokenOwner[] memory _tokenOwners)
		external
		onlyRole(DEFAULT_ADMIN_ROLE)
	{
		for (uint256 index = 0; index < _tokenOwners.length; index++) {
			TokenOwner memory tmp = _tokenOwners[index];
			_mint(tmp.owner, tmp.tokenId);
			_tokenURIs[tmp.tokenId] = tmp.assetId.toString();
			tokenList.push(tmp.tokenId);
		}
	}
}
