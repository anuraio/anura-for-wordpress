<?php
declare(strict_types = 1);
namespace Anura\SettingsManager;

define("SETTINGS_NAME", "anura_settings");
define("OLD_SETTINGS_NAME", "anura_settings_option_name");

class SettingsManager
{
    private function __construct() {}

    /**
     * Gets the configured settings for the plugin. If settings are not found, 
     * default settings are returned.
     */
    public static function getSettings(): array
    {
        $settings = get_option(SETTINGS_NAME);
        $oldSettings = get_option(OLD_SETTINGS_NAME);

        if ($settings) {
            return $settings;
        } else if ($oldSettings) {
            SettingsManager::migrateSettings($oldSettings);
            return get_option(SETTINGS_NAME);
        } else {
            return SettingsManager::getDefaultSettings();
        }
    }

    /**
     * Saves the configured settings into WordPress.
     * @param array<string> $settings The settings to save.
     */
    public static function saveSettings(array $settings): void
    {
        update_option(SETTINGS_NAME, $settings);
    }

    /**
     * Creates a brand new settings associative array with all default settings, and 
     * copies over any configurations from $oldSettings into the new settings object. 
     * Used when any changes are made to the settings schema, and the user's settings must 
     * be updated to match the new schema.
     */
    public static function repairSettings(array $oldSettings): array
    {   
        $newSettings = SettingsManager::getDefaultSettings();
        
        // Setting user's script settings
        $newSettings["script"]["instanceId"] = $oldSettings["script"]["instanceId"] ??  $newSettings["script"]["instanceId"];
        $newSettings["script"]["sourceMethod"] = $oldSettings["script"]["sourceMethod"] ?? $newSettings["script"]["sourceMethod"];
        $newSettings["script"]["sourceValue"] = $oldSettings["script"]["sourceValue"] ??  $newSettings["script"]["sourceValue"];
        $newSettings["script"]["campaignMethod"] = $oldSettings["script"]["campaignMethod"] ?? $newSettings["script"]["campaignMethod"];
        $newSettings["script"]["campaignValue"] = $oldSettings["script"]["campaignValue"] ??  $newSettings["script"]["campaignValue"];
        $newSettings["script"]["callbackFunction"] = $oldSettings["script"]["callbackFunction"] ?? $newSettings["script"]["callbackFunction"];
        $newSettings["script"]["additionalData"] = $oldSettings["script"]["additionalData"] ?? $newSettings["script"]["additionalData"];

        // Setting user's fallback settings
        $newSettings["fallbacks"]["sources"] = $oldSettings["fallbacks"]["sources"] ?? $newSettings["fallback"]["sources"];
        $newSettings["fallbacks"]["campaigns"] = $oldSettings["fallbacks"]["campaigns"] ?? $newSettings["fallback"]["campaigns"];

        // Setting user's real-time actions
        $newSettings["realTimeActions"]["redirectAction"] = $oldSettings["realTimeActions"]["redirectAction"] ?? $newSettings["realTimeActions"]["redirectAction"];
        for ($i = 0; $i < count($newSettings["realTimeActions"]["actions"]); $i++) {
            $newSettings["realTimeActions"]["actions"][$i]["resultCondition"] = $oldSettings["realTimeActions"]["actions"][$i]["resultCondition"] ?? $newSettings["realTimeActions"]["actions"][$i]["resultCondition"];
        }
        $newSettings["realTimeActions"]["retryDurationSeconds"] = $oldSettings["realTimeActions"]["retryDurationSeconds"] ?? $newSettings["realTimeActions"]["retryDurationSeconds"];
        $newSettings["realTimeActions"]["stopAtFirstElement"] = (bool)$oldSettings["realTimeActions"]["stopAtFirstElement"] ?? $newSettings["realTimeActions"]["stopAtFirstElement"];

        SettingsManager::saveSettings($newSettings);
        return $newSettings;
    }

