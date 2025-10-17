<?php

/**
 * Tests for Anura Utilities functions
 *
 * @package Anura_Io
 */

require_once __DIR__ . '/../../anura-utilities.php';

use PHPUnit\Framework\TestCase;

class AnuraUtilitiesTest extends TestCase {


	public function setUp(): void {
		WP_Mock::setUp();
		// Clear superglobals before each test
		$_GET  = array();
		$_POST = array();
	}

	public function tearDown(): void {
		WP_Mock::tearDown();
	}

	/**
	 * Test get_traffic_detail with GET method
	 */
	public function test_get_traffic_detail_with_get_method(): void {
		$_GET['utm_source'] = 'google';

		WP_Mock::userFunction( 'sanitize_text_field' )
			->once()
			->with( 'google' )
			->andReturn( 'google' );

		$result = \Anura\Utilities\get_traffic_detail( 'get', 'utm_source', array() );

		$this->assertSame( 'google', $result );
	}

	/**
	 * Test get_traffic_detail with POST method
	 */
	public function test_get_traffic_detail_with_post_method(): void {
		$_POST['campaign'] = 'summer-sale';

		WP_Mock::userFunction( 'sanitize_text_field' )
			->once()
			->with( 'summer-sale' )
			->andReturn( 'summer-sale' );

		$result = \Anura\Utilities\get_traffic_detail( 'post', 'campaign', array() );

		$this->assertSame( 'summer-sale', $result );
	}

	/**
	 * Test get_traffic_detail with hardCoded method
	 */
	public function test_get_traffic_detail_with_hardcoded_method(): void {
		WP_Mock::userFunction( 'sanitize_text_field' )
			->once()
			->with( 'fixed-value' )
			->andReturn( 'fixed-value' );

		$result = \Anura\Utilities\get_traffic_detail( 'hardCoded', 'fixed-value', array() );

		$this->assertSame( 'fixed-value', $result );
	}

	/**
	 * Test get_traffic_detail with none method returns empty string
	 */
	public function test_get_traffic_detail_with_none_method(): void {
		$result = \Anura\Utilities\get_traffic_detail( 'none', '', array() );

		$this->assertSame( '', $result );
	}

	/**
	 * Test get_traffic_detail falls back when value not found
	 */
	public function test_get_traffic_detail_with_get_fallback(): void {
		$_GET['fallback_source'] = 'fallback-value';

		WP_Mock::userFunction( 'sanitize_text_field' )
			->once()
			->andReturnUsing(
				function ( $arg ) {
					return $arg;
				}
			);

		$result = \Anura\Utilities\get_traffic_detail(
			'get',
			'utm_source',
			array( 'fallback_source' )
		);

		$this->assertSame( 'fallback-value', $result );
	}


	/**
	 * Test get_traffic_detail falls back when value not found
	 */
	public function test_get_traffic_detail_with_post_fallback(): void {
		$_POST['fallback_source'] = 'fallback-value';

		WP_Mock::userFunction( 'sanitize_text_field' )
			->once()
			->andReturnUsing(
				function ( $arg ) {
					return $arg;
				}
			);

		$result = \Anura\Utilities\get_traffic_detail(
			'post',
			'utm_source',
			array( 'fallback_source' )
		);

		$this->assertSame( 'fallback-value', $result );
	}



	/**
	 * Test process_additional_data processes array correctly
	 */
	public function test_process_additional_data(): void {
		$_GET['param1'] = 'value1';
		$_GET['param3'] = 'value3';

		$additional_data = array(
			array(
				'method' => 'get',
				'value'  => 'param1',
			),
			array(
				'method' => 'hardCoded',
				'value'  => 'hardcoded-val',
			),
			array(
				'method' => 'get',
				'value'  => 'param3',
			),
		);

		WP_Mock::userFunction( 'sanitize_text_field' )
			->times( 3 )
			->andReturnUsing(
				function ( $arg ) {
					return $arg;
				}
			);

		$result = \Anura\Utilities\process_additional_data( $additional_data );

		$this->assertArrayHasKey( 0, $result );
		$this->assertArrayHasKey( 1, $result );
		$this->assertArrayHasKey( 2, $result );
		$this->assertSame( 'value1', $result[0] );
		$this->assertSame( 'hardcoded-val', $result[1] );
		$this->assertSame( 'value3', $result[2] );
	}

