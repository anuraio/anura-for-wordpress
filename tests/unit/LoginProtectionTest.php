<?php

declare(strict_types=1);

namespace Anura\Tests;

require_once __DIR__ . '/../../anura-utilities.php';
require_once __DIR__ . '/../../login-protection.php';

use PHPUnit\Framework\TestCase;

use function Anura\LoginProtection\should_block_user;

class LoginProtectionTest extends TestCase {

	use \phpmock\phpunit\PHPMock;

	public function test_should_block_user_handles_empty_visitor() {
		$mockWpRemoteGet = $this->getFunctionMock( 'Anura\Utilities', 'wp_remote_get' );
		$mockWpRemoteGet->expects( $this->once() )->willReturn(
			array(
				'response' => array( 'code' => 400 ),
				'body'     => json_encode( array( 'error' => 'Instance not found' ) ),
			)
		);

		$mockResponseCode = $this->getFunctionMock( 'Anura\Utilities', 'wp_remote_retrieve_response_code' );
		$mockResponseCode->expects( $this->once() )->willReturn( 400 );

		$mockBody = $this->getFunctionMock( 'Anura\Utilities', 'wp_remote_retrieve_body' );
		$mockBody->expects( $this->once() )->willReturn( json_encode( array( 'error' => 'Instance not found' ) ) );

		$mockIsWpError = $this->getFunctionMock( 'Anura\Utilities', 'is_wp_error' );
		$mockIsWpError->expects( $this->once() )->willReturn( false );

		$settings = array(
			'script' => array(
				'instanceId' => 'test-instance-123',
			),
		);

		$should_block = should_block_user( '', 'warn', $settings, 'testuser' );

		$this->assertFalse( $should_block );
	}

	/**
	 * Test should_block_user returns false when visitor ID is empty and instance is empty
	 */
	public function test_should_block_user_empty_visitor_empty_instance() {
		$mockWpRemoteGet = $this->getFunctionMock( 'Anura\Utilities', 'wp_remote_get' );
		$mockWpRemoteGet->expects( $this->once() )->willReturn(
			array(
				'response' => array( 'code' => 400 ),
				'body'     => json_encode( array( 'error' => 'Instance ID required' ) ),
			)
		);

		$mockIsWpError = $this->getFunctionMock( 'Anura\Utilities', 'is_wp_error' );
		$mockIsWpError->expects( $this->once() )->willReturn( false );

		$mockResponseCode = $this->getFunctionMock( 'Anura\Utilities', 'wp_remote_retrieve_response_code' );
		$mockResponseCode->expects( $this->once() )->willReturn( 400 );

		$mockBody = $this->getFunctionMock( 'Anura\Utilities', 'wp_remote_retrieve_body' );
		$mockBody->expects( $this->once() )->willReturn( json_encode( array( 'error' => 'Instance ID required' ) ) );

		$settings = array(
			'script' => array(
				'instanceId' => '',
			),
		);

		$should_block = should_block_user( '', 'warn', $settings, 'testuser' );

		$this->assertFalse( $should_block );
	}

	/**
	 * Test should_block_user blocks when visitor ID is empty but instance is valid
	 */
	public function test_should_block_user_empty_visitor_valid_instance() {
		$mockWpRemoteGet = $this->getFunctionMock( 'Anura\Utilities', 'wp_remote_get' );
		$mockWpRemoteGet->expects( $this->once() )->willReturn(
			array(
				'response' => array( 'code' => 200 ),
				'body'     => json_encode( array( 'error' => 'Visitor ID missing' ) ),
			)
		);

		$mockResponseCode = $this->getFunctionMock( 'Anura\Utilities', 'wp_remote_retrieve_response_code' );
		$mockResponseCode->expects( $this->once() )->willReturn( 200 );

		$mockBody = $this->getFunctionMock( 'Anura\Utilities', 'wp_remote_retrieve_body' );
		$mockBody->expects( $this->once() )->willReturn( json_encode( array( 'error' => 'Visitor ID missing' ) ) );

		$mockIsWpError = $this->getFunctionMock( 'Anura\Utilities', 'is_wp_error' );
		$mockIsWpError->expects( $this->once() )->willReturn( false );

		// Mock insert_blocked_login to prevent database calls
		$mockInsertBlockedLogin = $this->getFunctionMock( 'Anura\LoginLogs', 'insert_blocked_login' );
		$mockInsertBlockedLogin->expects( $this->once() );

		// Mock sanitize_text_field for log_blocked_login
		$mockSanitizeTextField = $this->getFunctionMock( 'Anura\LoginProtection', 'sanitize_text_field' );
		$mockSanitizeTextField->expects( $this->any() )->willReturnArgument( 0 );

		$_SERVER['REMOTE_ADDR']     = '127.0.0.1';
		$_SERVER['HTTP_USER_AGENT'] = 'Test User Agent';

		$settings = array(
			'script' => array(
				'instanceId' => 'valid-instance-id-123',
			),
		);

		$should_block = should_block_user( '', 'warn', $settings, 'testuser' );

		$this->assertTrue( $should_block );
	}