    /**
     * Takes all of the settings from the WordPress option "anura_settings_option_name" 
     * and saves them into the new WordPress option "anura_settings"
     * @param array<string> $oldSettings The settings to migrate.
     */
    private static function migrateSettings(array $oldSettings): void
    {
        $newSettings = SettingsManager::getDefaultSettings();

        $newSettings["script"]["instanceId"] = $oldSettings["instance_id_0"] ?? "";
        $newSettings["script"]["sourceMethod"] = SettingsManager::getTrafficDetailMethod($oldSettings["source_variable_source_1"]);
        $newSettings["script"]["sourceValue"] = $oldSettings["source_2"] ?? "";
        $newSettings["script"]["campaignMethod"] = SettingsManager::getTrafficDetailMethod($oldSettings["campaign_variable_source_3"]);
        $newSettings["script"]["campaignValue"] = $oldSettings["campaign_4"] ?? "";
        $newSettings["script"]["callbackFunction"] = $oldSettings["callback_id_0"] ?? "";

        // Determining redirect condition.
        switch (strtolower($oldSettings["redirect_on_bad_0"])) {
            case "option-five":
                $newSettings["realTimeActions"]["redirectAction"]["resultCondition"] = "noRedirect";
                break;
            case "option-six":
                $newSettings["realTimeActions"]["redirectAction"]["resultCondition"] = "onBad";
                break;
            case "option-seven":
                $newSettings["realTimeActions"]["redirectAction"]["resultCondition"] = "onBoth";
                break;
            default:
                $newSettings["realTimeActions"]["redirectAction"]["resultCondition"] = "noRedirect";
                break;
        }

        $newSettings["realTimeActions"]["redirectAction"]["webCrawlersAllowed"] = isset($oldSettings["allow_webcrawlers_0"]);
        $newSettings["realTimeActions"]["redirectAction"]["redirectURL"] = $oldSettings["redirect_url_id"] ?? "";

        SettingsManager::saveSettings($newSettings);
    }

    private static function getTrafficDetailMethod(string $option): string
    {
        switch (strtolower($option)) {
            case "option-none": return "none";
            case "option-one": return "get";
            case "option-two": return "post";
            case "option-four": return "hardCoded";
            default: return "none";
        }
    }

    /**
     * Gets the default settings for the plugin. 
     */
    public static function getDefaultSettings(): array
    {
        return [
            "script" => [
                "instanceId" => "",
                "sourceMethod" => "none",
                "sourceValue" => "",
                "campaignMethod" => "none",
                "campaignValue" => "",
                "callbackFunction" => "",
                "additionalData" => [""],
            ],
            "fallbacks" => [
                "sources" => ["", ""],
                "campaigns" => ["", ""]
            ],
            "realTimeActions" => [
                "redirectAction" => [
                    "resultCondition" => "noRedirect",
                    "redirectURL" => "",
                    "webCrawlersAllowed" => false
                ],
                "actions" => [
                    ["name" => "disableForms", "resultCondition" => "noDisable"],
                    ["name" => "disableCommentSubmits", "resultCondition" => "noDisable"],
                    ["name" => "disableAllSubmits", "resultCondition" => "noDisable"],
                    ["name" => "disableLinks", "resultCondition" => "noDisable"],
                    ["name" => "disableAllInputs", "resultCondition" => "noDisable"]
                ],
                "retryDurationSeconds" => 4,
                "stopAtFirstElement" => false
            ],
            "serverActions" => [
                "addHeaders" => false,
                "headerPriority" => "medium"
            ]
        ];
    }

