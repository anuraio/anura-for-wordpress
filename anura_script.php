<?php
declare(strict_types = 1);
namespace Anura\Script;

/**
 * Creates and injects an Anura Script tag onto the user's WordPress site. 
 * Also adds other scripts that it requires such as callbacks and 
 * real time actions.
 */
add_action("wp_head", function() {
    $settings = get_option(SETTINGS_NAME);
    if (!$settings) {
        return;
    } 

    $scriptSettings = $settings["script"];
    $fallbackSettings = $settings["fallbacks"];

    $source = getTrafficDetail(
        $scriptSettings["sourceMethod"], 
        $scriptSettings["sourceValue"], 
        $fallbackSettings["sources"]
    );

    $campaign = getTrafficDetail(
        $scriptSettings["campaignMethod"], 
        $scriptSettings["campaignValue"], 
        $fallbackSettings["campaigns"]
    );

    $settings["script"]["source"] = $source;
    $settings["script"]["campaign"] = $campaign;

    addAnuraIncludes($settings);
}, 1);

add_filter('script_loader_tag', function ($tag, $handle) {
    if ($handle !== "anura-includes") {
        return $tag;
    }
   
    return str_replace(' src',' async src', $tag);
   
   }, 10, 2);

/**
 * Gets the traffic detail (source/campaign) of a request according to their settings.
 */
function getTrafficDetail(string $method, string $value, array $fallback_values): string
{
    switch ($method) {
        case 'get':
            return sanitize_text_field($_GET[$value] ?? getFallbackDetail($fallback_values, $method));
        case 'post':
            return sanitize_text_field($_POST[$value] ?? getFallbackDetail($fallback_values, $method));
        case 'hardCoded':
            return sanitize_text_field($value ?? '');
        default:
            return '';
    }
}

/**
 * Gets the fallback traffic detail of a request according to their settings. 
 * An empty string is returned if no fallback traffic details can be found.
 */
function getFallbackDetail(array $fallback_values, string $method): string
{
    foreach($fallback_values as $fallback_value)
    {
        switch ($method) {
            case 'get':
                if (isset($_GET[$fallback_value])) return $_GET[$fallback_value];
            case 'post':
                if (isset($_POST[$fallback_value])) return $_POST[$fallback_value];
        }
    }

    return '';
}

/**
 * Adds all necessary JavaScript to perform the plugin's functionalities (Anura Script, Real Time Actions, etc.)
 * Their Anura Plugin settings are also added so that they can be applied.
 */
function addAnuraIncludes(array $settings)
{
    wp_enqueue_script(
        'anura-includes',
        plugins_url('/js/anura-includes.js', __FILE__)
    );

    // Adding the user's plugin settings as a JavaScript object called anuraOptions.
    wp_localize_script('anura-includes', 'anuraOptions', json_encode($settings));
}