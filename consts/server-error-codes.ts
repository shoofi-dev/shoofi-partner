
	/********** SUCCEEDED **********/
	const ORDER_REJECTED = 2;
	const SMS_MESSAGE_SENT_SUCCESSFULLY = 1;
	const SUCCESS = 0;
	
	/********** ERRORS **********/
	const PHONE_NUMBER_INVALID = -1;
	const PHONE_NUMBER_BLOCKED = -2;
	const PHONE_NUMBER_VARFICATION_FAILED = -3;
	const PHONE_NUMBER_MANUAL_VARFICATION_NEEDED = -4;
	const TRANSACTION_FAILED = -5;  //void - save data ; update failed
	const INVALID_REQUEST = -6;//post_body_content  invalid
	const UNKNOWN_VERSION = -7;
	const SMS_NOT_SENT = -8;
	const SMS_PHONE_MESSAGE_CONTENT_ERROR = -9;

	const CUSTOMER_INFO_UPDATE_NAME_LIMITED_DURATION_ERROR = -10;

	const UNKNOWN_BRANCH = -11;
	const TOKEN_NOT_VALID = -12;
	const CC_TRANSACTION_NOT_VALID = -13;
	const CC_TRANSACTION_SUM_NOT_VALID = -14;
	const UNIQUE_HASH_NOT_VALID = -15;
	const INVALID_GEO_ADDRESS = -16;
	const CRITICAL_ERROR = -400; //Server Crash
	const CRITICAL_ERROR_NOT_FOR_USE = -401; //RESERVED - application internal use ; not for use !!!!!