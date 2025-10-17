<?php

require_once __DIR__ . '/../../class-settings-manager.php';

use Anura\Settings_Manager\Settings_Manager;

class SettingsManagerIntegrationTest extends WP_UnitTestCase {



	private Settings_Manager $settings_manager;

	public function setUp(): void {
		parent::setUp();
		$this->settings_manager = new Settings_Manager();

		delete_option( 'anura_settings' );
		delete_option( 'anura_settings_option_name' );
	}

	public function tearDown(): void {
		delete_option( 'anura_settings' );
		delete_option( 'anura_settings_option_name' );
		parent::tearDown();
	}

	// TODO: make it an integration test
	public function test_migrate_settings_can_migrate_original_schema(): void {
		$old_settings = array(
			'instance_id_0'              => '123456',
			'source_variable_source_1'   => 'option-one',
			'source_2'                   => 'my-source',
			'campaign_variable_source_3' => 'option-two',
			'campaign_4'                 => 'my-campaign',
			'callback_id_0'              => 'myCallbackFunction',
			'redirect_on_bad_0'          => 'option-seven',
			'allow_webcrawlers_0'        => null,
			'redirect_url_id'            => 'https://anura.io',
		);

		update_option( 'anura_settings_option_name', $old_settings );

		$migrated_settings = $this->settings_manager->get_settings();

		$this->assertEquals( $migrated_settings['script']['instanceId'], '123456' );
		$this->assertEquals( $migrated_settings['script']['sourceMethod'], 'get' );
		$this->assertEquals( $migrated_settings['script']['sourceValue'], 'my-source' );
		$this->assertEquals( $migrated_settings['script']['campaignMethod'], 'post' );
		$this->assertEquals( $migrated_settings['script']['campaignValue'], 'my-campaign' );
		$this->assertArrayHasKey( 'realTimeActions', $migrated_settings );
		$this->assertArrayHasKey( 'bots', $migrated_settings );
		$this->assertArrayHasKey( 'social', $migrated_settings );
	}

	public function test_migrate_settings_can_migrate_original_traffic_details(): void {
		$source_methods = array(
			'option-none' => 'none',
			'option-one'  => 'get',
			'option-two'  => 'post',
			'option-four' => 'hardCoded',
		);

		foreach ( $source_methods as $old_method => $new_method ) {
			// Clean up from previous iteration to ensure fresh migration
			delete_option( 'anura_settings' );
			delete_option( 'anura_settings_option_name' );

			$old_settings = array(
				'source_variable_source_1' => $old_method,
			);

			update_option( 'anura_settings_option_name', $old_settings );
			$migrated_settings = $this->settings_manager->get_settings();

			$this->assertEquals( $migrated_settings['script']['sourceMethod'], $new_method );
		}
	}


	public function test_migrate_settings_can_migrate_o(): void {
		$source_methods = array(
			'option-none' => 'none',
			'option-one'  => 'get',
			'option-two'  => 'post',
			'option-four' => 'hardCoded',
		);

		foreach ( $source_methods as $old_method => $new_method ) {
			// Clean up from previous iteration to ensure fresh migration
			delete_option( 'anura_settings' );
			delete_option( 'anura_settings_option_name' );

			$old_settings = array(
				'source_variable_source_1' => $old_method,
			);

			update_option( 'anura_settings_option_name', $old_settings );
			$migrated_settings = $this->settings_manager->get_settings();

			$this->assertEquals( $migrated_settings['script']['sourceMethod'], $new_method );
		}
	}
}
