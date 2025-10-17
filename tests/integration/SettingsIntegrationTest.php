<?php
/**
 * Integration tests for Settings_Manager with real WordPress
 *
 * These tests verify the Settings_Manager class works correctly
 * when interacting with an actual WordPress database
 *
 * @package Anura_Io
 */

require_once __DIR__ . '/../../class-settings-manager.php';

use Anura\Settings_Manager\Settings_Manager;

class SettingsIntegrationTest extends WP_UnitTestCase {

	private Settings_Manager $settings_manager;

	public function setUp(): void {
		parent::setUp();
		$this->settings_manager = new Settings_Manager();

		// Clean up any existing settings
		delete_option( 'anura_settings' );
		delete_option( 'anura_settings_option_name' );
	}

	public function tearDown(): void {
		// Clean up after tests
		delete_option( 'anura_settings' );
		delete_option( 'anura_settings_option_name' );
		parent::tearDown();
	}

	/**
	 * Test get_settings returns defaults when no settings exist in database
	 */
	public function test_get_settings_returns_defaults_on_fresh_install(): void {
		$settings = $this->settings_manager->get_settings();

		$this->assertIsArray( $settings );
		$this->assertArrayHasKey( 'script', $settings );
		$this->assertArrayHasKey( 'realTimeActions', $settings );
		$this->assertArrayHasKey( 'bots', $settings );
		$this->assertSame( '', $settings['script']['instanceId'] );
	}

	/**
	 * Test save_settings actually persists to database
	 */
	public function test_save_settings_persists_to_database(): void {
		$test_settings = array(
			'script' => array(
				'instanceId'     => 'test-12345',
				'sourceMethod'   => 'get',
				'campaignMethod' => 'post',
			),
		);

		$this->settings_manager->save_settings( $test_settings );

		// Retrieve directly from WordPress options
		$saved_settings = get_option( 'anura_settings' );

		$this->assertIsArray( $saved_settings );
		$this->assertSame( 'test-12345', $saved_settings['script']['instanceId'] );
		$this->assertSame( 'get', $saved_settings['script']['sourceMethod'] );
	}

	/**
	 * Test get_settings retrieves saved settings from database
	 */
	public function test_get_settings_retrieves_saved_settings(): void {
		$test_settings = array(
			'script' => array(
				'instanceId' => 'integration-test-999',
			),
		);

		// Save via WordPress directly
		update_option( 'anura_settings', $test_settings );

		// Retrieve via Settings_Manager
		$retrieved = $this->settings_manager->get_settings();

		$this->assertSame( 'integration-test-999', $retrieved['script']['instanceId'] );
	}

	/**
	 * Test repair_settings works with real database operations
	 */
	public function test_repair_settings_updates_database(): void {
		// Create incomplete settings
		$old_settings = array(
			'script'          => array(
				'instanceId'     => 'repair-test',
				'sourceMethod'   => 'get',
				'additionalData' => array(
					array(
						'method' => 'get',
						'value'  => '',
					),
				),
			),
			'realTimeActions' => array(
				'actions' => array(
					array(
						'name'            => 'disableForms',
						'resultCondition' => 'onBad',
					),
				),
			),
		);

		$repaired = $this->settings_manager->repair_settings( $old_settings );

		// Verify repaired settings were saved to database
		$db_settings = get_option( 'anura_settings' );

		$this->assertIsArray( $db_settings );
		$this->assertSame( 'repair-test', $db_settings['script']['instanceId'] );
		$this->assertArrayHasKey( 'bots', $db_settings );
		$this->assertArrayHasKey( 'social', $db_settings );
		$this->assertArrayHasKey( 'advanced', $db_settings );
	}

	/**
	 * Test settings persist across multiple saves
	 */
	public function test_settings_persist_across_multiple_operations(): void {
		$settings1 = array(
			'script' => array(
				'instanceId' => 'first-save',
			),
		);

		$this->settings_manager->save_settings( $settings1 );
		$retrieved1 = $this->settings_manager->get_settings();
		$this->assertSame( 'first-save', $retrieved1['script']['instanceId'] );

		$settings2 = array(
			'script' => array(
				'instanceId' => 'second-save',
			),
		);

		$this->settings_manager->save_settings( $settings2 );
		$retrieved2 = $this->settings_manager->get_settings();
		$this->assertSame( 'second-save', $retrieved2['script']['instanceId'] );
	}

	/**
	 * Test default settings contain all required keys
	 */
	public function test_default_settings_are_complete(): void {
		$defaults = $this->settings_manager->get_default_settings();

		// Top level keys
		$this->assertArrayHasKey( 'script', $defaults );
		$this->assertArrayHasKey( 'realTimeActions', $defaults );
		$this->assertArrayHasKey( 'bots', $defaults );
		$this->assertArrayHasKey( 'social', $defaults );
		$this->assertArrayHasKey( 'advanced', $defaults );

		// Script settings
		$this->assertArrayHasKey( 'instanceId', $defaults['script'] );
		$this->assertArrayHasKey( 'sourceMethod', $defaults['script'] );
		$this->assertArrayHasKey( 'campaignMethod', $defaults['script'] );
		$this->assertArrayHasKey( 'additionalData', $defaults['script'] );

		// Verify additionalData structure
		$this->assertCount( 10, $defaults['script']['additionalData'] );
		$this->assertArrayHasKey( 'method', $defaults['script']['additionalData'][0] );
		$this->assertArrayHasKey( 'value', $defaults['script']['additionalData'][0] );
	}
}
