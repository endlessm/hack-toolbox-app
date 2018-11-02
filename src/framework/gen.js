/* exported generateGResource, generateSCSS, generateWebSCSS, generateYAML */

function generateSCSS(model) {
    const accentColor = model.accent_color.to_string();
    const borderColor = model.border_color.to_string();
    const infoColor = model.info_color.to_string();
    const logoColor = model.logo_color.to_string();
    const mainColor = model.main_color.to_string();

    let overlayFilterProperties;
    switch (model.image_filter) {
    case 'none':
        overlayFilterProperties = 'background: none;';
        break;
    case 'disco':
        overlayFilterProperties = `
background: linear-gradient(60deg,
    transparentize(#f79533, 0.5),
    transparentize(#f37055, 0.5),
    transparentize(#ef4e7b, 0.5),
    transparentize(#a166ab, 0.5),
    transparentize(#5073b8, 0.5),
    transparentize(#1098ad, 0.5),
    transparentize(#07b39b, 0.5),
    transparentize(#6fba82, 0.5));
background-size: 300% 300%;
animation: animatedgradient 3s ease alternate infinite;`;
        break;
    case 'corduroy':
        // http://lea.verou.me/css3patterns/#stairs
        overlayFilterProperties = `
background: linear-gradient(63deg, rgba(153, 153, 153, 0.3) 23%, transparent 23%) 7px 0,
            linear-gradient(63deg, transparent 74%, rgba(153, 153, 153, 0.3) 78%),
            linear-gradient(63deg, transparent 34%, rgba(153, 153, 153, 0.3) 38%,
                            rgba(153, 153, 153, 0.3) 58%, transparent 62%),
            rgba(68, 68, 68, 0.3);
background-size: 16px 48px;
`;
        break;
    case 'blueprint':
        // http://lea.verou.me/css3patterns/#blueprint-grid
        overlayFilterProperties = `
background-color: rgba(34, 102, 153, 0.7);
background-image: linear-gradient(white 2px, transparent 2px),
                  linear-gradient(90deg, white 2px, transparent 2px),
                  linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px);
background-size: 100px 100px, 100px 100px, 20px 20px, 20px 20px;
background-position: -2px -2px, -2px -2px, -1px -1px, -1px -1px;
`;
        break;
    case 'lensFlare':
        // http://www.standardista.com/cssgradients/css/flashes.css
        overlayFilterProperties = `
background-color: rgba(0, 0, 0, 0.4);
background-image: radial-gradient(circle closest-side, rgba(255, 255, 255, 0.4) 0%,
                                  rgba(255, 255, 255, 0) 28%,
                                  rgba(255, 255, 255, 0) 40%),
                  radial-gradient(circle closest-side, rgba(255,255,255,0.4) 0,
                                  rgba(255, 255, 255, 0) 28%,
                                  rgba(255, 255, 255, 0) 40%),
                  radial-gradient(circle closest-side, rgba(255, 255, 255, 0.4) 0%,
                                  rgba(255, 255, 255, 0) 3.5%,
                                  rgba(255, 255, 255, 0) 5%),
                  radial-gradient(circle closest-side, rgba(255, 255, 255, 0.4) 0%,
                                  rgba(255, 255, 255, 0) 3.5%,
                                  rgba(255, 255, 255, 0) 5%),
                  /* red circle with white center  -RedB */
                  radial-gradient(circle closest-side, rgba(255, 255, 255, 0.95) 0%,
                                  rgba(255, 255, 255, 0.8) 4%,
                                  rgba(189, 58, 54, 0.21) 28%,
                                  rgba(189, 58, 54, 0) 34%,
                                  rgba(189, 58, 54, 0.53) 36%,
                                  rgba(189, 58, 54, 0) 38%,
                                  rgba(189, 58, 54, 0) 40%),
                  /* large rainbow circle -Flag */
                  radial-gradient(circle closest-side, rgba(255, 255, 255, 0) 0%,
                                  rgba(0, 218, 0, 0.10) 11.5%,
                                  rgba(0, 218, 0, 0.18) 27%,
                                  rgba(189, 58, 54, 0.25) 27%,
                                  rgba(189, 58, 54, 0.25) 28.5%,
                                  rgba(0, 218, 0, 0) 30%,
                                  rgba(0, 0, 218, 0) 41.5%,
                                  rgba(0, 0, 218, 0.25) 43%,
                                  rgba(0, 218, 0, 0.25) 44.5%,
                                  rgba(251, 218, 63, 0.18) 46%,
                                  rgba(189, 58, 54, 0.25) 47.5%,
                                  rgba(189, 58, 54, 0) 50%),
                  /* green circle with blue center -blue */
                  radial-gradient(circle closest-side, rgba(0,0,218,0.25) 0%,
                                  rgba(0, 218, 0, 0.10) 24.0%,
                                  rgba(0, 218, 0, 0) 28.0%,
                                  rgba(0, 0, 0, 0.35) 28.4%,
                                  rgba(0, 0, 0, 0) 36.0%,
                                  rgba(0, 0, 0, 0) 40.0%),
                  /* single red on top of dim -sr */
                  radial-gradient(circle closest-side, rgba(189, 58, 54, 0.15) 0%,
                                  rgba(189, 58, 54, 0.15) 36.0%,
                                  rgba(189, 58, 54, 0.0) 36.4%,
                                  rgba(0, 0, 0, 0) 40.0%),
                  /* barely visible red inner and outer cirle -dim */
                  radial-gradient(circle closest-side, rgba(189, 58, 54, 0.25) 0%,
                                  rgba(189, 58, 54, 0.25) 10%,
                                  rgba(189, 58, 54, 0.1) 12%,
                                  rgba(189, 58, 54, 0.2) 36%,
                                  rgba(189, 58, 54, 0.0) 36.4%,
                                  rgba(0, 0, 0, 0) 40.0%);
background-size: 200px 200px;
background-position: 75px 75px, 85px 85px, 94px 95px, 117px 137px,
                     58px 60px, /* RedB */
                     40px 40px, /* Flag */
                     125px 150px, /* blue */
                     87px 197px, /* sr */
                     90px 100px; /* dim */
background-repeat: no-repeat;
`;
        break;
    default:
        throw new Error(`${model.image_filter}, oops`);
    }

    const commonRules = `
@keyframes animatedgradient {
    0% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
    100% {
        background-position: 0% 50%;
    }
};
`;

    switch (model.constructor.busName) {
    case 'com.endlessm.dinosaurs.en':
        return `
$primary-light-color: ${infoColor};
$primary-medium-color: ${mainColor};
$primary-dark-color: darken(${mainColor}, 30%);
$accent-light-color: ${accentColor};
$accent-dark-color: darken(${accentColor}, 30%);

$title-font: '${model.font}';
$logo-font: 'Patrick Hand SC';

@import 'thematic';

// com.endlessm.dinosaurs.en existing overrides:

.BannerDynamic__logo {
    font-weight: 400;
}

.home-page .Card__title {
    font-weight: bold;
    font-size: ${model.font_size * 0.156}em;
}

.set-page .Card__title {
    font-weight: bold;
    font-size: ${model.font_size * 0.338}em;
}

// new overrides:

.BannerDynamic__logo,
.BannerDynamic__subititle {
    color: ${logoColor};
}

// This makes the main color a bit more interesting and obvious
.CardDefault.CardPost {
    .CardDefault__title {
        color: ${mainColor};
    }

    &:hover .CardDefault__title {
        color: ${accentColor};
    }

    .CardDefault__context {
        color: $primary-light-color;
    }
}

// This as well
.LayoutSidebar {
    .content {
        .BannerSet .CardTitle__title,
        .BannerSearch__title {
            color: ${mainColor};
        }
    }

    .sidebar .CardTitle {
        &__title {
            color: transparentize(${mainColor}, 1 - 0.60);
        }

        &:hover .Card__title {
            color: ${mainColor};
        }

        &:active,
        &.highlighted {
            .CardTitle .CardTitle__title {
                color: ${accentColor};
            }
        }
    }
}

// Card borders:

.CardDefault {
    padding: ${model.border_width}px;
    background-color: ${borderColor};
}

// Overlay filters

.CardHackableDefault__filter_overlay {
    ${overlayFilterProperties}
}

// These basically override every font size in the theme

.LayoutSidebar .sidebar .ContentGroupNoResultsMessage {
    &__title {
        font-size: ${model.font_size * 3}px;
    }

    &__subtitle {
        font-size: ${model.font_size * 2}px;
    }
}

.CardDefault {
    &__title {
        font-size: ${model.font_size * 1.8}px;
    }

    &__synopsis {
        font-size: ${model.font_size * 1.6}px;
    }

    &__context {
        font-size: ${model.font_size * 1.4}px;
    }

    &.CardText {
        &.width-h,
        &.width-g,
        &.width-f,
        &.width-e.height-e {
            .CardDefault__title {
                font-size: ${model.font_size * 4.8}px;
            }
            .CardDefault__synopsis {
                font-size: ${model.font_size * 2}px;
            }
        }

        &.width-e.height-d,
        &.width-e.height-c {
            .CardDefault__title {
                font-size: ${model.font_size * 3.68}px;
            }
        }

        &.width-e,
        &.width-d {
            .CardDefault__title {
                font-size: ${model.font_size * 2.72}px;
            }
        }

        &.width-c {
            .CardDefault__title {
                font-size: ${model.font_size * 2.304}px;
            }
        }

        &.width-b {
            .CardDefault__title {
                font-size: ${model.font_size * 1.8}px;
            }
        }

        &.height-a {
            .CardDefault__title {
                font-size: ${model.font_size * 1.6}px;
            }
        }
    }

    &.CardPolaroid {
        &.width-h,
        &.width-g,
        &.width-f,
        &.width-e.height-e {
            .CardDefault__title {
                font-size: ${model.font_size * 3.68}px;
            }
        }

        &.width-h.height-b,
        &.width-g.height-b,
        &.width-f.height-b,
        &.width-e,
        &.width-d.height-e,
        &.width-d.height-d {
            .CardDefault__title {
                font-size: ${model.font_size * 2.4}px;
            }
        }

        &.width-d,
        &.width-c,
        &.width-b.height-e,
        &.width-b.height-d {
            .CardDefault__title {
                font-size: ${model.font_size * 2}px;
            }
        }

        &.width-b,
        &.height-a {
            .CardDefault__title {
                font-size: ${model.font_size * 1.6}px;
            }
        }
    }

    &.CardPost {
        .CardDefault__context {
            font-size: ${model.font_size * 1.4}px;
        }

        &.width-h,
        &.width-g {
            .CardDefault__title {
                font-size: ${model.font_size * 4.8}px;
            }
        }

        &.width-h.height-c,
        &.width-g.height-c,
        &.width-f,
        &.width-e.height-e {
            .CardDefault__title {
                font-size: ${model.font_size * 3.68}px;
            }
        }

        &.width-g.height-b,
        &.width-h.height-b,
        &.width-f.height-b,
        &.width-e,
        &.width-d.height-e,
        &.width-d.height-d {
            .CardDefault__title {
                font-size: ${model.font_size * 2.4}px;
            }
        }

        &.width-d,
        &.width-c,
        &.width-b.height-e,
        &.width-b.height-d {
            .CardDefault__title {
                font-size: ${model.font_size * 2}px;
            }
        }

        &.width-b,
        &.height-a {
            .CardDefault__title {
                font-size: ${model.font_size * 1.6}px;
            }
        }
    }
}

.LayoutSidebar {
    .content .BannerSearch__title {
        font-size: ${model.font_size * 7.2}px;
    }

    .sidebar .CardTitle {
        &__title {
            font-size: ${model.font_size * 2}px;
        }
    }
}

.BannerSet .CardTitle {
    &__title {
        font-size: ${model.font_size * 5.4}px;
    }
}

.BannerDynamic {
    font-size: ${model.font_size * 2}px;
}

${commonRules}
`;

    case 'com.endlessm.Hackdex_chapter_one':
        return `
$accent-light-color: ${accentColor};
$primary-light-color: ${mainColor};
$background-transparent-dark-color: rgba(0,0,0,.3);
$background-medium-color: #e2e2e2;
$background-light-color: transparent;
$logo-color: ${logoColor};

$title-font: 'Hack';
$logo-font: ${model.font};
$body-font: ${model.font};

@import 'default';

// com.endlessm.Hackdex_chapter_one existing overrides:

.overlayHead {
    background-color: $background-transparent-dark-color;
    min-height: 60px;
    font-family: $title-font;
    padding: 40px 140px 0;
    margin-bottom: 96px;
}

.CardHackdex {
    min-height: 462px;
    min-width: 300px;
    margin: 0;

    &__title {
        color: $primary-light-color;
        font-family: $body-font;
        font-size: ${model.font_size * 4.5}px;
        margin: 25px 37px;
    }
}

.BannerDynamic {
    padding-top: 100px;

    &__logo {
        color: $logo-color;
        font-family: $logo-font;
        font-weight: normal;
        min-height: 200px;
        min-width: 1000px;
        margin-left: -100px;
    }
}

.bannerHead {
    font-size: ${model.font_size * 2.5}px;
    color: $accent-light-color;
}

.home-page {
    .LayoutScrolling--maincontainer {
        padding: 0 140px;
    }

    .ContentGroup--maincontent {
        padding-bottom: 90px;
    }
}

.article-page {
    .LayoutScrolling--maincontainer {
        background-color: $background-medium-color;
    }
}

// Special overrides for hacking toolbox

.CardHackdex {
    border: ${model.border_width}px solid ${borderColor};

    &__filterOverlay {
        ${overlayFilterProperties}
    }
}

${commonRules}
`;
    default:
        return '!import "default"';
    }
}

