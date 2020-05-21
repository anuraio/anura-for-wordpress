<?php
   /*
   Plugin Name: Anura.io
   Plugin URI: https://www.anura.io/anura-script
   description: Anura is an Ad Fraud solution designed to accurately eliminate fraud to improve conversion rates. With the Anura for WordPress plugin, you can easily set up a real-time visitor firewall to keep the fraud off of your site.  Before you can set this up, be sure to reach out to <a href="mailto:sales@anura.io">sales@anura.io</a> to get your account set up first.
   Version: 1.0
   Author: Anura Solutions, LLC
   Author URI: https://www.anura.io/
   */
function anura_settings_link( $links ) {
   $settings_link = '<a href="admin.php?page=anura-settings">' . __( 'Settings' ) . '</a>';
   
   
   array_push( $links, $settings_link );
   return $links;
}
$plugin = plugin_basename( __FILE__ );
add_filter( "plugin_action_links_$plugin", 'anura_settings_link' );
class AnuraSettings {
   private $anura_settings_options;
   public function __construct() {
      add_action( 'admin_menu', array( $this, 'anura_settings_add_plugin_page' ) );
      add_action( 'admin_init', array( $this, 'anura_settings_page_init' ) );
   }

   public function anura_settings_add_plugin_page() {
      add_menu_page(
         'Anura Settings', // page_title
         'Anura Settings', // menu_title
         'manage_options', // capability
         'anura-settings', // menu_slug
         array( $this, 'anura_settings_create_admin_page' ), // function
         plugin_dir_url( __FILE__ ) . "/assets/icon_25-o.png",
         66 // position
      );
   }

   public function anura_settings_create_admin_page() {
      $this->anura_settings_options = get_option( 'anura_settings_option_name' ); ?>

      <div class="wrap">
         <img src="<?php echo plugin_dir_url( __FILE__ ) . 'assets/anura_logo_gray_rgb_med.png';?>" alt="Anura Logo">
         <h2>Anura for WordPress</h2>
         <p style="max-width: 800px">Anura is an Ad Fraud solution designed to accurately eliminate fraud to improve conversion rates. With the Anura for WordPress plugin, you can easily set up a real-time visitor firewall to keep the fraud off of your site.  Before you can set this up, be sure to reach out to <a href="mailto:sales@anura.io">sales@anura.io</a> to get your account set up first.</p>
         <?php settings_errors(); ?>

         <form method="post" action="options.php">
            <?php
               settings_fields( 'anura_settings_option_group' );
               do_settings_sections( 'anura-settings-admin' );
               submit_button();
            ?>
         </form>
      </div>
   <?php }

   public function anura_settings_page_init() {
      register_setting(
         'anura_settings_option_group', // option_group
         'anura_settings_option_name', // option_name
         array( $this, 'anura_settings_sanitize' ) // sanitize_callback
      );

      add_settings_section(
         'anura_settings_setting_section', // id
         'Settings', // title
         array( $this, 'anura_settings_section_info' ), // callback
         'anura-settings-admin' // page
      );

      add_settings_field(
         'instance_id_0', // id
         'Instance ID<span class="required">*</span>', // title
         array( $this, 'instance_id_0_callback' ), // callback
         'anura-settings-admin', // page
         'anura_settings_setting_section' // section
      );

      add_settings_field(
         'source_variable_source_1', // id
         'Source Method', // title
         array( $this, 'source_variable_source_1_callback' ), // callback
         'anura-settings-admin', // page
         'anura_settings_setting_section' // section
      );

      add_settings_field(
         'source_2', // id
         '<label id="sv_label" onload="sv_loaded();"><img src onerror="sv_loaded();">Source Parameter</label>', // title
         array( $this, 'source_2_callback' ), // callback
         'anura-settings-admin', // page
         'anura_settings_setting_section' // section
      );

      add_settings_field(
         'campaign_variable_source_3', // id
         'Campaign Method', // title
         array( $this, 'campaign_variable_source_3_callback' ), // callback
         'anura-settings-admin', // page
         'anura_settings_setting_section' // section
      );

      add_settings_field(
         'campaign_4', // id
         '<label id="cv_label" onload="cv_loaded();"><img src onerror="cv_loaded();">Campaign Parameter</label>', // title
         array( $this, 'campaign_4_callback' ), // callback
         'anura-settings-admin', // page
         'anura_settings_setting_section' // section
      );
      add_settings_field(
         'callback_id_0', // id
         'Optional Callback Function', // title
         array( $this, 'optional_callback' ), // callback
         'anura-settings-admin', // page
         'anura_settings_setting_section' // section
      );
      add_settings_field(
         'redirect_on_bad_0', // id
         'Redirect on Warning/Bad', // title
         array( $this, 'redirect_on_bad_0_callback' ), // callback
         'anura-settings-admin', // page
         'anura_settings_setting_section' // section
      );
      add_settings_field(
         'redirect_url_id', // id
         '<label id="uv_label" onload="uv_loaded();"><img src onerror="uv_loaded();">Redirect URL<span class="required">*</span></label>', // title
         array( $this, 'redirect_url_text_callback' ), // callback
         'anura-settings-admin', // page
         'anura_settings_setting_section' // section
      );
      add_settings_field(
         'allow_webcrawlers_0', // id
         '<label id="wc_label">Allow WebCrawlers</label>', // title
         array( $this, 'allow_webcrawlers_0_callback' ), // callback
         'anura-settings-admin', // page
         'anura_settings_setting_section' // section
      );

   }

