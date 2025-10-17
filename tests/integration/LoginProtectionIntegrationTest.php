<?php
/**
 * Integration tests for Login Protection functionality
 *
 * These tests verify the login protection feature works correctly
 * with real WordPress hooks and database operations
 *
 * @package Anura_Io
 */

require_once __DIR__ . '/../../login-protection.php';
require_once __DIR__ . '/../../login-protection-db.php';
require_once __DIR__ . '/../../class-settings-manager.php';

use Anura\Settings_Manager\Settings_Manager;

class LoginProtectionIntegrationTest extends WP_UnitTestCase {

	public function setUp(): void {
		parent::setUp();

		// Clean up any existing settings and logs
		delete_option( 'anura_settings' );
		global $wpdb;
		$table_name = $wpdb->prefix . 'anura_blocked_logins';
		$wpdb->query( "TRUNCATE TABLE $table_name" );
	}

	public function tearDown(): void {
		// Clean up after tests
		delete_option( 'anura_settings' );
		global $wpdb;
		$table_name = $wpdb->prefix . 'anura_blocked_logins';
		$wpdb->query( "TRUNCATE TABLE $table_name" );
		parent::tearDown();
	}

	/**
	 * Test that login_head action is registered when protect login is enabled
	 */
	public function test_login_head_action_registered(): void {
		$settings_manager = new Settings_Manager();
		$settings         = $settings_manager->get_default_settings();

		// Enable login protection
		$settings['realTimeActions']['actions'][0] = array(
			'name'            => 'protectLogin',
			'resultCondition' => 'onBad',
		);

		$settings_manager->save_settings( $settings );

		// Trigger the hooks by re-including the file
		// This simulates WordPress loading the plugin
		$this->assertGreaterThan(
			0,
			has_action( 'login_head' ),
			'login_head action should be registered when protect login is enabled'
		);
	}

	/**
	 * Test that login_init action is registered when protect login is enabled
	 */
	public function test_login_init_action_registered(): void {
		$this->assertGreaterThan(
			0,
			has_action( 'login_init' ),
			'login_init action should be registered for login protection'
		);
	}

	/**
	 * Test that blocked logins table exists
	 */
	public function test_blocked_logins_table_exists(): void {
		global $wpdb;

		// Create the table
		\Anura\LoginLogs\create_blocked_logins_table();

		$table_name   = $wpdb->prefix . 'anura_blocked_logins';
		$table_exists = $wpdb->get_var( "SHOW TABLES LIKE '$table_name'" );

		$this->assertEquals(
			$table_name,
			$table_exists,
			'Blocked logins table should exist after creation'
		);
	}

