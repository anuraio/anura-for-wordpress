<?php
/**
 * Login Protection functionality for Anura plugin.
 *
 * Implements login form protection using Anura's fraud detection to block
 * suspicious login attempts based on configured security conditions.
 *
 * @package Anura
 */

declare(strict_types=1);

namespace Anura\LoginProtection;

use Anura\Settings_Manager\Settings_Manager;
use Exception;

use function Anura\Utilities\{
	is_action_enabled,
	get_action_condition,
	query_anura_visitor,
	prepare_anura_settings,
	is_instance_valid,
	result_matches_protect_condition,
	enqueue_anura_script
};

use function Anura\LoginLogs\{
	insert_blocked_login
};

add_action(
	'login_head',
	function () {
		$settings_manager = new Settings_Manager();
		$settings         = $settings_manager->get_settings();

		if ( ! is_action_enabled( $settings, 'protectLogin' ) ) {
			return;
		}

		$prepared_settings = prepare_anura_settings( $settings );

		$prepared_settings['context'] = 'login';

		enqueue_anura_script(
			'anura-login-protection',
			plugins_url( '/anura-script/dist/anura-includes.iife.js', __FILE__ ),
			$prepared_settings
		);
	},
	1
);

add_action(
	'login_init',
	function () {
		$logging_in = isset( $_POST['log'] ) && isset( $_POST['pwd'] );
		if ( ! $logging_in ) {
			return;
		}

		$settings_manager = new Settings_Manager();
		$settings         = $settings_manager->get_settings();

		if ( ! is_action_enabled( $settings, 'protectLogin' ) ) {
			return;
		}

		$visitor_id           = isset( $_POST['anura_visitor_id'] ) ? sanitize_text_field( $_POST['anura_visitor_id'] ) : '';
		$username             = isset( $_POST['log'] ) ? sanitize_text_field( $_POST['log'] ) : '';
		$protection_condition = get_action_condition( $settings, 'protectLogin' );

		$should_block = should_block_user( $visitor_id, $protection_condition, $settings, $username );

		if ( $should_block ) {
			wp_die(
				'Access denied by security policy.',
				'Login Blocked',
				array(
					'response'  => 403,
					'back_link' => true,
				)
			);
		}
	}
);

/**
 * Determine if a user should be blocked based on Anura analysis.
 *
 * @param string $visitor_id The Anura visitor ID from the login form.
 * @param string $condition The protection condition (e.g., 'warn', 'bad').
 * @param array  $settings The plugin settings.
 * @param string $username The username attempting to log in.
 * @return bool True if the user should be blocked, false otherwise.
 */
function should_block_user( string $visitor_id, string $condition, array $settings, string $username ): bool {
	if ( empty( $visitor_id ) ) {
		$instance_valid = is_instance_valid( (string) $settings['script']['instanceId'] ?? '' );

		if ( $instance_valid ) {
			log_blocked_login( $username );
			return true;
		}

		return false;
	}

	try {
		$anura_result = query_anura_visitor( $visitor_id, (string) $settings['script']['instanceId'] ?? '' );
	} catch ( Exception $e ) {
		return false;
	}

	if ( result_matches_protect_condition( $anura_result['result'], $condition ) ) {
		log_blocked_login( $username, $anura_result['result'] );
		return true;
	}

	return false;
}

/**
 * Log blocked login attempts for monitoring.
 *
 * @param string      $username The username that attempted to log in.
 * @param string|null $result The Anura result (e.g., 'warn', 'bad') or null if blocked due to missing visitor ID.
 * @return void
 */
function log_blocked_login( string $username, ?string $result = null ): void {
	$ip_address = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( $_SERVER['REMOTE_ADDR'] ) : '';
	$user_agent = isset( $_SERVER['HTTP_USER_AGENT'] ) ? sanitize_text_field( $_SERVER['HTTP_USER_AGENT'] ) : '';

	insert_blocked_login( $username, $result, $ip_address, $user_agent );
}