   public function anura_settings_sanitize($input) {
      $sanitary_values = array();
      if ( isset( $input['instance_id_0'] ) ) {
         $sanitary_values['instance_id_0'] = sanitize_text_field( $input['instance_id_0'] );
      }

      if ( isset( $input['source_variable_source_1'] ) ) {
         $sanitary_values['source_variable_source_1'] = $input['source_variable_source_1'];
      }

      if ( isset( $input['source_2'] ) ) {
         $sanitary_values['source_2'] = sanitize_text_field( $input['source_2'] );
      }

      if ( isset( $input['campaign_variable_source_3'] ) ) {
         $sanitary_values['campaign_variable_source_3'] = $input['campaign_variable_source_3'];
      }
      if ( isset( $input['campaign_4'] ) ) {
         $sanitary_values['campaign_4'] = sanitize_text_field( $input['campaign_4'] );
      }
      if ( isset( $input['callback_id_0'] ) ) {
         $sanitary_values['callback_id_0'] = sanitize_text_field( $input['callback_id_0'] );
      }
      if ( isset( $input['redirect_on_bad_0'] ) ) {
         $sanitary_values['redirect_on_bad_0'] = $input['redirect_on_bad_0'];
      }

      if ( isset( $input['redirect_url_id'] ) ) {
         $sanitary_values['redirect_url_id'] = sanitize_text_field( $input['redirect_url_id'] );
      }

      if ( isset( $input['allow_webcrawlers_0'] ) ) {
         $sanitary_values['allow_webcrawlers_0'] = sanitize_text_field( $input['allow_webcrawlers_0'] );
      }
      return $sanitary_values;
   }

   public function anura_settings_section_info() {
      
   }

   public function instance_id_0_callback() {
      printf(
         '<input class="regular-text" type="text" name="anura_settings_option_name[instance_id_0]" id="instance_id_0" value="%s" required>',
         isset( $this->anura_settings_options['instance_id_0'] ) ? esc_attr( $this->anura_settings_options['instance_id_0']) : ''
      );
   }

