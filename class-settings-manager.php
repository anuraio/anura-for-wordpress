<?php
/**
 * Settings Manager for Anura plugin.
 *
 * Handles storage, migration, and validation of plugin settings including
 * script configuration, real-time actions, bot whitelisting, and advanced features.
 *
 * @package Anura
 */

declare(strict_types=1);

namespace Anura\Settings_Manager;

/**
 * Manages plugin settings with schema validation and migration support.
 */
class Settings_Manager {

	private const SETTINGS_NAME     = 'anura_settings';
	private const OLD_SETTINGS_NAME = 'anura_settings_option_name';

	/**
	 * Constructor for Settings_Manager.
	 */
	public function __construct() {}

	/**
	 * Gets the configured settings for the plugin.
	 *
	 * @return array The plugin settings array.
	 */
	public function get_settings(): array {
		$settings     = get_option( self::SETTINGS_NAME );
		$old_settings = get_option( self::OLD_SETTINGS_NAME );

		if ( $settings ) {
			return $settings;
		} elseif ( $old_settings ) {
			$this->migrate_settings( $old_settings );
			return get_option( self::SETTINGS_NAME );
		} else {
			return $this->get_default_settings();
		}
	}

	/**
	 * Saves the configured settings into WordPress options table.
	 *
	 * @param array $settings The settings to save.
	 */
	public function save_settings( array $settings ): void {
		update_option( self::SETTINGS_NAME, $settings );
	}

	/**
	 * Repairs settings when the schema changes during plugin upgrades.
	 *
	 * Creates new settings with current schema, preserving user's existing configuration.
	 * Handles migration of renamed fields and new nested structures.
	 *
	 * @param array $old_settings The existing settings to migrate.
	 * @return array The repaired settings matching current schema.
	 */
	public function repair_settings( array $old_settings ): array {
		$new_settings = $this->get_default_settings();

		// Setting script settings.
		$new_settings['script']['instanceId']       = $old_settings['script']['instanceId'] ?? $new_settings['script']['instanceId'];
		$new_settings['script']['sourceMethod']     = $old_settings['script']['sourceMethod'] ?? $new_settings['script']['sourceMethod'];
		$new_settings['script']['sourceValue']      = $old_settings['script']['sourceValue'] ?? $new_settings['script']['sourceValue'];
		$new_settings['script']['campaignMethod']   = $old_settings['script']['campaignMethod'] ?? $new_settings['script']['campaignMethod'];
		$new_settings['script']['campaignValue']    = $old_settings['script']['campaignValue'] ?? $new_settings['script']['campaignValue'];
		$new_settings['script']['callbackFunction'] = $old_settings['script']['callbackFunction'] ?? $new_settings['script']['callbackFunction'];

		// Migrate additional data from old string[] format to new object format.
		if ( is_array( $old_settings['script']['additionalData'] ) && $this->has_legacy_additional_data( $old_settings['script']['additionalData'] ) ) {
			$migrated_additional_data = array();
			foreach ( $old_settings['script']['additionalData'] as $index => $value ) {
				$migrated_additional_data[ $index ] = array(
					'method' => $value ? 'hardCoded' : 'get',
					'value'  => $value ?? '',
				);
			}

			$new_settings['script']['additionalData'] = $migrated_additional_data;
		} else {
			$new_settings['script']['additionalData'] = $old_settings['script']['additionalData'] ?? $new_settings['script']['additionalData'];
		}

		$new_settings['realTimeActions']['redirectAction'] = $old_settings['realTimeActions']['redirectAction'] ?? $new_settings['realTimeActions']['redirectAction'];

		$old_actions_by_name = array_column( $old_settings['realTimeActions']['actions'], null, 'name' );
		$new_action_names    = array_column( $new_settings['realTimeActions']['actions'], 'name' );

		// Migrate each action from old settings if it exists.
		foreach ( $new_action_names as $index => $action_name ) {
			if ( isset( $old_actions_by_name[ $action_name ] ) ) {
				$new_settings['realTimeActions']['actions'][ $index ] = $old_actions_by_name[ $action_name ];
			}
		}

		$new_settings['realTimeActions']['retryDurationSeconds']  = $old_settings['realTimeActions']['retryDurationSeconds'] ?? $new_settings['realTimeActions']['retryDurationSeconds'];
		$new_settings['realTimeActions']['stopAfterFirstElement'] = (bool) ( $old_settings['realTimeActions']['stopAfterFirstElement'] ?? $new_settings['realTimeActions']['stopAfterFirstElement'] );

		$new_settings['advanced']['fallbacks']     = $old_settings['fallbacks'] ?? $new_settings['advanced']['fallbacks'];
		$new_settings['advanced']['serverActions'] = $old_settings['serverActions'] ?? $new_settings['advanced']['serverActions'];

		$this->save_settings( $new_settings );
		return $new_settings;
	}