	/**
	 * Test process_additional_data skips invalid entries
	 */
	public function test_process_additional_data_skips_invalid(): void {
		$additional_data = array(
			array(
				'method' => 'get',
				'value'  => '',
			),
			'invalid-entry',
			array(
				'invalid' => 'structure',
			),
		);

		WP_Mock::userFunction( 'sanitize_text_field' )
			->andReturn( '' );

		$result = \Anura\Utilities\process_additional_data( $additional_data );

		$this->assertIsArray( $result );
		$this->assertEmpty( $result );
	}

	/**
	 * Test find_action_by_name finds correct action
	 */
	public function test_find_action_by_name_finds_action(): void {
		$settings = array(
			'realTimeActions' => array(
				'actions' => array(
					array(
						'name'            => 'disableForms',
						'resultCondition' => 'onBad',
					),
					array(
						'name'            => 'disableLinks',
						'resultCondition' => 'onWarning',
					),
				),
			),
		);

		$result = \Anura\Utilities\find_action_by_name( $settings, 'disableLinks' );

		$this->assertIsArray( $result );
		$this->assertSame( 'disableLinks', $result['name'] );
		$this->assertSame( 'onWarning', $result['resultCondition'] );
	}

	/**
	 * Test find_action_by_name returns null when not found
	 */
	public function test_find_action_by_name_returns_null(): void {
		$settings = array(
			'realTimeActions' => array(
				'actions' => array(
					array(
						'name'            => 'disableForms',
						'resultCondition' => 'onBad',
					),
				),
			),
		);

		$result = \Anura\Utilities\find_action_by_name( $settings, 'nonExistentAction' );

		$this->assertNull( $result );
	}

	/**
	 * Test is_action_enabled returns true for enabled action
	 */
	public function test_is_action_enabled_returns_true(): void {
		$settings = array(
			'realTimeActions' => array(
				'actions' => array(
					array(
						'name'            => 'disableForms',
						'resultCondition' => 'onBad',
					),
				),
			),
		);

		$result = \Anura\Utilities\is_action_enabled( $settings, 'disableForms' );

		$this->assertTrue( $result );
	}

	/**
	 * Test is_action_enabled returns false for disabled action
	 */
	public function test_is_action_enabled_returns_false(): void {
		$settings = array(
			'realTimeActions' => array(
				'actions' => array(
					array(
						'name'            => 'disableForms',
						'resultCondition' => 'noDisable',
					),
				),
			),
		);

		$result = \Anura\Utilities\is_action_enabled( $settings, 'disableForms' );

		$this->assertFalse( $result );
	}

	/**
	 * Test get_action_condition returns correct condition
	 */
	public function test_get_action_condition(): void {
		$settings = array(
			'realTimeActions' => array(
				'actions' => array(
					array(
						'name'            => 'disableForms',
						'resultCondition' => 'onBoth',
					),
				),
			),
		);

		$result = \Anura\Utilities\get_action_condition( $settings, 'disableForms' );

		$this->assertSame( 'onBoth', $result );
	}

	/**
	 * Test result_matches_protect_condition with onWarning
	 */
	public function test_result_matches_protect_condition_on_warning(): void {
		$this->assertTrue( \Anura\Utilities\result_matches_protect_condition( 'warn', 'onWarning' ) );
		$this->assertFalse( \Anura\Utilities\result_matches_protect_condition( 'bad', 'onWarning' ) );
		$this->assertFalse( \Anura\Utilities\result_matches_protect_condition( 'good', 'onWarning' ) );
	}

	/**
	 * Test result_matches_protect_condition with onBad
	 */
	public function test_result_matches_protect_condition_on_bad(): void {
		$this->assertTrue( \Anura\Utilities\result_matches_protect_condition( 'bad', 'onBad' ) );
		$this->assertFalse( \Anura\Utilities\result_matches_protect_condition( 'warn', 'onBad' ) );
		$this->assertFalse( \Anura\Utilities\result_matches_protect_condition( 'good', 'onBad' ) );
	}