   public function source_variable_source_1_callback() {
      ?> 
      <script type="text/javascript">;</script>
      <select name="anura_settings_option_name[source_variable_source_1]" id="source_variable_source_1" onchange="selectOneChanged(this);">
         <?php $selected = (isset( $this->anura_settings_options['source_variable_source_1'] ) && $this->anura_settings_options['source_variable_source_1'] === 'option-none') ? 'selected' : '' ; ?>
         <option value="option-none" <?php echo $selected; ?>>None</option>
         <?php $selected = (isset( $this->anura_settings_options['source_variable_source_1'] ) && $this->anura_settings_options['source_variable_source_1'] === 'option-one') ? 'selected' : '' ; ?>
         <option value="option-one" <?php echo $selected; ?>>GET Method</option>
         <?php $selected = (isset( $this->anura_settings_options['source_variable_source_1'] ) && $this->anura_settings_options['source_variable_source_1'] === 'option-two') ? 'selected' : '' ; ?>
         <option value="option-two" <?php echo $selected; ?>>POST Method</option>
         <?php $selected = (isset( $this->anura_settings_options['source_variable_source_1'] ) && $this->anura_settings_options['source_variable_source_1'] === 'option-four') ? 'selected' : '' ; ?>
         <option value="option-four" <?php echo $selected; ?>>Hard Coded Source Value</option>
      </select>
      <script type="text/javascript">
         function hideunhidesv(tohide) {
            if(tohide == 1) {
               document.getElementById('source_2').parentNode.style.display = 'none';
               document.getElementById('sv_label').parentNode.style.display = 'none';
               document.getElementById('sv_label').style.display = 'none';
               document.getElementById('source_2').style.display = 'none';
               document.getElementById('source_2_sub').style.display = 'none';
               document.getElementById('source_2').value = '';
            } else {
               document.getElementById('sv_label').parentNode.style = 'none';
               document.getElementById('source_2').parentNode.style = 'none';
               document.getElementById('sv_label').style = 'none';
               document.getElementById('source_2').style = 'none';
               document.getElementById('source_2_sub').style = 'none';

            }
         }
         function selectOneChanged(sourceselect) {
           
            var selected = sourceselect.selectedIndex;
            if(selected == 2 || selected == 1) {
               document.getElementById('sv_label').innerHTML = 'Source Parameter';
               hideunhidesv(2)
            } else if(selected == 3) {
               document.getElementById('sv_label').innerHTML = 'Source Value';
               hideunhidesv(2)
            } else if(selected == 0) {
               document.getElementById('source_2').value = '';
               hideunhidesv(1)
            }

         }
         var preselected = document.getElementById("source_variable_source_1").selectedIndex
         function sv_loaded() {
            if(preselected == 2 || preselected == 1) {
               document.getElementById('sv_label').innerHTML = 'Source Parameter';
               hideunhidesv(2)
            } else if(preselected == 3) {
               document.getElementById('sv_label').innerHTML = 'Source Value';
               hideunhidesv(2)
            } else if(preselected == 0) {
               document.getElementById('source_2').value = '';
               hideunhidesv(1)
            }
         }
      </script> 
      <?php
   }

   public function source_2_callback() {
      printf(
         '<input class="regular-text" type="text" name="anura_settings_option_name[source_2]" id="source_2" value="%s"><BR><SUB id=source_2_sub style="cursor: default">&emsp;examples: &nbsp;utm_source, utm_medium, utm_term, utm_content</SUB>',
         isset( $this->anura_settings_options['source_2'] ) ? esc_attr( $this->anura_settings_options['source_2']) : ''
      );
   }

   public function campaign_variable_source_3_callback() {
      ?> <select name="anura_settings_option_name[campaign_variable_source_3]" id="campaign_variable_source_3" onchange="selectCampChanged(this)">
         <?php $selected = (isset( $this->anura_settings_options['campaign_variable_source_3'] ) && $this->anura_settings_options['campaign_variable_source_3'] === 'option-none') ? 'selected' : '' ; ?>
         <option value="option-none" <?php echo $selected; ?>>None</option>
         <?php $selected = (isset( $this->anura_settings_options['campaign_variable_source_3'] ) && $this->anura_settings_options['campaign_variable_source_3'] === 'option-one') ? 'selected' : '' ; ?>
         <option value="option-one" <?php echo $selected; ?>>GET Method</option>
         <?php $selected = (isset( $this->anura_settings_options['campaign_variable_source_3'] ) && $this->anura_settings_options['campaign_variable_source_3'] === 'option-two') ? 'selected' : '' ; ?>
         <option value="option-two" <?php echo $selected; ?>>POST Method</option>
         <?php $selected = (isset( $this->anura_settings_options['campaign_variable_source_3'] ) && $this->anura_settings_options['campaign_variable_source_3'] === 'option-four') ? 'selected' : '' ; ?>
         <option value="option-four" <?php echo $selected; ?>>Hard Coded Campaign Value</option>
      </select>
      <script type="text/javascript">
         function hideunhidecv(tohide) {
            if(tohide == 1) {
               document.getElementById('campaign_4').parentNode.style.display = 'none';
               document.getElementById('cv_label').parentNode.style.display = 'none';
               document.getElementById('cv_label').style.display = 'none';
               document.getElementById('campaign_4').style.display = 'none';
               document.getElementById('camp_sub').style.display = 'none';
               document.getElementById('campaign_4').value = '';
            } else {
               document.getElementById('cv_label').parentNode.style = 'none';
               document.getElementById('campaign_4').parentNode.style = 'none';
               document.getElementById('cv_label').style = 'none';
               document.getElementById('campaign_4').style = 'none';
               document.getElementById('camp_sub').style = 'none';

            }
         }
         function selectCampChanged(campselect) {
           
            var selected_camp = campselect.selectedIndex;
            if(selected_camp == 1) {
               document.getElementById('cv_label').innerHTML = 'Campaign Parameter';
               // document.getElementsByName('anura_settings_option_name[campaign_variable_source_3]')[0].placeholder = 'testing';
               hideunhidecv(2)
            } else if(selected_camp == 2) {
               document.getElementById('cv_label').innerHTML = 'Campaign Parameter';
               hideunhidecv(2)
            } else if(selected_camp == 3) {
               document.getElementById('cv_label').innerHTML = 'Campaign Value';
               hideunhidecv(2)
            } else if(selected_camp == 0) {
               document.getElementById('campaign_4').value = '';
               hideunhidecv(1)
            }


         }
         var preselected_camp = document.getElementById("campaign_variable_source_3").selectedIndex
         function cv_loaded() {
            if(preselected_camp == 2 || preselected_camp == 1) {
               document.getElementById('cv_label').innerHTML = 'Campaign Parameter';
               hideunhidecv(2)
            } else if(preselected_camp == 3) {
               document.getElementById('cv_label').innerHTML = 'Campaign Value';
               hideunhidecv(2)
            } else if(preselected_camp == 0) {
               document.getElementById('campaign_4').value = '';
               hideunhidecv(1)
            }
         }
      </script> 
       <?php
   }

