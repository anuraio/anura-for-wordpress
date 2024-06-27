<?php
declare(strict_types = 1);
namespace Anura\RestHandlers;
require_once __DIR__ . "/SettingsManager.php";

use WP_REST_Request;
use WP_REST_Response;
use Anura\SettingsManager\SettingsManager;
use JsonSchema\Validator;
use JsonSchema\Constraints\Constraint;

/**
 * Returns the settings saved by the user.
 */
function getSettingsHandler()
{
    $settings = SettingsManager::getSettings();
    return new WP_REST_Response($settings);
}


/**
 * Validates and saves the given settings so long as the settings are of valid format.
 * Otherwise returns a 400 response with error(s) stating which field(s) are invalid.
 */
function saveSettingsHandler(WP_REST_Request $request)
{
    $settings = $request->get_json_params();
    $errors = validateSettings($settings);

    if (count($errors) > 0) {
        return new WP_REST_Response(
            ["errors" => $errors],
            400,
            ["Content-Type" => "application/json"]
        );
    }

    SettingsManager::saveSettings($settings);
    return new WP_REST_Response(
        [
            "msg" => "Settings saved.",
            "settings" => json_encode($settings)
        ],
        200,
        [
            "Content-Type" => "application/json"
        ]
    ); 
}

/**
 * Takes a JSON object and validates it under the 
 * SettingsManager's settings schema. After validating, it will return an 
 * array of errors. If the array is empty, the settings are valid and safe 
 * to be stored.
 */
function validateSettings(array $settings): array
{
    $schema = json_decode(SettingsManager::getSettingsSchema());
    $dataObj = json_decode(json_encode(($settings)));

    $validator = new Validator();
    $validator->validate($dataObj, $schema, Constraint::CHECK_MODE_COERCE_TYPES);

    if ($validator->isValid()) {
        return [];
    } else {
        return $validator->getErrors();
    }
}