	/**
	 * Test result_matches_protect_condition with onBoth
	 */
	public function test_result_matches_protect_condition_on_both(): void {
		$this->assertTrue( \Anura\Utilities\result_matches_protect_condition( 'warn', 'onBoth' ) );
		$this->assertTrue( \Anura\Utilities\result_matches_protect_condition( 'bad', 'onBoth' ) );
		$this->assertFalse( \Anura\Utilities\result_matches_protect_condition( 'good', 'onBoth' ) );
	}

	/**
	 * Test prepare_anura_settings processes settings correctly
	 */
	public function test_prepare_anura_settings(): void {
		$_GET['utm_source']   = 'google';
		$_GET['utm_campaign'] = 'spring-sale';
		$_GET['custom_param'] = 'custom-value';

		$raw_settings = array(
			'script'   => array(
				'instanceId'     => '12345',
				'sourceMethod'   => 'get',
				'sourceValue'    => 'utm_source',
				'campaignMethod' => 'get',
				'campaignValue'  => 'utm_campaign',
				'additionalData' => array(
					array(
						'method' => 'get',
						'value'  => 'custom_param',
					),
				),
			),
			'advanced' => array(
				'fallbacks' => array(
					'sources'   => array(),
					'campaigns' => array(),
				),
			),
		);

		WP_Mock::userFunction( 'sanitize_text_field' )
			->times( 3 )
			->andReturnUsing(
				function ( $arg ) {
					return $arg;
				}
			);

		$result = \Anura\Utilities\prepare_anura_settings( $raw_settings );

		$this->assertSame( 'google', $result['script']['source'] );
		$this->assertSame( 'spring-sale', $result['script']['campaign'] );
		$this->assertArrayHasKey( 0, $result['script']['additionalData'] );
		$this->assertSame( 'custom-value', $result['script']['additionalData'][0] );
	}

	/**
	 * Test enqueue_anura_script calls WordPress functions correctly
	 */
	public function test_enqueue_anura_script(): void {
		$handle     = 'test-script';
		$script_url = 'https://example.com/script.js';
		$settings   = array( 'key' => 'value' );

		WP_Mock::userFunction( 'wp_enqueue_script' )
			->once()
			->with( $handle, $script_url );

		WP_Mock::userFunction( 'wp_localize_script' )
			->once()
			->with( $handle, 'anuraOptions', $settings );

		\Anura\Utilities\enqueue_anura_script( $handle, $script_url, $settings );

		$this->expectNotToPerformAssertions();
	}

	/**
	 * Test handle_api_response with successful response
	 */
	public function test_handle_api_response_success(): void {
		$body = json_encode( array( 'result' => 'good' ) );

		$result = \Anura\Utilities\handle_api_response( 200, $body );

		$this->assertIsArray( $result );
		$this->assertSame( 'good', $result['result'] );
	}

	/**
	 * Test handle_api_response throws on non-200 status
	 */
	public function test_handle_api_response_throws_on_error_status(): void {
		$this->expectException( Exception::class );
		$this->expectExceptionMessage( 'Request failed' );

		\Anura\Utilities\handle_api_response( 500, '' );
	}

	/**
	 * Test handle_api_response throws on invalid JSON
	 */
	public function test_handle_api_response_throws_on_invalid_json(): void {
		$this->expectException( Exception::class );
		$this->expectExceptionMessage( 'Invalid JSON response from Anura API' );

		\Anura\Utilities\handle_api_response( 200, 'not-valid-json' );
	}

	/**
	 * Test get_fallback_detail with GET method
	 */
	public function test_get_fallback_detail_with_get_method(): void {
		$_GET['fallback1'] = 'fallback-value';

		WP_Mock::userFunction( 'sanitize_text_field' )
			->once()
			->with( 'fallback-value' )
			->andReturn( 'fallback-value' );

		$result = \Anura\Utilities\get_fallback_detail( array( 'fallback1' ), 'get' );

		$this->assertSame( 'fallback-value', $result );
	}