    /**
     * Gets the JSON schema for Anura Settings. 
     * Used for validating API input.
     */
    public static function getSettingsSchema(): string
    {
        $jsonSchema = <<<'JSON'
        {
            "definitions": {
                "actions": {
                    "type": "array",
                    "items": [
                        {
                            "type": "object",
                            "properties": {
                                "name": {
                                    "type": "string",
                                    "$comment": "Using an enum here to force 'disableForms' as the only option for this property.",
                                    "enum": ["disableForms"]
                                },
                                "resultCondition": {
                                    "type": "string",
                                    "enum": ["noDisable", "onWarning", "onBad", "onBoth"]
                                }
                            },
                            "required": ["name", "resultCondition"]
                        },
                        {
                            "type": "object",
                            "properties": {
                                "name": {
                                    "type": "string",
                                    "$comment": "Using an enum here to force 'disableCommentSubmits' as the only option for this property.",
                                    "enum": ["disableCommentSubmits"]
                                },
                                "resultCondition": {
                                    "type": "string",
                                    "enum": ["noDisable", "onWarning", "onBad", "onBoth"]
                                }
                            },
                            "required": ["name", "resultCondition"]
                        },
                        {
                            "type": "object",
                            "properties": {
                                "name": {
                                    "type": "string",
                                    "$comment": "Using an enum here to force 'disableAllSubmits' as the only option for this property.",
                                    "enum": ["disableAllSubmits"]
                                },
                                "resultCondition": {
                                    "type": "string",
                                    "enum": ["noDisable", "onWarning", "onBad", "onBoth"]
                                }
                            },
                            "required": ["name", "resultCondition"]
                        },
                        {
                            "type": "object",
                            "properties": {
                                "name": {
                                    "type": "string",
                                    "$comment": "Using an enum here to force 'disableLinks' as the only option for this property.",
                                    "enum": ["disableLinks"]
                                },
                                "resultCondition": {
                                    "type": "string",
                                    "enum": ["noDisable", "onWarning", "onBad", "onBoth"]
                                }
                            },
                            "required": ["name", "resultCondition"]
                        },
                        {
                            "type": "object",
                            "properties": {
                                "name": {
                                    "type": "string",
                                    "$comment": "Using an enum here to force 'disableAllInputs' as the only option for this property.",
                                    "enum": ["disableAllInputs"]
                                },
                                "resultCondition": {
                                    "type": "string",
                                    "enum": ["noDisable", "onWarning", "onBad", "onBoth"]
                                }
                            },
                            "required": ["name", "resultCondition"]
                        }
                    ]
                },
                "required": ["actions"]
            },
            "type": "object",
            "properties": {
                "script": {
                "type": "object",
                "properties": {
                    "instanceId": {
                        "type": "integer",
                        "minimum": 1
                    },
                    "sourceMethod": {
                        "type": "string",
                        "enum": ["none", "hardCoded", "get", "post"]
                    },
                    "sourceValue": {
                        "type": "string"
                    },
                    "campaignMethod": {
                        "type": "string",
                        "enum": ["none", "hardCoded", "get", "post"]
                    },
                    "campaignValue": {
                        "type": "string"
                    },
                    "callbackFunction": {
                        "type": "string"
                    },
                    "additionalData": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        },
                        "minItems": 1,
                        "maxItems": 10
                    }
                },
                "required": [ "instanceId", "sourceMethod", "campaignMethod", "callbackFunction", "additionalData" ]
                },
                "fallbacks": {
                    "type": "object",
                    "properties": {
                        "sources": {
                            "type": "array",
                            "items": {
                                "type": "string"
                            },
                            "minItems": 2,
                            "maxItems": 2
                            
                        },
                        "campaigns": {
                            "type": "array",
                            "items": {
                                "type": "string"
                            },
                            "minItems": 2,
                            
                            "maxItems": 2
                        }
                    },
                    "required": [ "sources", "campaigns" ]
                },
                "realTimeActions": {
                    "type": "object",
                    "properties": {
                        "redirectAction": {
                            "type": "object",
                            "properties": {
                                "resultCondition": {
                                    "type": "string",
                                    "enum": ["noRedirect", "onWarning", "onBad", "onBoth"]
                                },
                                "redirectURL": {
                                    "type": "string"
                                },
                                "webCrawlersAllowed": {
                                    "type": "boolean"
                                }
                            },
                            "required": ["resultCondition", "redirectURL", "webCrawlersAllowed"]
                        },
                        "actions": { "$ref": "#/definitions/actions"},
                        "retryDurationSeconds": {
                            "type": "number",
                            "enum": [4, 30, 120]
                        },
                        "stopAfterFirstElement": {
                            "type": "boolean"
                        }
                    },
                    "required": ["redirectAction", "actions", "retryDurationSeconds", "stopAfterFirstElement"]
                },
                "serverActions": {
                    "type": "object",
                    "properties": {
                        "addHeaders": {
                            "type": "boolean"
                        },
                        "headerPriority": {
                            "type": "string",
                            "enum": ["lowest", "low", "medium", "high", "highest"]
                        }
                    },
                    "required": ["addHeaders"]
                }
            },
            "required": [ "script", "fallbacks", "realTimeActions", "serverActions" ]
        }
        JSON;

        return $jsonSchema;
    }
}