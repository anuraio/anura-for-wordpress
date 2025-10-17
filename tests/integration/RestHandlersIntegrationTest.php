<?php
/**
 * Integration tests for REST API handlers
 *
 * These tests verify the REST API endpoints work correctly
 * with real WordPress REST API infrastructure
 *
 * @package Anura_Io
 */

require_once __DIR__ . '/../../rest-handlers.php';
require_once __DIR__ . '/../../login-protection-db.php';
require_once __DIR__ . '/../../class-settings-manager.php';

use Anura\Settings_Manager\Settings_Manager;

class RestHandlersIntegrationTest extends WP_UnitTestCase {

	private $admin_user_id;
	private $subscriber_user_id;
	private $server;

	public function setUp(): void {
		parent::setUp();

		// Create users for permission testing
		$this->admin_user_id = self::factory()->user->create(
			array(
				'role' => 'administrator',
			)
		);

		$this->subscriber_user_id = self::factory()->user->create(
			array(
				'role' => 'subscriber',
			)
		);

		// Clean up any existing settings and logs
		delete_option( 'anura_settings' );

		global $wpdb;
		$table_name = $wpdb->prefix . 'anura_blocked_logins';

		// Create the table if it doesn't exist
		\Anura\LoginLogs\create_blocked_logins_table();

		// Verify table was created and then truncate it
		$table_exists = $wpdb->get_var( "SHOW TABLES LIKE '$table_name'" );
		if ( $table_exists ) {
			$wpdb->query( "TRUNCATE TABLE $table_name" );
		}

		// Set up REST server
		global $wp_rest_server;
		$this->server = $wp_rest_server = new WP_REST_Server();
		do_action( 'rest_api_init' );
	}

	public function tearDown(): void {
		// Clean up
		delete_option( 'anura_settings' );

		global $wpdb;
		$table_name = $wpdb->prefix . 'anura_blocked_logins';

		// Only truncate if table exists
		$table_exists = $wpdb->get_var( "SHOW TABLES LIKE '$table_name'" );
		if ( $table_exists ) {
			$wpdb->query( "TRUNCATE TABLE $table_name" );
		}

		global $wp_rest_server;
		$wp_rest_server = null;

		parent::tearDown();
	}

	/**
	 * Test that REST routes are registered
	 */
	public function test_rest_routes_registered(): void {
		$routes = $this->server->get_routes();

		$this->assertArrayHasKey(
			'/anura/v1/anura-settings',
			$routes,
			'Settings route should be registered'
		);

		$this->assertArrayHasKey(
			'/anura/v1/blocked-logins',
			$routes,
			'Blocked logins route should be registered'
		);
	}

	/**
	 * Test GET /anura/v1/anura-settings returns settings
	 */
	public function test_get_settings_returns_settings(): void {
		wp_set_current_user( $this->admin_user_id );

		$request  = new WP_REST_Request( 'GET', '/anura/v1/anura-settings' );
		$response = $this->server->dispatch( $request );

		$this->assertEquals( 200, $response->get_status() );

		$data = $response->get_data();
		$this->assertIsArray( $data );
		$this->assertArrayHasKey( 'script', $data );
		$this->assertArrayHasKey( 'realTimeActions', $data );
		$this->assertArrayHasKey( 'bots', $data );
	}

	/**
	 * Test GET /anura/v1/anura-settings requires admin permissions
	 */
	public function test_get_settings_requires_admin_permission(): void {
		wp_set_current_user( $this->subscriber_user_id );

		$request  = new WP_REST_Request( 'GET', '/anura/v1/anura-settings' );
		$response = $this->server->dispatch( $request );

		$this->assertEquals( 403, $response->get_status() );
	}

	/**
	 * Test GET /anura/v1/anura-settings without authentication
	 */
	public function test_get_settings_requires_authentication(): void {
		wp_set_current_user( 0 );

		$request  = new WP_REST_Request( 'GET', '/anura/v1/anura-settings' );
		$response = $this->server->dispatch( $request );

		// WordPress REST API returns 401 for unauthenticated requests
		$this->assertEquals( 401, $response->get_status() );
	}