   public function campaign_4_callback() {
      printf(
         '<input class="regular-text" type="text" name="anura_settings_option_name[campaign_4]" id="campaign_4" value="%s" /><BR>
         <SUB id="camp_sub" style="cursor: pointer">&emsp;examples: &nbsp;utm_campaign, utm_medium, utm_term, utm_content</SUB>',
         isset( $this->anura_settings_options['campaign_4'] ) ? esc_attr( $this->anura_settings_options['campaign_4']) : ''
      );
   }

   // public function response_json_callback() {

   //    printf(
   //       '<input class="regular-text" type="text" name="anura_settings_option_name[response_id_0]" id="response_id_0" value="%s", placeholder="anura_response">',
   //       isset( $this->anura_settings_options['response_id_0'] ) ? esc_attr( $this->anura_settings_options['response_id_0']) : ''
   //    );
   // }
   public function optional_callback() {

      printf(
         '<input class="regular-text" type="text" name="anura_settings_option_name[callback_id_0]" id="callback_id_0" value="%s"/><br>
         <SUB id="anura_callback" style="cursor: text; padding-left:16px;">callback functions are allowed to start with: "$", "_", or "a-z" characters, followed by "a-z" and "0-9" characters.</SUB>',
         isset( $this->anura_settings_options['callback_id_0'] ) ? esc_attr( $this->anura_settings_options['callback_id_0']) : ''
      );
   }