	/**
	 * Test get_fallback_detail with POST method
	 */
	public function test_get_fallback_detail_with_post_method(): void {
		$_POST['fallback1'] = 'post-fallback';

		WP_Mock::userFunction( 'sanitize_text_field' )
			->once()
			->with( 'post-fallback' )
			->andReturn( 'post-fallback' );

		$result = \Anura\Utilities\get_fallback_detail( array( 'fallback1' ), 'post' );

		$this->assertSame( 'post-fallback', $result );
	}

	/**
	 * Test get_fallback_detail returns empty string when no fallbacks match
	 */
	public function test_get_fallback_detail_no_match(): void {
		$result = \Anura\Utilities\get_fallback_detail( array( 'nonexistent' ), 'get' );

		$this->assertSame( '', $result );
	}

	/**
	 * Test is_anura_service_available returns true on successful response
	 */
	public function test_is_anura_service_available_success(): void {
		WP_Mock::userFunction( 'wp_remote_head' )
			->once()
			->andReturn(
				array(
					'response' => array( 'code' => 200 ),
				)
			);

		WP_Mock::userFunction( 'is_wp_error' )
			->once()
			->andReturn( false );

		WP_Mock::userFunction( 'wp_remote_retrieve_response_code' )
			->once()
			->andReturn( 200 );

		$result = \Anura\Utilities\is_anura_service_available();

		$this->assertTrue( $result );
	}

	/**
	 * Test is_anura_service_available returns false on WP_Error
	 */
	public function test_is_anura_service_available_wp_error(): void {
		$wp_error = $this->createMock( \stdClass::class );

		WP_Mock::userFunction( 'wp_remote_head' )
			->once()
			->andReturn( $wp_error );

		WP_Mock::userFunction( 'is_wp_error' )
			->once()
			->with( $wp_error )
			->andReturn( true );

		$result = \Anura\Utilities\is_anura_service_available();

		$this->assertFalse( $result );
	}

	/**
	 * Test is_anura_service_available returns false on 500+ status
	 */
	public function test_is_anura_service_available_server_error(): void {
		WP_Mock::userFunction( 'wp_remote_head' )
			->once()
			->andReturn(
				array(
					'response' => array( 'code' => 500 ),
				)
			);

		WP_Mock::userFunction( 'is_wp_error' )
			->once()
			->andReturn( false );

		WP_Mock::userFunction( 'wp_remote_retrieve_response_code' )
			->once()
			->andReturn( 500 );

		$result = \Anura\Utilities\is_anura_service_available();

		$this->assertFalse( $result );
	}

	/**
	 * Test is_instance_valid returns true for valid instance
	 */
	public function test_is_instance_valid_returns_true(): void {
		WP_Mock::userFunction( 'wp_remote_get' )
			->once()
			->andReturn(
				array(
					'response' => array( 'code' => 200 ),
					'body'     => json_encode( array( 'error' => 'No error' ) ),
				)
			);

		WP_Mock::userFunction( 'is_wp_error' )
			->once()
			->andReturn( false );

		WP_Mock::userFunction( 'wp_remote_retrieve_response_code' )
			->once()
			->andReturn( 200 );

		WP_Mock::userFunction( 'wp_remote_retrieve_body' )
			->once()
			->andReturn( json_encode( array( 'error' => 'No error' ) ) );

		$result = \Anura\Utilities\is_instance_valid( 'valid-instance' );

		$this->assertTrue( $result );
	}

	/**
	 * Test is_instance_valid returns false on WP_Error
	 */
	public function test_is_instance_valid_wp_error(): void {
		$wp_error = $this->createMock( \stdClass::class );

		WP_Mock::userFunction( 'wp_remote_get' )
			->once()
			->andReturn( $wp_error );

		WP_Mock::userFunction( 'is_wp_error' )
			->once()
			->with( $wp_error )
			->andReturn( true );

		$result = \Anura\Utilities\is_instance_valid( 'test-instance' );

		$this->assertFalse( $result );
	}