	/**
	 * Test should_block_user with valid visitor that returns 'bad' result
	 */
	public function test_should_block_user_bad_result_blocks() {
		$mockWpRemoteGet = $this->getFunctionMock( 'Anura\Utilities', 'wp_remote_get' );
		$mockWpRemoteGet->expects( $this->once() )->willReturn(
			array(
				'response' => array( 'code' => 200 ),
				'body'     => json_encode( array( 'result' => 'bad' ) ),
			)
		);

		$mockIsWpError = $this->getFunctionMock( 'Anura\Utilities', 'is_wp_error' );
		$mockIsWpError->expects( $this->once() )->willReturn( false );

		$mockResponseCode = $this->getFunctionMock( 'Anura\Utilities', 'wp_remote_retrieve_response_code' );
		$mockResponseCode->expects( $this->once() )->willReturn( 200 );

		$mockBody = $this->getFunctionMock( 'Anura\Utilities', 'wp_remote_retrieve_body' );
		$mockBody->expects( $this->once() )->willReturn( json_encode( array( 'result' => 'bad' ) ) );

		$settings = array(
			'script' => array(
				'instanceId' => 'test-instance',
			),
		);

		// Mock insert_blocked_login to prevent database calls
		$mockInsertBlockedLogin = $this->getFunctionMock( 'Anura\LoginLogs', 'insert_blocked_login' );
		$mockInsertBlockedLogin->expects( $this->once() );

		// Mock sanitize_text_field for log_blocked_login
		$mockSanitizeTextField = $this->getFunctionMock( 'Anura\LoginProtection', 'sanitize_text_field' );
		$mockSanitizeTextField->expects( $this->any() )->willReturnArgument( 0 );

		$_SERVER['REMOTE_ADDR']     = '127.0.0.1';
		$_SERVER['HTTP_USER_AGENT'] = 'Test User Agent';

		$should_block = should_block_user( 'visitor-123', 'onBad', $settings, 'testuser' );

		$this->assertTrue( $should_block );
	}

	/**
	 * Test should_block_user allows good visitors
	 */
	public function test_should_block_user_good_result_allows() {
		$mockWpRemoteGet = $this->getFunctionMock( 'Anura\Utilities', 'wp_remote_get' );
		$mockWpRemoteGet->expects( $this->once() )->willReturn(
			array(
				'response' => array( 'code' => 200 ),
				'body'     => json_encode( array( 'result' => 'good' ) ),
			)
		);

		$mockIsWpError = $this->getFunctionMock( 'Anura\Utilities', 'is_wp_error' );
		$mockIsWpError->expects( $this->once() )->willReturn( false );

		$mockResponseCode = $this->getFunctionMock( 'Anura\Utilities', 'wp_remote_retrieve_response_code' );
		$mockResponseCode->expects( $this->once() )->willReturn( 200 );

		$mockBody = $this->getFunctionMock( 'Anura\Utilities', 'wp_remote_retrieve_body' );
		$mockBody->expects( $this->once() )->willReturn( json_encode( array( 'result' => 'good' ) ) );

		$settings = array(
			'script' => array(
				'instanceId' => 'test-instance',
			),
		);

		$should_block = should_block_user( 'visitor-123', 'onBad', $settings, 'testuser' );

		// Good result should not block when condition is onBad
		$this->assertFalse( $should_block );
	}

	/**
	 * Test should_block_user handles API exceptions gracefully
	 */
	public function test_should_block_user_handles_api_exception() {
		$mockWpRemoteGet = $this->getFunctionMock( 'Anura\Utilities', 'wp_remote_get' );
		$mockWpRemoteGet->expects( $this->once() )->willReturn(
			array(
				'response' => array( 'code' => 500 ),
				'body'     => 'Internal Server Error',
			)
		);

		$mockIsWpError = $this->getFunctionMock( 'Anura\Utilities', 'is_wp_error' );
		$mockIsWpError->expects( $this->once() )->willReturn( false );

		$mockResponseCode = $this->getFunctionMock( 'Anura\Utilities', 'wp_remote_retrieve_response_code' );
		$mockResponseCode->expects( $this->once() )->willReturn( 500 );

		$mockBody = $this->getFunctionMock( 'Anura\Utilities', 'wp_remote_retrieve_body' );
		$mockBody->expects( $this->once() )->willReturn( 'Internal Server Error' );

		$settings = array(
			'script' => array(
				'instanceId' => 'test-instance',
			),
		);

		$should_block = should_block_user( 'visitor-123', 'onBad', $settings, 'testuser' );

		// Should allow login when API fails
		$this->assertFalse( $should_block );
	}