	/**
	 * Test POST /anura/v1/anura-settings saves valid settings
	 *
	 * Note: instanceId must be a numeric string (e.g., "123456") to pass validation.
	 * Empty strings fail because they can't be coerced to integers.
	 */
	public function test_save_settings_with_valid_data(): void {
		wp_set_current_user( $this->admin_user_id );

		$settings_manager = new Settings_Manager();
		$settings         = $settings_manager->get_default_settings();

		// Use a numeric string for instanceId (coercion will convert to integer)
		$settings['script']['instanceId'] = '123456';

		$request = new WP_REST_Request( 'POST', '/anura/v1/anura-settings' );
		$request->set_header( 'Content-Type', 'application/json' );
		$request->set_body( wp_json_encode( $settings ) );

		$response = $this->server->dispatch( $request );

		$this->assertEquals( 200, $response->get_status() );

		$data = $response->get_data();
		$this->assertArrayHasKey( 'msg', $data );
		$this->assertEquals( 'Settings saved.', $data['msg'] );

		// Verify settings were actually saved
		$saved_settings = $settings_manager->get_settings();
		$this->assertEquals( '123456', $saved_settings['script']['instanceId'] );
	}

	/**
	 * Test POST /anura/v1/anura-settings rejects invalid settings
	 */
	public function test_save_settings_rejects_invalid_data(): void {
		wp_set_current_user( $this->admin_user_id );

		$invalid_settings = array(
			'script' => array(
				'instanceId' => 123, // Should be string
			),
		);

		$request = new WP_REST_Request( 'POST', '/anura/v1/anura-settings' );
		$request->set_header( 'Content-Type', 'application/json' );
		$request->set_body( wp_json_encode( $invalid_settings ) );

		$response = $this->server->dispatch( $request );

		$this->assertEquals( 400, $response->get_status() );

		$data = $response->get_data();
		$this->assertArrayHasKey( 'errors', $data );
		$this->assertNotEmpty( $data['errors'] );
	}

	/**
	 * Test POST /anura/v1/anura-settings requires admin permissions
	 */
	public function test_save_settings_requires_admin_permission(): void {
		wp_set_current_user( $this->subscriber_user_id );

		$settings_manager = new Settings_Manager();
		$settings         = $settings_manager->get_default_settings();

		$request = new WP_REST_Request( 'POST', '/anura/v1/anura-settings' );
		$request->set_header( 'Content-Type', 'application/json' );
		$request->set_body( wp_json_encode( $settings ) );

		$response = $this->server->dispatch( $request );

		$this->assertEquals( 403, $response->get_status() );
	}

	/**
	 * Test GET /anura/v1/blocked-logins returns blocked login records
	 */
	public function test_get_blocked_logins_returns_records(): void {
		wp_set_current_user( $this->admin_user_id );

		// Insert some blocked logins
		\Anura\LoginLogs\insert_blocked_login( 'testuser1', 'bad', '127.0.0.1', 'Mozilla/5.0' );
		\Anura\LoginLogs\insert_blocked_login( 'testuser2', 'warn', '127.0.0.2', 'Chrome/90.0' );

		$request  = new WP_REST_Request( 'GET', '/anura/v1/blocked-logins' );
		$response = $this->server->dispatch( $request );

		$this->assertEquals( 200, $response->get_status() );

		$data = $response->get_data();
		$this->assertIsArray( $data );
		$this->assertArrayHasKey( 'logs', $data );
		$this->assertArrayHasKey( 'total', $data );
		$this->assertArrayHasKey( 'page', $data );
		$this->assertArrayHasKey( 'per_page', $data );
		$this->assertArrayHasKey( 'total_pages', $data );

		$this->assertEquals( 2, $data['total'] );
		$this->assertCount( 2, $data['logs'] );
	}

	/**
	 * Test GET /anura/v1/blocked-logins with pagination
	 */
	public function test_get_blocked_logins_pagination(): void {
		wp_set_current_user( $this->admin_user_id );

		// Insert 15 blocked logins
		for ( $i = 1; $i <= 15; $i++ ) {
			\Anura\LoginLogs\insert_blocked_login(
				"user$i",
				'bad',
				"127.0.0.$i",
				'Mozilla/5.0'
			);
		}

		// Get page 1 with 10 per page
		$request = new WP_REST_Request( 'GET', '/anura/v1/blocked-logins' );
		$request->set_param( 'page', 1 );
		$request->set_param( 'per_page', 10 );

		$response = $this->server->dispatch( $request );
		$data     = $response->get_data();

		$this->assertEquals( 200, $response->get_status() );
		$this->assertEquals( 15, $data['total'] );
		$this->assertEquals( 1, $data['page'] );
		$this->assertEquals( 10, $data['per_page'] );
		$this->assertEquals( 2, $data['total_pages'] );
		$this->assertCount( 10, $data['logs'] );

		// Get page 2
		$request2 = new WP_REST_Request( 'GET', '/anura/v1/blocked-logins' );
		$request2->set_param( 'page', 2 );
		$request2->set_param( 'per_page', 10 );

		$response2 = $this->server->dispatch( $request2 );
		$data2     = $response2->get_data();

		$this->assertCount( 5, $data2['logs'] );
	}

