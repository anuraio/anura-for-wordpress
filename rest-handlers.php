<?php
/**
 * REST API Handlers for Anura plugin.
 *
 * Handles GET/POST requests for settings and blocked login data via WordPress REST API.
 *
 * @package Anura
 */

declare(strict_types = 1);
namespace Anura\Rest_Handlers;

require_once __DIR__ . '/class-settings-manager.php';
require_once __DIR__ . '/login-protection-db.php';

use WP_REST_Request;
use WP_REST_Response;
use Anura\Settings_Manager\Settings_Manager;
use JsonSchema\Validator;
use JsonSchema\Constraints\Constraint;
use Exception;

use function Anura\LoginLogs\get_blocked_logins;

/**
 * Returns the settings saved by the user
 *
 * @return WP_REST_Response Settings data
 */
function get_settings_handler(): WP_REST_Response {
	$settings_manager = new Settings_Manager();
	$settings         = $settings_manager->get_settings();
	return new WP_REST_Response( $settings );
}


/**
 * Validates and saves the given settings.
 *
 * Returns 200 on success or 400 with validation errors if invalid.
 *
 * @param WP_REST_Request $request The REST request containing settings JSON.
 * @return WP_REST_Response Success message or validation errors.
 */
function save_settings_handler( WP_REST_Request $request ): WP_REST_Response {
	$settings = $request->get_json_params();
	$errors   = validate_settings( $settings );

	if ( count( $errors ) > 0 ) {
		return new WP_REST_Response(
			array( 'errors' => $errors ),
			400,
			array( 'Content-Type' => 'application/json' )
		);
	}

	$settings_manager = new Settings_Manager();
	$settings_manager->save_settings( $settings );
	return new WP_REST_Response(
		array(
			'msg'      => 'Settings saved.',
			'settings' => wp_json_encode( $settings ),
		),
		200,
		array(
			'Content-Type' => 'application/json',
		)
	);
}

/**
 * Validates settings against the JSON schema.
 *
 * @param array $settings The settings to validate.
 * @return array Array of validation error objects (empty if valid).
 */
function validate_settings( array $settings ): array {
	$settings_manager = new Settings_Manager();
	$schema           = json_decode( $settings_manager->get_settings_schema() );
	$data_obj         = json_decode( wp_json_encode( $settings ) );

	$validator = new Validator();
	$validator->validate( $data_obj, $schema, Constraint::CHECK_MODE_COERCE_TYPES );

	if ( $validator->isValid() ) {
		return array();
	} else {
		return $validator->getErrors();
	}
}

/**
 * Returns blocked login attempts with pagination and filters.
 *
 * @param WP_REST_Request $request The REST request with filter parameters.
 * @return WP_REST_Response Paginated blocked login records or error response.
 */
function get_blocked_logins_handler( WP_REST_Request $request ): WP_REST_Response {
	$page = (int) ( $request->get_param( 'page' ) ?? 1 );
	if ( $page < 1 ) {
		$page = 1;
	}

	$per_page = (int) ( $request->get_param( 'per_page' ) ?? 20 );
	if ( $per_page < 1 ) {
		$per_page = 1;
	}

	$username_filter = sanitize_text_field( $request->get_param( 'username' ) ?? '' );
	$result_filter   = sanitize_text_field( $request->get_param( 'result' ) ?? '' );
	$ip_filter       = sanitize_text_field( $request->get_param( 'ip' ) ?? '' );
	$start_date      = sanitize_text_field( $request->get_param( 'start_date' ) ?? '' );
	$end_date        = sanitize_text_field( $request->get_param( 'end_date' ) ?? '' );

	try {
		$data = get_blocked_logins(
			$page,
			$per_page,
			$username_filter,
			$result_filter,
			$ip_filter,
			$start_date,
			$end_date
		);

		return new WP_REST_Response( $data );
	} catch ( Exception $e ) {
		return new WP_REST_Response(
			array(
				'error'   => 'Database error occurred',
				'message' => $e->getMessage(),
			),
			500,
			array( 'Content-Type' => 'application/json' )
		);
	}
}