	/**
	 * Migrates legacy settings format to current structure.
	 *
	 * Converts old flat field names (instance_id_0, source_2) to new nested structure.
	 * One-time migration from anura_settings_option_name to anura_settings.
	 *
	 * @param array $old_settings Legacy settings to migrate.
	 */
	private function migrate_settings( array $old_settings ): void {
		$new_settings = $this->get_default_settings();

		$new_settings['script']['instanceId']       = $old_settings['instance_id_0'] ?? '';
		$new_settings['script']['sourceMethod']     = $this->get_traffic_detail_method( $old_settings['source_variable_source_1'] ?? '' );
		$new_settings['script']['sourceValue']      = $old_settings['source_2'] ?? '';
		$new_settings['script']['campaignMethod']   = $this->get_traffic_detail_method( $old_settings['campaign_variable_source_3'] ?? '' );
		$new_settings['script']['campaignValue']    = $old_settings['campaign_4'] ?? '';
		$new_settings['script']['callbackFunction'] = $old_settings['callback_id_0'] ?? '';

		// Determining redirect condition.
		switch ( strtolower( $old_settings['redirect_on_bad_0'] ?? '' ) ) {
			case 'option-five':
				$new_settings['realTimeActions']['redirectAction']['resultCondition'] = 'noRedirect';
				break;
			case 'option-six':
				$new_settings['realTimeActions']['redirectAction']['resultCondition'] = 'onBad';
				break;
			case 'option-seven':
				$new_settings['realTimeActions']['redirectAction']['resultCondition'] = 'onBoth';
				break;
			default:
				$new_settings['realTimeActions']['redirectAction']['resultCondition'] = 'noRedirect';
				break;
		}

		$new_settings['realTimeActions']['redirectAction']['webCrawlersAllowed'] = isset( $old_settings['allow_webcrawlers_0'] );
		$new_settings['realTimeActions']['redirectAction']['redirectURL']        = $old_settings['redirect_url_id'] ?? '';

		$this->save_settings( $new_settings );
		$this->repair_settings( $new_settings );
	}

	/**
	 * Converts legacy option strings to method names.
	 *
	 * @param string $option Legacy option value (e.g., 'option-one').
	 * @return string Method name ('none', 'get', 'post', 'hardCoded').
	 */
	private function get_traffic_detail_method( string $option ): string {
		switch ( strtolower( $option ) ) {
			case 'option-none':
				return 'none';
			case 'option-one':
				return 'get';
			case 'option-two':
				return 'post';
			case 'option-four':
				return 'hardCoded';
			default:
				return 'none';
		}
	}

	/**
	 * Checks if additional data uses legacy format (array of strings vs objects).
	 *
	 * @param array $additional_data The additional data array to check.
	 * @return bool True if using legacy string format, false otherwise.
	 */
	private function has_legacy_additional_data( array $additional_data ): bool {
		return ( is_string( $additional_data[0] ) );
	}