function generateGResource(model) {
    void model;
    return `<?xml version="1.0" encoding="UTF-8"?>
<gresources>
  <gresource prefix="/app/assets">
    <file preprocess="xml-stripblanks">logo</file>
  </gresource>
</gresources>`;
}

function generateWebSCSS(model) {
    void model;
    return '';
}

function generateYAML(model) {
    let order;
    switch (model.card_order) {
    case 'ordered':
        order = 'Order.Sequence';
        break;
    case 'random':
        order = 'Order.Random';
        break;
    case 'az':
        order = "'Order.Alphabetical(ascending: true)'";
        break;
    case 'za':
        order = "'Order.Alphabetical(ascending: false)'";
        break;
    default:
        throw new Error(`${model.card_order}, oops`);
    }

    let layout;
    switch (model.card_layout) {
    case 'tiledGrid':
        layout = 'Arrangement.TiledGridNoise';
        break;
    case 'windshield':
        layout = 'Arrangement.WindshieldNoise';
        break;
    case 'piano':
        layout = 'Arrangement.PianoNoise';
        break;
    case 'nest':
        layout = 'Arrangement.NestNoise';
        break;
    case 'overflow':
        layout = 'Arrangement.OverflowNoise';
        break;
    case 'grid':
        layout = 'Arrangement.GridNoise';
        break;
    default:
        throw new Error(`${model.card_layout}, oops`);
    }

    let soundpackProperty = '';
    if (model.sounds_cursor_hover !== 'none')
        soundpackProperty = `soundpack: ${model.sounds_cursor_hover}`;
    else if (model.sounds_cursor_click !== 'none')
        soundpackProperty = `soundpack: ${model.sounds_cursor_click}`;

    let textFilterProperty = '';
    let rotationProperty = '';
    let shorthandProperties = '';
    let defaultCard = 'Card.Default';
    let titleCard = 'Card.Title';
    let dynamicBanner = 'Banner.Dynamic';
    let searchBanner = 'Banner.Search';
    if (model.text_transformation !== 'normal' || model.image_filter !== 'none' ||
        model.text_cipher !== 0) {
        defaultCard = 'Card.HackableDefault';
        titleCard = 'Card.HackableTitle';
        textFilterProperty = `textfilter: ${model.text_transformation}`;
        rotationProperty = `rotation: ${model.text_cipher}`;
        shorthandProperties = `${textFilterProperty}, ${rotationProperty}`;
        dynamicBanner = 'Banner.HackableDynamic';
        searchBanner = 'Banner.HackableSearch';
    }
    switch (model.constructor.busName) {
    case 'com.endlessm.dinosaurs.en':
        return `---
overrides:
  app-banner:
    type: ${dynamicBanner}
    properties:
      mode: full
      layout: horizontal
      valign: center
      halign: center
      ${textFilterProperty}
      ${rotationProperty}

  home-sets-order: &order
    shortdef: ${order}

  set-articles-order: *order

  home-sets-arrangement:
    type: ${layout}
    properties:
      allow_navigation: ${model.hyperlinks}
      click: ${model.sounds_cursor_click !== 'none'}
      ${soundpackProperty}

  home-sets-card:
    type: ${defaultCard}
    properties:
      excluded_types:
        - 0
        - 1
      ${textFilterProperty}
      ${rotationProperty}

  root.window.content.content.content.set-page.sidebar.content.arrangement.card:
    shortdef: '${titleCard}(${shorthandProperties})'
  root.window.content.content.content.set-page.content.card:
    type: ${titleCard}
    properties:
      max-title-lines: 5
      ${textFilterProperty}
      ${rotationProperty}
  root.window.content.content.content.search-page.sidebar.content.arrangement.card:
    shortdef: '${titleCard}(${shorthandProperties})'
  root.window.content.content.content.search-page.content:
    shortdef: '${searchBanner}(${shorthandProperties})'
  root.window.content.content.content.article-page.sidebar.content.arrangement.card:
    shortdef: '${titleCard}(${shorthandProperties})'
---
!import 'thematic'
`;
    case 'com.endlessm.Hackdex_chapter_one':
        return `---
overrides:
  home-button:
    type: Banner.HomeButton
    properties:
      text: 'HACKDEX : CHAPTER 1'
      ${textFilterProperty}
      ${rotationProperty}

  app-banner:
    type: ${dynamicBanner}
    properties:
      mode: full
      format-string: 'Clubhouse Directory'
      valign: center
      halign: start
      ${textFilterProperty}
      ${rotationProperty}

  home-articles-order:
    shortdef: ${order}

  home-articles-arrangement:
    type: ${layout}
    properties:
      homogeneous: true
      column-spacing: 33
      row-spacing: 90
      halign: center
      valign: start
      allow_navigation: ${model.hyperlinks}
      click: ${model.sounds_cursor_click !== 'none'}
      ${soundpackProperty}

  home-articles-card:
    shortdef: 'Card.Hackdex(${shorthandProperties})'
---
!import 'Hackdex_chapter_one'
`;
    default:
        return '!import "library"';
    }
}