	/**
	 * Test should_block_user with 'warn' result and onWarning condition
	 */
	public function test_should_block_user_warn_result_blocks_on_warning_condition() {
		$mockWpRemoteGet = $this->getFunctionMock( 'Anura\Utilities', 'wp_remote_get' );
		$mockWpRemoteGet->expects( $this->once() )->willReturn(
			array(
				'response' => array( 'code' => 200 ),
				'body'     => json_encode( array( 'result' => 'warn' ) ),
			)
		);

		$mockIsWpError = $this->getFunctionMock( 'Anura\Utilities', 'is_wp_error' );
		$mockIsWpError->expects( $this->once() )->willReturn( false );

		$mockResponseCode = $this->getFunctionMock( 'Anura\Utilities', 'wp_remote_retrieve_response_code' );
		$mockResponseCode->expects( $this->once() )->willReturn( 200 );

		$mockBody = $this->getFunctionMock( 'Anura\Utilities', 'wp_remote_retrieve_body' );
		$mockBody->expects( $this->once() )->willReturn( json_encode( array( 'result' => 'warn' ) ) );

		$mockInsertBlockedLogin = $this->getFunctionMock( 'Anura\LoginLogs', 'insert_blocked_login' );
		$mockInsertBlockedLogin->expects( $this->once() );

		$mockSanitizeTextField = $this->getFunctionMock( 'Anura\LoginProtection', 'sanitize_text_field' );
		$mockSanitizeTextField->expects( $this->any() )->willReturnArgument( 0 );

		$_SERVER['REMOTE_ADDR']     = '127.0.0.1';
		$_SERVER['HTTP_USER_AGENT'] = 'Test User Agent';

		$settings = array(
			'script' => array(
				'instanceId' => 'test-instance',
			),
		);

		$should_block = should_block_user( 'visitor-123', 'onWarning', $settings, 'testuser' );

		$this->assertTrue( $should_block );
	}

	/**
	 * Test should_block_user with 'bad' result and onBoth condition
	 */
	public function test_should_block_user_bad_result_blocks_on_both_condition() {
		$mockWpRemoteGet = $this->getFunctionMock( 'Anura\Utilities', 'wp_remote_get' );
		$mockWpRemoteGet->expects( $this->once() )->willReturn(
			array(
				'response' => array( 'code' => 200 ),
				'body'     => json_encode( array( 'result' => 'bad' ) ),
			)
		);

		$mockIsWpError = $this->getFunctionMock( 'Anura\Utilities', 'is_wp_error' );
		$mockIsWpError->expects( $this->once() )->willReturn( false );

		$mockResponseCode = $this->getFunctionMock( 'Anura\Utilities', 'wp_remote_retrieve_response_code' );
		$mockResponseCode->expects( $this->once() )->willReturn( 200 );

		$mockBody = $this->getFunctionMock( 'Anura\Utilities', 'wp_remote_retrieve_body' );
		$mockBody->expects( $this->once() )->willReturn( json_encode( array( 'result' => 'bad' ) ) );

		$mockInsertBlockedLogin = $this->getFunctionMock( 'Anura\LoginLogs', 'insert_blocked_login' );
		$mockInsertBlockedLogin->expects( $this->once() );

		$mockSanitizeTextField = $this->getFunctionMock( 'Anura\LoginProtection', 'sanitize_text_field' );
		$mockSanitizeTextField->expects( $this->any() )->willReturnArgument( 0 );

		$_SERVER['REMOTE_ADDR']     = '127.0.0.1';
		$_SERVER['HTTP_USER_AGENT'] = 'Test User Agent';

		$settings = array(
			'script' => array(
				'instanceId' => 'test-instance',
			),
		);

		$should_block = should_block_user( 'visitor-123', 'onBoth', $settings, 'testuser' );

		$this->assertTrue( $should_block );
	}

	/**
	 * Test should_block_user with 'warn' result does not block on onBad condition
	 */
	public function test_should_block_user_warn_result_allows_on_bad_condition() {
		$mockWpRemoteGet = $this->getFunctionMock( 'Anura\Utilities', 'wp_remote_get' );
		$mockWpRemoteGet->expects( $this->once() )->willReturn(
			array(
				'response' => array( 'code' => 200 ),
				'body'     => json_encode( array( 'result' => 'warn' ) ),
			)
		);

		$mockIsWpError = $this->getFunctionMock( 'Anura\Utilities', 'is_wp_error' );
		$mockIsWpError->expects( $this->once() )->willReturn( false );

		$mockResponseCode = $this->getFunctionMock( 'Anura\Utilities', 'wp_remote_retrieve_response_code' );
		$mockResponseCode->expects( $this->once() )->willReturn( 200 );

		$mockBody = $this->getFunctionMock( 'Anura\Utilities', 'wp_remote_retrieve_body' );
		$mockBody->expects( $this->once() )->willReturn( json_encode( array( 'result' => 'warn' ) ) );

		$settings = array(
			'script' => array(
				'instanceId' => 'test-instance',
			),
		);

		$should_block = should_block_user( 'visitor-123', 'onBad', $settings, 'testuser' );

		$this->assertFalse( $should_block );
	}
}