	/**
	 * Returns default bot patterns.
	 *
	 * @return array Array of default bot patterns matching frontend specification.
	 */
	private function get_default_bot_patterns(): array {
		return array(
			// Meta/Facebook Advertising Bots.
			array(
				'id'       => 'facebook_external',
				'name'     => 'Meta Business Suite (External)',
				'platform' => 'meta',
				'type'     => 'userAgent',
				'pattern'  => 'facebookexternalhit',
				'enabled'  => false,
				'isCustom' => false,
			),
			array(
				'id'       => 'facebook_catalog',
				'name'     => 'Meta Business Suite (Catalog)',
				'platform' => 'meta',
				'type'     => 'userAgent',
				'pattern'  => 'facebookcatalog',
				'enabled'  => false,
				'isCustom' => false,
			),
			// Google Advertising & Analytics Bots.
			array(
				'id'       => 'adsbot_google',
				'name'     => 'Google Ads (AdsBot-Google)',
				'platform' => 'google',
				'type'     => 'userAgent',
				'pattern'  => 'AdsBot-Google',
				'enabled'  => false,
				'isCustom' => false,
			),
			array(
				'id'       => 'adsbot',
				'name'     => 'Google Ads (AdsBot)',
				'platform' => 'google',
				'type'     => 'userAgent',
				'pattern'  => 'AdsBot',
				'enabled'  => false,
				'isCustom' => false,
			),
			array(
				'id'       => 'google_ads_dmbrowser',
				'name'     => 'Google Ads (DMBrowser)',
				'platform' => 'google',
				'type'     => 'userAgent',
				'pattern'  => 'DMBrowser',
				'enabled'  => false,
				'isCustom' => false,
			),
			array(
				'id'       => 'googlebot',
				'name'     => 'Google (Googlebot)',
				'platform' => 'google',
				'type'     => 'userAgent',
				'pattern'  => 'Googlebot',
				'enabled'  => false,
				'isCustom' => false,
			),
			array(
				'id'       => 'google_other',
				'name'     => 'Google (GoogleOther)',
				'platform' => 'google',
				'type'     => 'userAgent',
				'pattern'  => 'GoogleOther',
				'enabled'  => false,
				'isCustom' => false,
			),
			array(
				'id'       => 'google_adsense',
				'name'     => 'Google AdSense',
				'platform' => 'google',
				'type'     => 'userAgent',
				'pattern'  => 'GoogleAdSenseInfeed',
				'enabled'  => false,
				'isCustom' => false,
			),
			array(
				'id'       => 'google_media_partners',
				'name'     => 'Google Media Partners',
				'platform' => 'google',
				'type'     => 'userAgent',
				'pattern'  => 'Mediapartners-Google',
				'enabled'  => false,
				'isCustom' => false,
			),
			// LinkedIn Advertising Bots.
			array(
				'id'       => 'linkedin_ads',
				'name'     => 'LinkedIn Ads',
				'platform' => 'linkedin',
				'type'     => 'userAgent',
				'pattern'  => 'LinkedInBot',
				'enabled'  => false,
				'isCustom' => false,
			),
			// Microsoft Advertising Bots.
			array(
				'id'       => 'microsoft_ads',
				'name'     => 'Microsoft Ads',
				'platform' => 'microsoft',
				'type'     => 'userAgent',
				'pattern'  => 'Microsoft-BotFramework',
				'enabled'  => false,
				'isCustom' => false,
			),
			// Snapchat Advertising Bots.
			array(
				'id'       => 'snapchat_ads',
				'name'     => 'Snapchat Ads',
				'platform' => 'snapchat',
				'type'     => 'userAgent',
				'pattern'  => 'SnapchatAds',
				'enabled'  => false,
				'isCustom' => false,
			),
			// SEO & Marketing Tools.
			array(
				'id'       => 'semrush',
				'name'     => 'Semrush',
				'platform' => 'other',
				'type'     => 'userAgent',
				'pattern'  => 'Semrush',
				'enabled'  => false,
				'isCustom' => false,
			),
			// MOAT (Ad Verification).
			array(
				'id'       => 'moat_bot',
				'name'     => 'MOAT (Bot)',
				'platform' => 'other',
				'type'     => 'userAgent',
				'pattern'  => 'moatbot',
				'enabled'  => false,
				'isCustom' => false,
			),
			array(
				'id'       => 'moat_ping',
				'name'     => 'MOAT (Ping)',
				'platform' => 'other',
				'type'     => 'userAgent',
				'pattern'  => 'pingbot',
				'enabled'  => false,
				'isCustom' => false,
			),
		);
	}

	/**
	 * Returns default settings for fresh installation.
	 *
	 * @return array Complete default settings with all features disabled.
	 */
	public function get_default_settings(): array {
		return array(
			'script'          => array(
				'instanceId'       => '',
				'sourceMethod'     => 'none',
				'sourceValue'      => '',
				'campaignMethod'   => 'none',
				'campaignValue'    => '',
				'callbackFunction' => '',
				'additionalData'   => array_fill(
					0,
					10,
					array(
						'method' => 'get',
						'value'  => '',
					)
				),
			),
			'realTimeActions' => array(
				'redirectAction'        => array(
					'resultCondition'    => 'noRedirect',
					'redirectURL'        => '',
					'webCrawlersAllowed' => false,
				),
				'actions'               => array(
					array(
						'name'            => 'disableForms',
						'resultCondition' => 'noDisable',
					),
					array(
						'name'            => 'disableCommentSubmits',
						'resultCondition' => 'noDisable',
					),
					array(
						'name'            => 'disableAllSubmits',
						'resultCondition' => 'noDisable',
					),
					array(
						'name'            => 'disableLinks',
						'resultCondition' => 'noDisable',
					),
					array(
						'name'            => 'disableAllInputs',
						'resultCondition' => 'noDisable',
					),
					array(
						'name'            => 'protectLogin',
						'resultCondition' => 'noDisable',
					),
				),
				'retryDurationSeconds'  => 4,
				'stopAfterFirstElement' => false,
			),
			'bots'            => array(
				'enabled'   => false,
				'whitelist' => $this->get_default_bot_patterns(),
			),
			'social'          => array(
				'exclusionAudiences'    => array(),
				'retargetingProtection' => array(),
			),
			'advanced'        => array(
				'fallbacks'         => array(
					'sources'   => array( '', '' ),
					'campaigns' => array( '', '' ),
				),
				'serverActions'     => array(
					'addHeaders'     => false,
					'headerPriority' => 'medium',
				),
				'contentDeployment' => array(
					'enabled'    => false,
					'javascript' => '',
				),
				'requestTriggers'   => array(
					'enabled'  => false,
					'triggers' => array(),
				),
			),
			'logs'            => array(
				'blockedLoginRetentionDays' => 90,
			),
		);
	}