   public function redirect_on_bad_0_callback() {
      ?> 

      <select name="anura_settings_option_name[redirect_on_bad_0]" id="redirect_on_bad_0"  onchange="selectUrlChanged(this)">
         <?php $selected = (isset( $this->anura_settings_options['redirect_on_bad_0'] ) && $this->anura_settings_options['redirect_on_bad_0'] === 'option-five') ? 'selected' : '' ; ?>
         <option value="option-five" <?php echo $selected; ?>> No Redirect</option>
         <?php $selected = (isset( $this->anura_settings_options['redirect_on_bad_0'] ) && $this->anura_settings_options['redirect_on_bad_0'] === 'option-six') ? 'selected' : '' ; ?>
         <option value="option-six" <?php echo $selected; ?>> Redirect on Bad</option>
         <?php $selected = (isset( $this->anura_settings_options['redirect_on_bad_0'] ) && $this->anura_settings_options['redirect_on_bad_0'] === 'option-seven') ? 'selected' : '' ; ?>
         <option value="option-seven" <?php echo $selected; ?>> Redirect on Warning and Bad</option>
      </select>
      <script>
         function hideunhideurl(tohide) {
            if(tohide == 1) {
               document.getElementById('uv_label').parentNode.style.display = 'none';
               document.getElementById('wc_label').parentNode.style.display = 'none';
               document.getElementById('redirect_url_id').parentNode.style.display = 'none';
               document.getElementById('allow_webcrawlers_0').parentNode.style.display = 'none';
               document.getElementById('redirect_url_id').value = '';
               document.getElementById('redirect_url_id').required = false;
               document.getElementById('allow_webcrawlers_0').checked = false;

            } else {
               document.getElementById('uv_label').parentNode.style = 'none';
               document.getElementById('wc_label').parentNode.style = 'none';
               document.getElementById('redirect_url_id').parentNode.style = 'none';
               document.getElementById('allow_webcrawlers_0').parentNode.style = 'none';
               document.getElementById('redirect_url_id').required = true;
            }
         }


         function selectUrlChanged(urlselect) {
           
            var selected_url = urlselect.selectedIndex;
            if(selected_url == 1 || selected_url == 2) {
               hideunhideurl(2)
            } else if(selected_url == 0) {
               hideunhideurl(1)
            }


         }
         var preselected_url = document.getElementById("redirect_on_bad_0").selectedIndex
         function uv_loaded() {
            if(preselected_url == 2 || preselected_url == 1) {
               hideunhideurl(2)
            } else if(preselected_url == 0) {
               hideunhideurl(1)

            }
         }
      </script>

      <?php
   }
   public function redirect_url_text_callback() {

      printf(
         '<input class="regular-text" type="text" name="anura_settings_option_name[redirect_url_id]" id="redirect_url_id" value="%s"><SUB style="cursor: text"><br>&emsp;example: &nbsp;https://yourwebsite.com/404</SUB>',
         isset( $this->anura_settings_options['redirect_url_id'] ) ? esc_attr( $this->anura_settings_options['redirect_url_id']) : ''
      );
   }

   public function allow_webcrawlers_0_callback() {
      printf(
         '<input type="checkbox" name="anura_settings_option_name[allow_webcrawlers_0]" id="allow_webcrawlers_0" value="allow_webcrawlers_0" %s> <label for="allow_webcrawlers_0">Allows Web crawlers to bypass redirect.</label> <br><br><label id="webcrawl_info_label" style="cursor: default">To use this feature "rule sets returnability" must be enabled. Talk to support about enabling or disabling the rule sets returnability feature.</label>',
         ( isset( $this->anura_settings_options['allow_webcrawlers_0'] ) && $this->anura_settings_options['allow_webcrawlers_0'] === 'allow_webcrawlers_0' ) ? 'checked' : ''
      );
   }

}
if ( is_admin() )
   $anura_settings = new AnuraSettings();


add_action('wp_footer', 'anura_script'); //Calls anura script at the footer of the page

