<?php
/**
 * Plugin Name: Zenora Hire – World Class Animations
 * Plugin URI:  https://zenorahire.com
 * Description: Premium scroll-triggered animations, particle hero, typewriter, counters, parallax, cursor & hover effects for Zenora Hire.
 * Version:     1.0.0
 * Author:      Zenora Hire
 * License:     GPL-2.0+
 */

if ( ! defined( 'ABSPATH' ) ) exit;

define( 'ZENORA_ANIM_VERSION', '1.0.0' );
define( 'ZENORA_ANIM_URL',     plugin_dir_url( __FILE__ ) );
define( 'ZENORA_ANIM_PATH',    plugin_dir_path( __FILE__ ) );

add_action( 'wp_enqueue_scripts', 'zenora_enqueue_assets' );
function zenora_enqueue_assets() {
    // AOS – Animate On Scroll (CDN)
    wp_enqueue_style(
        'aos-css',
        'https://unpkg.com/aos@2.3.4/dist/aos.css',
        [],
        '2.3.4'
    );

    // Plugin CSS
    wp_enqueue_style(
        'zenora-animations',
        ZENORA_ANIM_URL . 'css/zenora-animations.css',
        [ 'aos-css' ],
        ZENORA_ANIM_VERSION
    );

    // GSAP (CDN)
    wp_enqueue_script(
        'gsap',
        'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js',
        [],
        '3.12.5',
        true
    );
    wp_enqueue_script(
        'gsap-scrolltrigger',
        'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js',
        [ 'gsap' ],
        '3.12.5',
        true
    );

    // AOS JS (CDN)
    wp_enqueue_script(
        'aos-js',
        'https://unpkg.com/aos@2.3.4/dist/aos.js',
        [],
        '2.3.4',
        true
    );

    // Vanilla Tilt (hover 3-D tilt)
    wp_enqueue_script(
        'vanilla-tilt',
        'https://cdnjs.cloudflare.com/ajax/libs/vanilla-tilt/1.8.1/vanilla-tilt.min.js',
        [],
        '1.8.1',
        true
    );

    // Plugin JS
    wp_enqueue_script(
        'zenora-animations',
        ZENORA_ANIM_URL . 'js/zenora-animations.js',
        [ 'gsap', 'gsap-scrolltrigger', 'aos-js', 'vanilla-tilt' ],
        ZENORA_ANIM_VERSION,
        true
    );
}

/* ------------------------------------------------------------------ */
/*  Shortcode: [zenora_particles]  – full-width particle hero canvas   */
/* ------------------------------------------------------------------ */
add_shortcode( 'zenora_particles', 'zenora_particles_shortcode' );
function zenora_particles_shortcode( $atts ) {
    $atts = shortcode_atts( [
        'height' => '100vh',
        'color'  => '#ffffff',
    ], $atts );

    ob_start(); ?>
    <div class="zenora-particle-hero" style="height:<?php echo esc_attr( $atts['height'] ); ?>">
        <canvas id="zenora-particle-canvas"></canvas>
        <div class="zenora-particle-content">
            <?php echo do_shortcode( '[zenora_typewriter]' ); ?>
        </div>
    </div>
    <?php
    return ob_get_clean();
}

/* ------------------------------------------------------------------ */
/*  Shortcode: [zenora_typewriter texts="A,B,C"]                       */
/* ------------------------------------------------------------------ */
add_shortcode( 'zenora_typewriter', 'zenora_typewriter_shortcode' );
function zenora_typewriter_shortcode( $atts ) {
    $atts = shortcode_atts( [
        'texts' => 'Find Top Talent,Build Dream Teams,Hire Smarter',
        'speed' => 80,
    ], $atts );

    $texts = array_map( 'trim', explode( ',', $atts['texts'] ) );
    $json  = wp_json_encode( $texts );
    $speed = intval( $atts['speed'] );

    ob_start(); ?>
    <span class="zenora-typewriter"
          data-texts='<?php echo esc_attr( $json ); ?>'
          data-speed="<?php echo $speed; ?>">
    </span>
    <?php
    return ob_get_clean();
}

/* ------------------------------------------------------------------ */
/*  Shortcode: [zenora_counter end="500" label="Placements"]           */
/* ------------------------------------------------------------------ */
add_shortcode( 'zenora_counter', 'zenora_counter_shortcode' );
function zenora_counter_shortcode( $atts ) {
    $atts = shortcode_atts( [
        'end'      => '100',
        'label'    => '',
        'prefix'   => '',
        'suffix'   => '+',
        'duration' => 2,
    ], $atts );
    ob_start(); ?>
    <div class="zenora-counter-wrap" data-aos="fade-up">
        <div class="zenora-counter"
             data-end="<?php echo intval( $atts['end'] ); ?>"
             data-duration="<?php echo intval( $atts['duration'] ); ?>"
             data-prefix="<?php echo esc_attr( $atts['prefix'] ); ?>"
             data-suffix="<?php echo esc_attr( $atts['suffix'] ); ?>">
            <span class="zenora-counter-value">0</span>
        </div>
        <?php if ( $atts['label'] ) : ?>
        <p class="zenora-counter-label"><?php echo esc_html( $atts['label'] ); ?></p>
        <?php endif; ?>
    </div>
    <?php
    return ob_get_clean();
}

/* ------------------------------------------------------------------ */
/*  Shortcode: [zenora_marquee texts="A|B|C"]  – infinite ticker       */
/* ------------------------------------------------------------------ */
add_shortcode( 'zenora_marquee', 'zenora_marquee_shortcode' );
function zenora_marquee_shortcode( $atts ) {
    $atts  = shortcode_atts( [ 'texts' => 'We\'re Hiring|Top Talent|Fast Placements|Trusted Globally' ], $atts );
    $items = array_map( 'trim', explode( '|', $atts['texts'] ) );
    $double = array_merge( $items, $items ); // duplicate for seamless loop
    ob_start(); ?>
    <div class="zenora-marquee-outer">
        <div class="zenora-marquee-track">
            <?php foreach ( $double as $item ) : ?>
                <span class="zenora-marquee-item"><?php echo esc_html( $item ); ?> <i class="zenora-dot">●</i></span>
            <?php endforeach; ?>
        </div>
    </div>
    <?php
    return ob_get_clean();
}

/* ------------------------------------------------------------------ */
/*  Shortcode: [zenora_tilt_card] ... [/zenora_tilt_card]              */
/* ------------------------------------------------------------------ */
add_shortcode( 'zenora_tilt_card', 'zenora_tilt_card_shortcode' );
function zenora_tilt_card_shortcode( $atts, $content = '' ) {
    return '<div class="zenora-tilt-card" data-tilt data-tilt-glare="true" data-tilt-max-glare="0.2" data-tilt-max="8" data-aos="zoom-in">'
           . do_shortcode( $content )
           . '</div>';
}

/* ------------------------------------------------------------------ */
/*  Custom cursor injection                                             */
/* ------------------------------------------------------------------ */
add_action( 'wp_footer', 'zenora_inject_cursor' );
function zenora_inject_cursor() { ?>
    <div id="zenora-cursor"></div>
    <div id="zenora-cursor-dot"></div>
    <?php
}