	/**
	 * Test is_instance_valid returns false on server error
	 */
	public function test_is_instance_valid_server_error(): void {
		WP_Mock::userFunction( 'wp_remote_get' )
			->once()
			->andReturn(
				array(
					'response' => array( 'code' => 500 ),
				)
			);

		WP_Mock::userFunction( 'is_wp_error' )
			->once()
			->andReturn( false );

		WP_Mock::userFunction( 'wp_remote_retrieve_response_code' )
			->once()
			->andReturn( 500 );

		$result = \Anura\Utilities\is_instance_valid( 'test-instance' );

		$this->assertFalse( $result );
	}

	/**
	 * Test is_instance_valid returns false on invalid JSON
	 */
	public function test_is_instance_valid_invalid_json(): void {
		WP_Mock::userFunction( 'wp_remote_get' )
			->once()
			->andReturn(
				array(
					'response' => array( 'code' => 200 ),
					'body'     => 'not-json',
				)
			);

		WP_Mock::userFunction( 'is_wp_error' )
			->once()
			->andReturn( false );

		WP_Mock::userFunction( 'wp_remote_retrieve_response_code' )
			->once()
			->andReturn( 200 );

		WP_Mock::userFunction( 'wp_remote_retrieve_body' )
			->once()
			->andReturn( 'not-json' );

		$result = \Anura\Utilities\is_instance_valid( 'test-instance' );

		$this->assertFalse( $result );
	}

	/**
	 * Test is_instance_valid returns false when error contains 'instance'
	 */
	public function test_is_instance_valid_instance_error(): void {
		WP_Mock::userFunction( 'wp_remote_get' )
			->once()
			->andReturn(
				array(
					'response' => array( 'code' => 200 ),
					'body'     => json_encode( array( 'error' => 'Invalid instance ID' ) ),
				)
			);

		WP_Mock::userFunction( 'is_wp_error' )
			->once()
			->andReturn( false );

		WP_Mock::userFunction( 'wp_remote_retrieve_response_code' )
			->once()
			->andReturn( 200 );

		WP_Mock::userFunction( 'wp_remote_retrieve_body' )
			->once()
			->andReturn( json_encode( array( 'error' => 'Invalid instance ID' ) ) );

		$result = \Anura\Utilities\is_instance_valid( 'invalid-instance' );

		$this->assertFalse( $result );
	}

	/**
	 * Test query_anura_visitor throws exception on WP_Error
	 */
	public function test_query_anura_visitor_wp_error(): void {
		// Create a mock that has get_error_message method
		$wp_error = new class() {
			public function get_error_message() {
				return 'Network error: Connection timeout';
			}
		};

		WP_Mock::userFunction( 'wp_remote_get' )
			->once()
			->andReturn( $wp_error );

		WP_Mock::userFunction( 'is_wp_error' )
			->once()
			->with( $wp_error )
			->andReturn( true );

		$this->expectException( Exception::class );
		$this->expectExceptionMessage( 'Network error' );

		\Anura\Utilities\query_anura_visitor( 'visitor-123', 'instance-123' );
	}

	/**
	 * Test query_anura_visitor returns data on success
	 */
	public function test_query_anura_visitor_success(): void {
		$expected_data = array( 'result' => 'good' );

		WP_Mock::userFunction( 'wp_remote_get' )
			->once()
			->andReturn(
				array(
					'response' => array( 'code' => 200 ),
					'body'     => json_encode( $expected_data ),
				)
			);

		WP_Mock::userFunction( 'is_wp_error' )
			->once()
			->andReturn( false );

		WP_Mock::userFunction( 'wp_remote_retrieve_response_code' )
			->once()
			->andReturn( 200 );

		WP_Mock::userFunction( 'wp_remote_retrieve_body' )
			->once()
			->andReturn( json_encode( $expected_data ) );

		$result = \Anura\Utilities\query_anura_visitor( 'visitor-123', 'instance-123' );

		$this->assertSame( $expected_data, $result );
	}
}