function anura_script() {
   $anura_settings_options = get_option( 'anura_settings_option_name' ); // Array of All Options
   $instance_id_0 = $anura_settings_options['instance_id_0']; // Instance ID
   $source_variable_source_1 = $anura_settings_options['source_variable_source_1']; // Source 
   $source_2 = $anura_settings_options['source_2']; // Source
   $campaign_variable_source_3 = $anura_settings_options['campaign_variable_source_3'];
   $campaign_4 = $anura_settings_options['campaign_4']; // Campaign
   $callback_id_0 = $anura_settings_options['callback_id_0'];
   // $response_id_0 = $anura_settings_options['response_id_0'];
   $redirect_on_bad_0 = $anura_settings_options['redirect_on_bad_0'];
   if(!isset($anura_settings_options['redirect_url_id'])) {
      $redirect_url_id = '#';
   } else {
      $redirect_url_id = $anura_settings_options['redirect_url_id'];
   }
   if(!isset($anura_settings_options['allow_webcrawlers_0'])) {
      $allow_webcrawlers_0 = "unchecked";
   } else {
     $allow_webcrawlers_0 = 'checked';
   }

   if($source_variable_source_1 == "option-one") {
      if(isset($_GET[$source_2]) && $_GET[$source_2] != "") {
         $source_2 = sanitize_text_field($_GET[$source_2]);
      } else {
         $source_2 = '';
      }
   } else if($source_variable_source_1 == "option-two") {
      if(isset($_POST[$source_2]) && $_POST[$source_2] != "") {
         $source_2 = sanitize_text_field($_POST[$source_2]);
      } else {
         $source_2 = '';
      }
   }

   if($campaign_variable_source_3 == "option-one") {
      if(isset($_GET[$campaign_4]) && $_GET[$campaign_4] != "") {
         $campaign_4 = sanitize_text_field($_GET[$campaign_4]);
      } else {
         $campaign_4 = '';
      }
   }
   if($campaign_variable_source_3 == "option-two") {
      if(isset($_POST[$campaign_4]) && $_POST[$Campaign_4] != "") {
         $campaign_4 = sanitize_text_field($_POST[$campaign_4]);
      } else {
         $campaign_4 = '';
      }
   }
   $redirect = 0;
   $callback_enabled = 0;
   if($redirect_on_bad_0 == "option-five") {
   } else if ($redirect_on_bad_0 == "option-six") {
      $redirect = 1;
      $callback_enabled = 1;
   } else if ($redirect_on_bad_0 == "option-seven") {
      $redirect = 2;
      $callback_enabled = 1;
   }


   if($callback_enabled == 0) {
      if(isset($callback_id_0) && $callback_id_0 != "") {
         $callback_enabled = 1;
      }
   }
   function reserved_javascript_words() {
       // return an array of reserved javascript words
       return array(
           "abstract",
           "arguments",
           "as",
           "boolean",
           "break",
           "byte",
           "case",
           "catch",
           "char",
           "class",
           "continue",
           "const",
           "debugger",
           "default",
           "delete",
           "do",
           "double",
           "else",
           "enum",
           "eval",
           "export",
           "extends",
           "false",
           "final",
           "finally",
           "float",
           "for",
           "function",
           "goto",
           "if",
           "implements",
           "import",
           "in",
           "instanceof",
           "int",
           "interface",
           "is",
           "let",
           "long",
           "namespace",
           "native",
           "new",
           "null",
           "package",
           "private",
           "protected",
           "public",
           "return",
           "short",
           "static",
           "super",
           "switch",
           "synchronized",
           "this",
           "throw",
           "throws",
           "transient",
           "true",
           "try",
           "typeof",
           "use",
           "var",
           "void",
           "volatile",
           "while",
           "with",
           "yield"
       );
   }
   function is_allowed_javascript_variable($variable) {
       // is the javascript variable allowable and not a reserved javascript word?
       return preg_match('/^[_$a-zA-Z][_$a-zA-Z0-9]*$/', $variable) && !in_array(strtolower($variable), array_map("strtolower", reserved_javascript_words())) ? true: false;
   }

   if(!is_allowed_javascript_variable($callback_id_0)) {
      $callback_id_0 == "";
   }

   if(!empty($instance_id_0)) {
      $anura_j_script = "<script type='text/javascript''>";
      if($callback_enabled == 1) {
      $anura_j_script .= '



            // JSON
      if (!window.JSON) {
         window.JSON = {
            parse: function(sJSON) {
               return eval("(" + sJSON + ")");
            },
            stringify: (function() {
               var toString = Object.prototype.toString;
               var isArray = Array.isArray || function(a) {
                  return toString.call(a) === "[object Array]";
               };
               var escMap = {
                  "\b": "\\b",
                  "\f": "\\f",
                  "\n": "\\n",
                  "\r": "\\r",
                  "\t": "\\t"
               };
               var escFunc = function(m) {
                  return escMap[m];
               };
               var escRE = /[\\"\u0000-\u001F\u2028\u2029]/g;
               return function stringify(value) {
                  if (value === null) {
                     return "null";
                  } else if (typeof value === "number") {
                     return isFinite(value) ? value.toString() : "null";
                  } else if (typeof value === "boolean") {
                     return value.toString();
                  } else if (typeof value === "object") {
                     if (typeof value.toJSON === "function") {
                        return stringify(value.toJSON());
                     } else if (isArray(value)) {
                        var res = "[";
                        for (var i = 0; i < value.length; i++) res += (i ? ", " : "") + stringify(value[i]);
                        return res + "]";
                     } else if (toString.call(value) === "[object Object]") {
                        var tmp = [];
                        for (var k in value) {
                           if (value.hasOwnProperty(k)) tmp.push(stringify(k) + ": " + stringify(value[k]));
                        }
                        return "{" + tmp.join(", ") + "}";
                     }
                  }
                  return "\"" + value.toString().replace(escRE, escFunc) + "\"";
               };
            })()
         };
      }

      var anura_wp_called = false;
         function anura_wp_handleResponse(http) {
            var isCrawler = false;
            if(http.response !== "" && http.response !== null && anura_wp_called == false) {
               anura_wp_called = true;
               var responseobj = JSON.parse(http.response);
               if("object" === typeof(responseobj) && "object" == typeof(responseobj.rule_sets)) {
                  if(responseobj.rule_sets.indexOf("WC") != "-1") {
                     isCrawler = true;
                  }
               }
            ';
            $current_page = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
            $current_page = explode('?', $current_page)[0];
            // printf($current_page);

            if(rtrim($current_page,'/') != rtrim($redirect_url_id, '/')) {
               if(isset($callback_id_0) && $callback_id_0 != ""){

                  $anura_j_script .= 'if ("function" === typeof '.$callback_id_0.'){'.$callback_id_0.'(http.response);}';
               }

               if($allow_webcrawlers_0 == "checked") {
                  if($redirect == 1) {
                     $anura_j_script .= '
                     if(responseobj.result == "bad" && isCrawler != true) {
                        window.location = "'.$redirect_url_id.'";
                     }
                     ';
                  } else if($redirect == 2) {
                     $anura_j_script .= '
                     if(responseobj.result != "good" && isCrawler != true) {
                        window.location = "'.$redirect_url_id.'";
                     }
                     ';
                  }
               } else {
                  if($redirect == 1) {
                     $anura_j_script .= '
                     if(responseobj.result == "bad") {
                        window.location = "'.$redirect_url_id.'";
                     }
                     ';
                  } else if($redirect == 2) {
                     $anura_j_script .= '
                     if(responseobj.result != "good") {
                        window.location = "'.$redirect_url_id.'";
                     }
                     ';
                  }
            }
            }
         $anura_j_script .= '
      }
   }
';
            
               $anura_j_script .= '
               function anura_wp_getResult(response) {
                   var method = "POST";
                   var params = ["instance='.$instance_id_0.'"];
                   if (response.getId()) params.push("id="+encodeURIComponent(response.getId()));
                   if (response.getExId()) params.push("exid="+encodeURIComponent(response.getExId()));
                   var url = "https://script.anura.io/result.json"+("GET" === method ? "?"+params.join("&"): "");
                   if (window.XDomainRequest) {
                       var http = new XDomainRequest();
                       if (http) {
                           http.open(method, document.location.protocol === "https:" ? url: url.replace("https:", "http:"));
                           http.onprogress = function(){};
                           http.ontimeout = function(){};
                           http.onerror = function(){};
                           http.onload = function(){
                              anura_wp_handleResponse(http);
                           };
                           setTimeout(function(){http.send("POST" === method ? params.join("&"): "");}, 0);
                       }
                   } else if (window.XMLHttpRequest) {
                       var http = new XMLHttpRequest();
                       if (http && "withCredentials" in http) {
                           http.open(method, url, true);
                           if ("POST" === method) http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                           http.onreadystatechange = function() {
                              anura_wp_handleResponse(http);
                           }
                           http.send("POST" === method ? params.join("&"): "");
                       }
                   }
               }
               function anura_wp_callback(response) {
                   if (response.getId() || response.getExId()) {
                       anura_wp_getResult(response);
                   }
               }';
         }
         $anura_j_script .= '
         (function(){
            var anura = document.createElement("script");
            if ("object" === typeof anura) {
               var request = {';
                  $anura_j_script .= 'instance: '.$instance_id_0;
                  if($source_2 != "" && isset($source_2) && $source_variable_source_1 != 'option-none') {
                     $anura_j_script .= ',source:"'.$source_2.'"';
                  }
                  if($campaign_4 != "" && isset($campaign_4) && $campaign_variable_source_3 != 'option-none') {
                     $anura_j_script .= ' ,campaign:  "'.$campaign_4.'"';
                  }
                  
                  if($callback_enabled == 1) { 
                     $anura_j_script .= ',callback:  "anura_wp_callback"';
                  }
               $anura_j_script .= '};
               var params = [];
               for (var x in request) params.push(x+"="+encodeURIComponent(request[x]));
                  params.push(Math.floor(1E12*Math.random()+1));
               anura.type = "text/javascript";
               anura.async = true;
               anura.src = "https://script.anura.io/request.js?"+params.join("&");
               var script = document.getElementsByTagName("script")[0];
               script.parentNode.insertBefore(anura, script);
               }
            })();
      </script>';


      printf($anura_j_script); //prints the javascript to the page
   }
}

?>