	/**
	 * Returns JSON Schema for validating settings.
	 *
	 * @return string JSON Schema defining structure and constraints.
	 */
	public function get_settings_schema(): string {
		$json_schema = <<<'JSON'
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
                        },
                        {
                            "type": "object",
                            "properties": {
                                "name": {
                                    "type": "string",
                                    "$comment": "Using an enum here to force 'protectLogin' as the only option for this property.",
                                    "enum": ["protectLogin"]
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
                            "type": "object",
                            "properties": {
                                "method": {
                                    "type": "string",
                                    "enum": ["hardCoded", "get", "post"]
                                },
                                "value": {
                                    "type": "string",
                                    "maxLength": 128
                                }
                            },
                            "required": ["method", "value"]
                        },
                        "minItems": 1,
                        "maxItems": 10
                    }
                },
                "required": [ "instanceId", "sourceMethod", "campaignMethod", "callbackFunction", "additionalData" ]
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
                "bots": {
                    "type": "object",
                    "properties": {
                        "enabled": {
                            "type": "boolean"
                        },
                        "whitelist": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "id": {"type": "string"},
                                    "name": {"type": "string"},
                                    "platform": {"type": "string"},
                                    "type": {
                                        "type": "string",
                                        "enum": ["userAgent", "location", "referrer"]
                                    },
                                    "pattern": {"type": "string"},
                                    "enabled": {"type": "boolean"},
                                    "isCustom": {"type": "boolean"}
                                },
                                "required": ["id", "name", "type", "pattern", "enabled", "isCustom"]
                            }
                        }
                    },
                    "required": ["enabled", "whitelist"]
                },
                "social": {
                    "type": "object",
                    "properties": {
                        "exclusionAudiences": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "id": {"type": "string"},
                                    "platform": {"type": "string"},
                                    "label": {"type": "string"},
                                    "fields": {"type": "object"},
                                    "enabled": {"type": "boolean"}
                                },
                                "required": ["id", "platform", "fields", "enabled"]
                            }
                        },
                        "retargetingProtection": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "id": {"type": "string"},
                                    "platform": {"type": "string"},
                                    "tagId": {"type": "string"},
                                    "label": {"type": "string"},
                                    "enabled": {"type": "boolean"}
                                },
                                "required": ["id", "platform", "tagId", "enabled"]
                            }
                        }
                    },
                    "required": ["exclusionAudiences", "retargetingProtection"]
                },
                "advanced": {
                    "type": "object",
                    "properties": {
                        "fallbacks": {
                            "type": "object",
                            "properties": {
                                "sources": {
                                    "type": "array",
                                    "items": {"type": "string"},
                                    "minItems": 2,
                                    "maxItems": 2
                                },
                                "campaigns": {
                                    "type": "array",
                                    "items": {"type": "string"},
                                    "minItems": 2,
                                    "maxItems": 2
                                }
                            },
                            "required": ["sources", "campaigns"]
                        },
                        "serverActions": {
                            "type": "object",
                            "properties": {
                                "addHeaders": {"type": "boolean"},
                                "headerPriority": {
                                    "type": "string",
                                    "enum": ["lowest", "low", "medium", "high", "highest"]
                                }
                            },
                            "required": ["addHeaders", "headerPriority"]
                        },
                        "contentDeployment": {
                            "type": "object",
                            "properties": {
                                "enabled": {"type": "boolean"},
                                "javascript": {
                                    "type": "string",
                                    "maxLength": 10000
                                }
                            },
                            "required": ["enabled", "javascript"]
                        },
                        "requestTriggers": {
                            "type": "object",
                            "properties": {
                                "enabled": {"type": "boolean"},
                                "triggers": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "id": {"type": "string"},
                                            "type": {
                                                "type": "string",
                                                "enum": ["url", "queryParam", "path"]
                                            },
                                            "condition": {
                                                "type": "string",
                                                "enum": ["contains", "doesNotContain"]
                                            },
                                            "pattern": {"type": "string"},
                                            "enabled": {"type": "boolean"}
                                        },
                                        "required": ["id", "type", "condition", "pattern", "enabled"]
                                    }
                                }
                            }
                        }
                    },
                    "required": ["fallbacks", "serverActions", "contentDeployment"]
                },
                "logs": {
                    "type": "object",
                    "properties": {
                        "blockedLoginRetentionDays": {
                            "type": "integer",
                            "minimum": 1,
                            "maximum": 365
                        }
                    },
                    "required": ["blockedLoginRetentionDays"]
                }
            },
            "required": [ "script", "realTimeActions", "bots", "social", "advanced", "logs" ]
        }
JSON;

		return $json_schema;
	}
}