	/**
	 * Test GET /anura/v1/blocked-logins with username filter
	 */
	public function test_get_blocked_logins_filter_by_username(): void {
		wp_set_current_user( $this->admin_user_id );

		// Insert blocked logins
		\Anura\LoginLogs\insert_blocked_login( 'admin', 'bad', '127.0.0.1', 'Mozilla/5.0' );
		\Anura\LoginLogs\insert_blocked_login( 'testuser', 'warn', '127.0.0.2', 'Mozilla/5.0' );
		\Anura\LoginLogs\insert_blocked_login( 'admin2', 'bad', '127.0.0.3', 'Mozilla/5.0' );

		$request = new WP_REST_Request( 'GET', '/anura/v1/blocked-logins' );
		$request->set_param( 'username', 'admin' );

		$response = $this->server->dispatch( $request );
		$data     = $response->get_data();

		$this->assertEquals( 200, $response->get_status() );
		$this->assertEquals( 2, $data['total'] );
		$this->assertCount( 2, $data['logs'] );
	}

	/**
	 * Test GET /anura/v1/blocked-logins with result filter
	 */
	public function test_get_blocked_logins_filter_by_result(): void {
		wp_set_current_user( $this->admin_user_id );

		// Insert blocked logins
		\Anura\LoginLogs\insert_blocked_login( 'user1', 'bad', '127.0.0.1', 'Mozilla/5.0' );
		\Anura\LoginLogs\insert_blocked_login( 'user2', 'warn', '127.0.0.2', 'Mozilla/5.0' );
		\Anura\LoginLogs\insert_blocked_login( 'user3', 'bad', '127.0.0.3', 'Mozilla/5.0' );

		$request = new WP_REST_Request( 'GET', '/anura/v1/blocked-logins' );
		$request->set_param( 'result', 'bad' );

		$response = $this->server->dispatch( $request );
		$data     = $response->get_data();

		$this->assertEquals( 200, $response->get_status() );
		$this->assertEquals( 2, $data['total'] );
		$this->assertCount( 2, $data['logs'] );

		foreach ( $data['logs'] as $log ) {
			$this->assertEquals( 'bad', $log['result'] );
		}
	}

	/**
	 * Test GET /anura/v1/blocked-logins with IP filter
	 */
	public function test_get_blocked_logins_filter_by_ip(): void {
		wp_set_current_user( $this->admin_user_id );

		// Insert blocked logins
		\Anura\LoginLogs\insert_blocked_login( 'user1', 'bad', '192.168.1.1', 'Mozilla/5.0' );
		\Anura\LoginLogs\insert_blocked_login( 'user2', 'warn', '192.168.1.2', 'Mozilla/5.0' );
		\Anura\LoginLogs\insert_blocked_login( 'user3', 'bad', '10.0.0.1', 'Mozilla/5.0' );

		$request = new WP_REST_Request( 'GET', '/anura/v1/blocked-logins' );
		$request->set_param( 'ip', '192.168' );

		$response = $this->server->dispatch( $request );
		$data     = $response->get_data();

		$this->assertEquals( 200, $response->get_status() );
		$this->assertEquals( 2, $data['total'] );
		$this->assertCount( 2, $data['logs'] );
	}

	/**
	 * Test GET /anura/v1/blocked-logins with date range filter
	 */
	public function test_get_blocked_logins_filter_by_date_range(): void {
		wp_set_current_user( $this->admin_user_id );

		global $wpdb;
		$table_name = $wpdb->prefix . 'anura_blocked_logins';

		// Insert logins at different times
		$wpdb->insert(
			$table_name,
			array(
				'username'   => 'user1',
				'result'     => 'bad',
				'ip_address' => '127.0.0.1',
				'user_agent' => 'Mozilla/5.0',
				'blocked_at' => '2024-01-01 12:00:00',
			),
			array( '%s', '%s', '%s', '%s', '%s' )
		);

		$wpdb->insert(
			$table_name,
			array(
				'username'   => 'user2',
				'result'     => 'warn',
				'ip_address' => '127.0.0.2',
				'user_agent' => 'Mozilla/5.0',
				'blocked_at' => '2024-06-15 12:00:00',
			),
			array( '%s', '%s', '%s', '%s', '%s' )
		);

		$wpdb->insert(
			$table_name,
			array(
				'username'   => 'user3',
				'result'     => 'bad',
				'ip_address' => '127.0.0.3',
				'user_agent' => 'Mozilla/5.0',
				'blocked_at' => '2024-12-31 12:00:00',
			),
			array( '%s', '%s', '%s', '%s', '%s' )
		);

		$request = new WP_REST_Request( 'GET', '/anura/v1/blocked-logins' );
		$request->set_param( 'start_date', '2024-06-01 00:00:00' );
		$request->set_param( 'end_date', '2024-12-31 23:59:59' );

		$response = $this->server->dispatch( $request );
		$data     = $response->get_data();

		$this->assertEquals( 200, $response->get_status() );
		$this->assertEquals( 2, $data['total'] );
		$this->assertCount( 2, $data['logs'] );
	}

