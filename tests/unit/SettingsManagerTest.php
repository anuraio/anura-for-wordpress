<?php

/**
 * Tests for Settings_Manager class
 *
 * @package Anura_Io
 */

require_once __DIR__ . '/../../class-settings-manager.php';

use Anura\Settings_Manager\Settings_Manager;
use PHPUnit\Framework\TestCase;

class SettingsManagerTest extends TestCase {


	private Settings_Manager $settings_manager;

	public function setUp(): void {
		WP_Mock::setUp();
		$this->settings_manager = new Settings_Manager();
	}

	public function tearDown(): void {
		WP_Mock::tearDown();
	}

	/**
	 * Test get_settings returns existing settings when they exist
	 */
	public function test_get_settings_returns_existing_settings(): void {
		$expected_settings = array(
			'script' => array(
				'instanceId' => '12345',
			),
		);

		WP_Mock::userFunction( 'get_option' )
			->once()
			->with( 'anura_settings' )
			->andReturn( $expected_settings );

		WP_Mock::userFunction( 'get_option' )
			->with( 'anura_settings_option_name' )
			->andReturn( false );

		$result = $this->settings_manager->get_settings();

		$this->assertSame( $expected_settings, $result );
	}

	/**
	 * Test get_settings returns default settings when no settings exist
	 */
	public function test_get_settings_returns_defaults_when_no_settings_exist(): void {
		WP_Mock::userFunction( 'get_option' )
			->once()
			->with( 'anura_settings' )
			->andReturn( false );

		WP_Mock::userFunction( 'get_option' )
			->once()
			->with( 'anura_settings_option_name' )
			->andReturn( false );

		$result = $this->settings_manager->get_settings();

		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'script', $result );
		$this->assertArrayHasKey( 'realTimeActions', $result );
		$this->assertArrayHasKey( 'bots', $result );
		$this->assertArrayHasKey( 'social', $result );
		$this->assertArrayHasKey( 'advanced', $result );
		$this->assertSame( '', $result['script']['instanceId'] );
	}

	/**
	 * Test save_settings calls update_option with correct parameters
	 */
	public function test_save_settings_calls_update_option(): void {
		$settings = array(
			'script' => array(
				'instanceId' => '67890',
			),
		);

		WP_Mock::userFunction( 'update_option' )
			->once()
			->with( 'anura_settings', $settings )
			->andReturn( true );

		$this->settings_manager->save_settings( $settings );

		$this->expectNotToPerformAssertions();
	}

	/**
	 * Test get_default_settings returns expected structure
	 */
	public function test_get_default_settings_structure(): void {
		$defaults = $this->settings_manager->get_default_settings();

		// Test top-level keys
		$this->assertArrayHasKey( 'script', $defaults );
		$this->assertArrayHasKey( 'realTimeActions', $defaults );
		$this->assertArrayHasKey( 'bots', $defaults );
		$this->assertArrayHasKey( 'social', $defaults );
		$this->assertArrayHasKey( 'advanced', $defaults );

		// Test script settings
		$this->assertArrayHasKey( 'instanceId', $defaults['script'] );
		$this->assertArrayHasKey( 'sourceMethod', $defaults['script'] );
		$this->assertArrayHasKey( 'campaignMethod', $defaults['script'] );
		$this->assertArrayHasKey( 'additionalData', $defaults['script'] );
		$this->assertSame( 'none', $defaults['script']['sourceMethod'] );
		$this->assertSame( 'none', $defaults['script']['campaignMethod'] );

		// Test additionalData has 10 items
		$this->assertCount( 10, $defaults['script']['additionalData'] );
		$this->assertSame( 'get', $defaults['script']['additionalData'][0]['method'] );
		$this->assertSame( '', $defaults['script']['additionalData'][0]['value'] );

		// Test realTimeActions
		$this->assertArrayHasKey( 'redirectAction', $defaults['realTimeActions'] );
		$this->assertArrayHasKey( 'actions', $defaults['realTimeActions'] );
		$this->assertArrayHasKey( 'retryDurationSeconds', $defaults['realTimeActions'] );
		$this->assertSame( 'noRedirect', $defaults['realTimeActions']['redirectAction']['resultCondition'] );
		$this->assertSame( 4, $defaults['realTimeActions']['retryDurationSeconds'] );

		// Test actions array
		$this->assertCount( 6, $defaults['realTimeActions']['actions'] );
		$this->assertSame( 'disableForms', $defaults['realTimeActions']['actions'][0]['name'] );
		$this->assertSame( 'noDisable', $defaults['realTimeActions']['actions'][0]['resultCondition'] );

		// Test bots
		$this->assertFalse( $defaults['bots']['enabled'] );
		$this->assertIsArray( $defaults['bots']['whitelist'] );
		$this->assertGreaterThan( 0, count( $defaults['bots']['whitelist'] ) );

		// Test advanced settings
		$this->assertArrayHasKey( 'fallbacks', $defaults['advanced'] );
		$this->assertArrayHasKey( 'serverActions', $defaults['advanced'] );
		$this->assertArrayHasKey( 'contentDeployment', $defaults['advanced'] );
		$this->assertFalse( $defaults['advanced']['serverActions']['addHeaders'] );
	}

	/**
	 * Test repair_settings preserves user instanceId
	 */
	public function test_repair_settings_preserves_user_data(): void {
		$old_settings = array(
			'script'          => array(
				'instanceId'     => 'user-instance-123',
				'sourceMethod'   => 'get',
				'sourceValue'    => 'utm_source',
				'campaignMethod' => 'post',
				'campaignValue'  => 'campaign',
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
						'resultCondition' => 'noDisable',
					),
				),
			),
		);

		WP_Mock::userFunction( 'update_option' )
			->once()
			->with( 'anura_settings', WP_Mock\Functions::type( 'array' ) )
			->andReturn( true );

		$result = $this->settings_manager->repair_settings( $old_settings );

		$this->assertSame( 'user-instance-123', $result['script']['instanceId'] );
		$this->assertSame( 'get', $result['script']['sourceMethod'] );
		$this->assertSame( 'utm_source', $result['script']['sourceValue'] );
		$this->assertSame( 'post', $result['script']['campaignMethod'] );
		$this->assertSame( 'campaign', $result['script']['campaignValue'] );
	}

	/**
	 * Test repair_settings fills in missing fields with defaults
	 */
	public function test_repair_settings_fills_missing_fields(): void {
		$old_settings = array(
			'script'          => array(
				'instanceId'     => 'test-123',
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
						'resultCondition' => 'noDisable',
					),
				),
			),
		);

		WP_Mock::userFunction( 'update_option' )
			->once()
			->with( 'anura_settings', WP_Mock\Functions::type( 'array' ) )
			->andReturn( true );

		$result = $this->settings_manager->repair_settings( $old_settings );

		$this->assertSame( 'test-123', $result['script']['instanceId'] );
		$this->assertSame( 'none', $result['script']['sourceMethod'] );
		$this->assertSame( '', $result['script']['sourceValue'] );
		$this->assertArrayHasKey( 'realTimeActions', $result );
		$this->assertArrayHasKey( 'bots', $result );
	}

	/**
	 * Test repair_settings migrates legacy additionalData format
	 */
	public function test_repair_settings_migrates_legacy_additional_data(): void {
		$old_settings = array(
			'script'          => array(
				'instanceId'     => '123',
				'additionalData' => array(
					'param1',
					'param2',
					'',
					'param4',
				),
			),
			'realTimeActions' => array(
				'actions' => array(
					array(
						'name'            => 'disableForms',
						'resultCondition' => 'noDisable',
					),
				),
			),
		);

		WP_Mock::userFunction( 'update_option' )
			->once()
			->with( 'anura_settings', WP_Mock\Functions::type( 'array' ) )
			->andReturn( true );

		$result = $this->settings_manager->repair_settings( $old_settings );

		$this->assertIsArray( $result['script']['additionalData'] );
		$this->assertSame( 'hardCoded', $result['script']['additionalData'][0]['method'] );
		$this->assertSame( 'param1', $result['script']['additionalData'][0]['value'] );
		$this->assertSame( 'get', $result['script']['additionalData'][2]['method'] );
		$this->assertSame( '', $result['script']['additionalData'][2]['value'] );
	}

	/**
	 * Test repair_settings preserves actions configuration
	 */
	public function test_repair_settings_preserves_actions(): void {
		$old_settings = array(
			'script'          => array(
				'instanceId'     => '123',
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
					array(
						'name'            => 'disableCommentSubmits',
						'resultCondition' => 'onWarning',
					),
					array(
						'name'            => 'disableAllSubmits',
						'resultCondition' => 'noDisable',
					),
					array(
						'name'            => 'disableLinks',
						'resultCondition' => 'onBoth',
					),
					array(
						'name'            => 'disableAllInputs',
						'resultCondition' => 'noDisable',
					),
				),
			),
		);

		WP_Mock::userFunction( 'update_option' )
			->once()
			->with( 'anura_settings', WP_Mock\Functions::type( 'array' ) )
			->andReturn( true );

		$result = $this->settings_manager->repair_settings( $old_settings );

		$disable_forms_action = array_values(
			array_filter(
				$result['realTimeActions']['actions'],
				function ( $action ) {
					return $action['name'] === 'disableForms';
				}
			)
		)[0];

		$this->assertSame( 'onBad', $disable_forms_action['resultCondition'] );

		$disable_comments_action = array_values(
			array_filter(
				$result['realTimeActions']['actions'],
				function ( $action ) {
					return $action['name'] === 'disableCommentSubmits';
				}
			)
		)[0];

		$this->assertSame( 'onWarning', $disable_comments_action['resultCondition'] );
	}
}