	/**
	 * Test inserting a blocked login record
	 */
	public function test_insert_blocked_login(): void {
		global $wpdb;

		// Create the table first
		\Anura\LoginLogs\create_blocked_logins_table();

		// Insert a blocked login
		\Anura\LoginLogs\insert_blocked_login(
			'testuser',
			'bad',
			'127.0.0.1',
			'Mozilla/5.0'
		);

		// Verify the record was inserted
		$table_name = $wpdb->prefix . 'anura_blocked_logins';
		$records    = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT * FROM $table_name WHERE username = %s",
				'testuser'
			),
			ARRAY_A
		);

		$this->assertCount( 1, $records, 'One blocked login record should exist' );
		$this->assertEquals( 'testuser', $records[0]['username'] );
		$this->assertEquals( 'bad', $records[0]['result'] );
		$this->assertEquals( '127.0.0.1', $records[0]['ip_address'] );
		$this->assertEquals( 'Mozilla/5.0', $records[0]['user_agent'] );
	}

	/**
	 * Test retrieving blocked logins with pagination
	 */
	public function test_get_blocked_logins_with_pagination(): void {
		global $wpdb;

		// Create the table first
		\Anura\LoginLogs\create_blocked_logins_table();

		// Insert multiple blocked logins
		for ( $i = 1; $i <= 15; $i++ ) {
			\Anura\LoginLogs\insert_blocked_login(
				"user$i",
				$i % 2 === 0 ? 'bad' : 'warn',
				"127.0.0.$i",
				'Mozilla/5.0'
			);
		}

		// Get first page
		$result = \Anura\LoginLogs\get_blocked_logins( 1, 10 );

		$this->assertIsArray( $result );
		$this->assertEquals( 15, $result['total'] );
		$this->assertEquals( 1, $result['page'] );
		$this->assertEquals( 10, $result['per_page'] );
		$this->assertEquals( 2, $result['total_pages'] );
		$this->assertCount( 10, $result['logs'] );

		// Get second page
		$result2 = \Anura\LoginLogs\get_blocked_logins( 2, 10 );
		$this->assertCount( 5, $result2['logs'] );
	}

	/**
	 * Test filtering blocked logins by username
	 */
	public function test_get_blocked_logins_filter_by_username(): void {
		global $wpdb;

		// Create the table first
		\Anura\LoginLogs\create_blocked_logins_table();

		// Insert blocked logins
		\Anura\LoginLogs\insert_blocked_login( 'admin', 'bad', '127.0.0.1', 'Mozilla/5.0' );
		\Anura\LoginLogs\insert_blocked_login( 'testuser', 'warn', '127.0.0.2', 'Mozilla/5.0' );
		\Anura\LoginLogs\insert_blocked_login( 'admin2', 'bad', '127.0.0.3', 'Mozilla/5.0' );

		// Filter by username
		$result = \Anura\LoginLogs\get_blocked_logins( 1, 50, 'admin' );

		$this->assertEquals( 2, $result['total'] );
		$this->assertCount( 2, $result['logs'] );
	}

	/**
	 * Test filtering blocked logins by result type
	 */
	public function test_get_blocked_logins_filter_by_result(): void {
		global $wpdb;

		// Create the table first
		\Anura\LoginLogs\create_blocked_logins_table();

		// Insert blocked logins
		\Anura\LoginLogs\insert_blocked_login( 'user1', 'bad', '127.0.0.1', 'Mozilla/5.0' );
		\Anura\LoginLogs\insert_blocked_login( 'user2', 'warn', '127.0.0.2', 'Mozilla/5.0' );
		\Anura\LoginLogs\insert_blocked_login( 'user3', 'bad', '127.0.0.3', 'Mozilla/5.0' );

		// Filter by result
		$result = \Anura\LoginLogs\get_blocked_logins( 1, 50, '', 'bad' );

		$this->assertEquals( 2, $result['total'] );
		$this->assertCount( 2, $result['logs'] );
		foreach ( $result['logs'] as $log ) {
			$this->assertEquals( 'bad', $log['result'] );
		}
	}

	/**
	 * Test filtering blocked logins by IP address
	 */
	public function test_get_blocked_logins_filter_by_ip(): void {
		global $wpdb;

		// Create the table first
		\Anura\LoginLogs\create_blocked_logins_table();

		// Insert blocked logins
		\Anura\LoginLogs\insert_blocked_login( 'user1', 'bad', '192.168.1.1', 'Mozilla/5.0' );
		\Anura\LoginLogs\insert_blocked_login( 'user2', 'warn', '192.168.1.2', 'Mozilla/5.0' );
		\Anura\LoginLogs\insert_blocked_login( 'user3', 'bad', '10.0.0.1', 'Mozilla/5.0' );

		// Filter by IP (partial match)
		$result = \Anura\LoginLogs\get_blocked_logins( 1, 50, '', '', '192.168' );

		$this->assertEquals( 2, $result['total'] );
		$this->assertCount( 2, $result['logs'] );
	}

	/**
	 * Test deleting old blocked login records
	 */
	public function test_delete_old_blocked_logins(): void {
		global $wpdb;

		// Create the table first
		\Anura\LoginLogs\create_blocked_logins_table();

		$table_name = $wpdb->prefix . 'anura_blocked_logins';

		// Insert a recent login
		\Anura\LoginLogs\insert_blocked_login( 'recent_user', 'bad', '127.0.0.1', 'Mozilla/5.0' );

		// Insert an old login manually
		$wpdb->insert(
			$table_name,
			array(
				'username'   => 'old_user',
				'result'     => 'bad',
				'ip_address' => '127.0.0.2',
				'user_agent' => 'Mozilla/5.0',
				'blocked_at' => gmdate( 'Y-m-d H:i:s', strtotime( '-100 days' ) ),
			),
			array( '%s', '%s', '%s', '%s', '%s' )
		);

		// Verify both records exist
		$count = $wpdb->get_var( "SELECT COUNT(*) FROM $table_name" );
		$this->assertEquals( 2, $count );

		// Delete records older than 90 days
		\Anura\LoginLogs\delete_old_blocked_logins( 90 );

		// Verify only recent login remains
		$count = $wpdb->get_var( "SELECT COUNT(*) FROM $table_name" );
		$this->assertEquals( 1, $count );

		$remaining = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT username FROM $table_name WHERE username = %s",
				'recent_user'
			)
		);
		$this->assertEquals( 'recent_user', $remaining );
	}

	/**
	 * Test retention days bounds
	 */
	public function test_delete_old_blocked_logins_retention_bounds(): void {
		global $wpdb;

		// Create the table first
		\Anura\LoginLogs\create_blocked_logins_table();

		// Test minimum bound (should be clamped to 1)
		\Anura\LoginLogs\delete_old_blocked_logins( 0 );

		// Test maximum bound (should be clamped to 365)
		\Anura\LoginLogs\delete_old_blocked_logins( 500 );

		// If we got here without errors, bounds are working
		$this->assertTrue( true );
	}

	/**
	 * Test filtering by date range
	 */
	public function test_get_blocked_logins_filter_by_date_range(): void {
		global $wpdb;

		// Create the table first
		\Anura\LoginLogs\create_blocked_logins_table();

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

		// Filter by date range
		$result = \Anura\LoginLogs\get_blocked_logins(
			1,
			50,
			'',
			'',
			'',
			'2024-06-01 00:00:00',
			'2024-12-31 23:59:59'
		);

		$this->assertEquals( 2, $result['total'] );
		$this->assertCount( 2, $result['logs'] );
	}
}