	/**
	 * Test GET /anura/v1/blocked-logins requires admin permissions
	 */
	public function test_get_blocked_logins_requires_admin_permission(): void {
		wp_set_current_user( $this->subscriber_user_id );

		$request  = new WP_REST_Request( 'GET', '/anura/v1/blocked-logins' );
		$response = $this->server->dispatch( $request );

		$this->assertEquals( 403, $response->get_status() );
	}

	/**
	 * Test GET /anura/v1/blocked-logins returns empty result when no records exist
	 */
	public function test_get_blocked_logins_empty_result(): void {
		wp_set_current_user( $this->admin_user_id );

		$request  = new WP_REST_Request( 'GET', '/anura/v1/blocked-logins' );
		$response = $this->server->dispatch( $request );

		$this->assertEquals( 200, $response->get_status() );

		$data = $response->get_data();
		$this->assertEquals( 0, $data['total'] );
		$this->assertEmpty( $data['logs'] );
	}

	/**
	 * Test validate_settings function with valid settings
	 *
	 * Note: instanceId must be a numeric string for validation to pass.
	 * Type coercion works for numeric strings but not empty strings.
	 */
	public function test_validate_settings_accepts_valid_numeric_string(): void {
		$settings_manager = new Settings_Manager();
		$settings         = $settings_manager->get_default_settings();

		// Use numeric string for instanceId (will be coerced to integer)
		$settings['script']['instanceId'] = '123456';

		$errors = \Anura\Rest_Handlers\validate_settings( $settings );

		$this->assertIsArray( $errors );
		$this->assertEmpty( $errors, 'Settings with numeric string instanceId should be valid' );
	}

	/**
	 * Test validate_settings rejects empty string instanceId
	 *
	 * Empty strings can't be coerced to integers, so validation should fail.
	 */
	public function test_validate_settings_rejects_empty_instance_id(): void {
		$settings_manager = new Settings_Manager();
		$settings         = $settings_manager->get_default_settings();

		// Empty string can't be coerced to integer
		$settings['script']['instanceId'] = '';

		$errors = \Anura\Rest_Handlers\validate_settings( $settings );

		$this->assertIsArray( $errors );
		$this->assertNotEmpty( $errors, 'Empty string instanceId should fail validation' );
	}

	/**
	 * Test blocked logins route only supports GET
	 */
	public function test_blocked_logins_route_only_supports_get(): void {
		$routes = $this->server->get_routes();
		$route  = $routes['/anura/v1/blocked-logins'];

		$methods = array();
		foreach ( $route as $handler ) {
			if ( isset( $handler['methods'] ) ) {
				if ( is_array( $handler['methods'] ) ) {
					$methods = array_merge( $methods, array_keys( $handler['methods'] ) );
				} else {
					$methods[] = $handler['methods'];
				}
			}
		}

		$this->assertContains( 'GET', $methods, 'Blocked logins route should support GET' );
		$this->assertNotContains( 'POST', $methods, 'Blocked logins route should not support POST' );
	}

	/**
	 * Test save_settings_handler directly (not through REST API)
	 *
	 * This test calls the handler function directly to ensure code coverage
	 * is properly tracked for the handler logic. When calling through the
	 * REST API dispatcher, Xdebug may not track coverage correctly.
	 */
	public function test_save_settings_handler_directly(): void {
		wp_set_current_user( $this->admin_user_id );

		$settings_manager                 = new Settings_Manager();
		$settings                         = $settings_manager->get_default_settings();
		$settings['script']['instanceId'] = '789012';

		$request = new WP_REST_Request( 'POST', '/anura/v1/anura-settings' );
		$request->set_header( 'Content-Type', 'application/json' );
		$request->set_body( wp_json_encode( $settings ) );

		// Call the handler directly instead of through the REST API
		$response = \Anura\Rest_Handlers\save_settings_handler( $request );

		$this->assertEquals( 200, $response->get_status() );
		$data = $response->get_data();
		$this->assertArrayHasKey( 'msg', $data );
		$this->assertEquals( 'Settings saved.', $data['msg'] );
		$this->assertArrayHasKey( 'settings', $data );

		// Verify the settings were actually saved
		$saved_settings = $settings_manager->get_settings();
		$this->assertEquals( '789012', $saved_settings['script']['instanceId'] );
	}
}
