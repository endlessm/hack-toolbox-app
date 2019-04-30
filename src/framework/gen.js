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

    const cardDefaultRules = `
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
`;

    switch (model.constructor.appId) {
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

${cardDefaultRules}

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

    case 'com.endlessm.encyclopedia.en':
        return `
$primary-light-color: ${mainColor};
$primary-medium-color: ${infoColor};
$primary-dark-color: darken(${infoColor}, 30%);
$accent-light-color: transparentize(${accentColor}, 1 - 0.40);
$accent-dark-color: ${accentColor};

$title-font: '${model.font}';
$display-font: '${model.font}';
// fudge this a bit; the base font is Lato, but we want to make sure there is
// a change visible on the front page when the font changes.
$logo-font: '${model.font === 'Lato' ? 'Libre Baskerville' : model.font}';

@import "encyclopedia";

// No existing overrides, the encyclopedia is its own template.
// New overrides:

.WindowSimple {
    font-size: ${model.font_size * 0.8}pt;
}

.BannerDynamic__logo,
.BannerDynamic__subititle {
    color: ${logoColor};
}

.CardTitle {
    border-width: ${model.border_width}px;
    border-color: ${borderColor};
    border-style: solid;
}

.search-page .CardTitle__title {
    color: $primary-medium-color;
    font-family: $title-font;
    font-size: ${model.font_size * 1.5}px;
}

.search-page .title.search-terms {
    color: $accent-dark-color;
}

.search-page .BannerSearch {
    color: $accent-light-color;
    font-family: $title-font;
    font-size: ${model.font_size * 2.4}px;
}

.paper-template {
    background-image: linear-gradient(to bottom,
                                      $primary-light-color 0%,
                                      $primary-light-color 100%),
                      url('resource:///com/endlessm/knowledge/data/templates/images/noise.png');
}

.ContentGroupNoResultsMessage {
    &__title {
        font-size: ${model.font_size * 2.5}px;
    }
    &__subtitle {
        font-size: ${model.font_size * 1.5}px;
    }
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
    min-height: 456px;
    min-width: 300px;
    margin: 0;

    &__title {
        color: $primary-light-color;
        font-family: $body-font;
        font-size: ${model.font_size * 4.5}px;
        margin: 25px 37px;
    }

    & frame {
        background-position: top;
    }

    &:hover frame {
        background-position: bottom;
    }
}

.BannerDynamic {
    padding-top: 100px;

    &__logo {
        color: $logo-color;
        font-family: $logo-font;
        font-weight: normal;
        min-height: 200px;
        min-width: 900px;
        padding: 50px 0;
        margin-left: 40px;
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

${cardDefaultRules}

${commonRules}
`;
    case 'com.endlessm.Hackdex_chapter_two':
        return `
$accent-light-color: ${accentColor};
$primary-light-color: ${mainColor};
$background-medium-color: #e2e2e2;
$primary-background-image: 'resource:///app/assets/backgroundHome' !default;
$font-lightbox-title: 'IBM Plex Mono';
$font-lightbox-content: 'DK Double Quick';

.overlayBg {
    background-image: url('resource:///app/assets/board');
    background-position: center 15px;
    background-repeat: no-repeat;
    min-height: 1000px;
    min-width: 1900px;
}

.overlayElements {
    background-image: url('resource:///app/assets/overlayElements.png');
    background-position: 0 -33px;
    background-repeat: no-repeat;
}

.WindowSimple {
    background-color: #fff;
    background-image: url($primary-background-image);
    background-position: 0 -33px;
    background-size: cover;

    scrollbar {
        background-color: transparentize(black, 1 - 0.20);
        padding: 3px;

        slider {
            background-color: transparentize(white, 1 - 0.50);
            border-radius: 20px;
            min-width: 10px;
        }
    }
}

.overlayHead {
    background-color: rgba(55, 44, 40, 0.62);
    background-image: url('resource:///app/assets/images/nav-bg.png');
    background-repeat: no-repeat;
    color: #fff;
    font-size: 25px;
    min-height: 100px;
    min-width: 1920px;

    .bannerHead {
        color: #fff;
        font-size: 30px;
        letter-spacing: 3px;
        margin: 5px 45px 0;
        padding: 10px;
    }
}

.ArticleContent-1 {
    min-height: 3250px;
}

.ArticleContent-2 {
    min-height: 3600px;
}

.ArticleContent-3 {
  min-height: 4550px;
}

.Card {
    margin-left: 55px;
    min-height: 670px;


    &__title {
        color: transparent;
    }
}

.CardHackdex {
    min-height: 456px;
    min-width: 300px;
    margin: 0;

    frame {
        background-repeat: no-repeat;
    }

    &.invisible {
        opacity: 0;
    }

    &.invisible:hover {
        opacity: 1;
    }

    &.invisible.Card__1 frame {
        background-image: url('ekn:///2df6f9b81a6528ab9fd4184d391a48732a37a89e');
    }

    &.invisible.Card__2 frame {
        background-image: url('ekn:///e9b81a6528a2df6f732a37a89b9fd4184d391a48');
    }

    &.invisible.Card__3 frame{
        background-image: url('ekn:///a4e92a37a89b9fdb81a6528734184d391a2df6f8');
    }

    & frame {
        background-size: cover;
    }

    &.Card__1 {
        margin-left: 42px;
        margin-right: 0;
        margin-top: 342px;
        min-height: 626px;
    }

    &.Card__2 {
        margin-left: 30px;
        margin-right: 45px;
        margin-top: 40px;
        min-height: 622px;
    }

    &.Card__3 {
        margin-left: 89px;
        margin-right: -8px;
        margin-top: 182px;
        min-height: 689px;
    }

    &.invisible.Card__1 {
        margin-left: 42px;
        margin-right: 0;
        margin-top: 342px;
        min-height: 626px;
    }

    &.invisible.Card__2 {
        margin-left: 35px;
        margin-right: 45px;
        margin-top: 40px;
        min-height: 622px;
    }

    &.invisible.Card__3 {
        margin-left: 80px;
        margin-right: -15px;
        margin-top: 182px;
        min-height: 689px;
    }
}

.home-page {
    .LayoutScrolling--maincontainer {
        padding: 0;
    }

    .ContentGroup--maincontent {
        padding-bottom: 0;
    }
}

.article-page {
    .LayoutScrolling--maincontainer {
        background-color: $background-medium-color;
    }
}

@keyframes carrot {
  0% {
    background-position: top right;
  }

  50% {
    background-position: top left;
  }

  100% {
    background-position: top right;
  }
}

.LightboxDev__wrap {
    &.container-expand {
        margin: 0;
        background: rgba(12, 14, 22, 0.75);
        background-image: url('resource:///app/assets/images/headerNavBar.png');
        background-repeat: no-repeat;
        background-position: left top;

        .LightboxDev__button-toggle {
            background-image: url('resource:///app/assets/images/carrot.png');
            background-repeat: no-repeat;
            background-position: top right;
            min-height: 20px;
            min-width: 20px;
            margin: 45px 0 0 40px;

            &:hover {
                background-image: url('resource:///app/assets/images/carrot.png');
                animation: carrot 1.5s ease infinite;
            }
        }

        .Content-Background {
            background-repeat: no-repeat;
            min-width: 1920px;
            min-height: 950px;
            margin-top: 100px;
            margin-left: -80px;
        }

        .Content-title {
            font-family: $font-lightbox-title;
            font-size: 27px;
            margin-top: 32px;
        }

        .Content-text {
            font-family: $font-lightbox-content;
            font-size: 22px;
        }

        .Content-text-paragraph {
            color: black;
            font-size: 25px;
        }

        .Content-Whale {
            .Notebook-Whale {
                margin-left: -11px;
            }

            .Content-Whale-paragraph-first {
                margin-top: 317px;
                margin-left: 1009px;
            }

            .Content-Whale-paragraph-second {
                margin-top: 550px;
                margin-left: 999px;
            }

            .Content-Whale-paragraph-third {
                margin-top: 730px;
                margin-left: 979px;
            }

            .Content-Whale-paragraph-fourth {
                margin-top: 730px;
                margin-left: 979px;
            }
        }

        .Content-Franklin {
            .Notebook-Franklin {
                margin-left: -11px;
            }

            .Content-text-wake {
                margin-left: 1068px;
                margin-top: 225px;
            }

            .Content-text-perfect {
                margin-left: 935px;
                margin-top: 695px;
            }

            .Content-text-rise {
                margin-left: 1518px;
                margin-top: 180px;
            }

            .Content-text-work {
                margin-left: 1518px;
                margin-top: 308px;
            }

            .Content-text-read {
                margin-left: 1518px;
                margin-top: 385px;
            }

            .Content-text-work-last {
                margin-left: 1518px;
                margin-top: 470px;
            }

            .Content-text-examine {
                margin-left: 1518px;
                margin-top: 580px;
            }

            .Content-text-sleep {
                margin-left: 1518px;
                margin-top: 730px;
            }

            .Content-Franklin-paragraph-first {
                margin-top: 317px;
                margin-left: 1009px;
            }

            .Content-Franklin-paragraph-second {
                margin-top: 550px;
                margin-left: 999px;
            }

            .Content-Franklin-paragraph-third {
                margin-top: 730px;
                margin-left: 979px;
            }

            .Content-Franklin-paragraph-fourth {
                margin-top: 730px;
                margin-left: 979px;
            }
        }
    }
}

.Layout-LightboxDev-Stonehenge {
    min-height: 334px;
    min-width: 185px;

    .LightboxDev__button-toggle:hover {
        background-image: url('resource:///app/assets/images/paperBlueTicket-hover.png');
    }
}

.Layout-LightboxDev-Whale {
    min-height: 327px;
    min-width: 149px;

    .LightboxDev__button-toggle:hover {
        background-image: url('resource:///app/assets/images/paperGreyLeft-hover.png');
    }
}

.Layout-LightboxDev-Franklin {
    min-height: 530px;
    min-width: 129px;

    .LightboxDev__button-toggle:hover {
        background-image: url('resource:///app/assets/images/paperLong-hover.png');
    }
}

.LightboxDev__button-toggle {
    background-image: none;
}

.WindowSimple scrollbar {
    background: #d5d5d5;

    slider {
      background: #999b9c;
    }

    &.horizontal slider {
      min-height: 10px;
    }
}

.Layout-animated-eyes {
    background-image: url('resource:///app/assets/images/eyes.png');
}

// Special overrides for hacking toolbox

.CardHackdex {
    border: ${model.border_width}px solid ${borderColor};

    &__filterOverlay {
        ${overlayFilterProperties}
    }
}

.LightboxDev__button-toggle {
    ${overlayFilterProperties}
}

${commonRules}
`;
    default:
        return '@import "default";';
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

function _orderShortdef(model) {
    switch (model.card_order) {
    case 'ordered':
        return 'Order.Sequence';
    case 'random':
        return 'Order.Random';
    case 'az':
        return "'Order.Alphabetical(ascending: true)'";
    case 'za':
        return "'Order.Alphabetical(ascending: false)'";
    default:
        throw new Error(`${model.card_order}, oops`);
    }
}

function _arrangementModule(model) {
    switch (model.card_layout) {
    case 'tiledGrid':
        return 'Arrangement.TiledGridNoise';
    case 'windshield':
        return 'Arrangement.WindshieldNoise';
    case 'piano':
        return 'Arrangement.PianoNoise';
    case 'nest':
        return 'Arrangement.NestNoise';
    case 'overflow':
        return 'Arrangement.OverflowNoise';
    case 'grid':
        return 'Arrangement.GridNoise';
    case 'list':
        return 'Arrangement.ListNoise';
    default:
        throw new Error(`${model.card_layout}, oops`);
    }
}

function generateYAML(model) {
    const order = _orderShortdef(model);
    const layout = _arrangementModule(model);
    const soundpackProperties = {
        allow_navigation: model.hyperlinks,
        click: model.sounds_cursor_click !== 'none',
    };
    if (model.sounds_cursor_hover !== 'none')
        soundpackProperties.soundpack = model.sounds_cursor_hover;
    else if (model.sounds_cursor_click !== 'none')
        soundpackProperties.soundpack = model.sounds_cursor_click;

    const hackableTextProperties = {};
    let hasHackableText = false;
    let defaultCard = 'Card.Default';
    let titleCard = 'Card.Title';
    let dynamicBanner = 'Banner.Dynamic';
    let searchBanner = 'Banner.Search';
    if (model.text_transformation !== 'normal' || model.image_filter !== 'none' ||
        model.text_cipher !== 0) {
        defaultCard = 'Card.HackableDefault';
        titleCard = 'Card.HackableTitle';
        hackableTextProperties.textfilter = model.text_transformation;
        hackableTextProperties.rotation = model.text_cipher;
        hasHackableText = true;
        dynamicBanner = 'Banner.HackableDynamic';
        searchBanner = 'Banner.HackableSearch';
    }
    switch (model.constructor.appId) {
    case 'com.endlessm.dinosaurs.en': {
        const appBanner = {
            type: dynamicBanner,
            properties: {
                mode: 'full',
                layout: 'horizontal',
                valign: 'center',
                halign: 'center',
            },
        };
        Object.assign(appBanner.properties, hackableTextProperties);

        const homeSetsArrangement = {
            type: layout,
            properties: soundpackProperties,
        };

        const homeSetsCard = {
            type: defaultCard,
            properties: {
                excluded_types: [0, 1],
            },
        };
        Object.assign(homeSetsCard.properties, hackableTextProperties);
        if (model.card_layout === 'list') {
            homeSetsCard.type = titleCard;
            delete homeSetsCard.properties.excluded_types;
            if (!hasHackableText)
                delete homeSetsCard.properties;
        }

        const setTitleCard = {
            type: titleCard,
            properties: {
                max_title_lines: 5,
            },
        };
        Object.assign(setTitleCard.properties, hackableTextProperties);

        const sidebarCard = {type: titleCard};
        if (hasHackableText)
            sidebarCard.properties = hackableTextProperties;

        const banner = {type: searchBanner};
        if (hasHackableText)
            banner.properties = hackableTextProperties;

        return `---
overrides:
  app-banner:
    ${JSON.stringify(appBanner)}

  home-sets-order: &order
    shortdef: ${order}

  set-articles-order: *order

  home-sets-arrangement:
    ${JSON.stringify(homeSetsArrangement)}

  home-sets-card:
    ${JSON.stringify(homeSetsCard)}

  root.window.content.content.content.set-page.sidebar.content.arrangement.card:
    ${JSON.stringify(sidebarCard)}
  root.window.content.content.content.set-page.content.card:
    ${JSON.stringify(setTitleCard)}
  root.window.content.content.content.search-page.sidebar.content.arrangement.card:
    ${JSON.stringify(sidebarCard)}
  root.window.content.content.content.search-page.content:
    ${JSON.stringify(banner)}
  root.window.content.content.content.article-page.sidebar.content.arrangement.card:
    ${JSON.stringify(sidebarCard)}
---
!import 'thematic'
`;
    }

    case 'com.endlessm.encyclopedia.en': {
        const appBanner = {
            type: dynamicBanner,
            properties: {
                expand: true,
                mode: 'full',
            },
        };
        Object.assign(appBanner.properties, hackableTextProperties);

        const searchArticlesCard = {
            type: defaultCard,
            properties: {
                halign: 'fill',
            },
        };
        Object.assign(searchArticlesCard.properties, hackableTextProperties);
        if (model.card_layout === 'list') {
            searchArticlesCard.type = titleCard;
            searchArticlesCard.properties.halign = 'start';
        }

        const searchArticlesArrangement = {
            type: layout,
            properties: {
                hexpand: true,
                homogeneous: false,
            },
        };
        Object.assign(searchArticlesArrangement.properties, soundpackProperties);

        return `---
overrides:
  app-banner:
    ${JSON.stringify(appBanner)}

  search-articles-card:
    ${JSON.stringify(searchArticlesCard)}

  search-articles-arrangement:
    ${JSON.stringify(searchArticlesArrangement)}

  # test this
  root.window.content.content.search-page.contents.1.content.content.contents.2.selection:
    type: Selection.Search
    id: search-results
    slots:
      filter: Filter.Articles
      order: ${order}
---
!import 'encyclopedia'
`;
    }

    case 'com.endlessm.Hackdex_chapter_one': {
        const homeButton = {
            type: 'Banner.HomeButton',
            properties: {
                text: 'Roster',
            },
        };
        Object.assign(homeButton.properties, hackableTextProperties);

        const appBanner = {
            type: dynamicBanner,
            properties: {
                mode: 'full',
                format_string: 'Roster',
                valign: 'center',
                halign: 'start',
            },
        };
        Object.assign(appBanner.properties, hackableTextProperties);

        const homeArticlesArrangement = {
            type: layout,
            properties: {
                homogeneous: true,
                column_spacing: 33,
                row_spacing: 90,
                halign: 'center',
                valign: 'start',
            },
        };
        Object.assign(homeArticlesArrangement.properties, soundpackProperties);

        const hackdexCard = {type: 'Card.Hackdex'};
        if (hasHackableText)
            hackdexCard.properties = hackableTextProperties;

        return `---
overrides:
  home-button:
    ${JSON.stringify(homeButton)}

  app-banner:
    ${JSON.stringify(appBanner)}

  home-articles-order:
    shortdef: ${order}

  home-articles-arrangement:
    ${JSON.stringify(homeArticlesArrangement)}

  home-articles-card:
    ${JSON.stringify(hackdexCard)}
---
!import 'Hackdex_chapter_one'
`;
    }
    case 'com.endlessm.Hackdex_chapter_two': {
        // Preserve encryption function from app.yaml; players use the
        // 'rotation' property to undo this
        Object.assign(hackableTextProperties, {
            decodefunc: 'return (letter + 21) % 26;',
        });

        const root = 'root.window.content.content.home-page.content.overlays';
        const labelOverrides = {
            '2.content.overlays.2': {
                type: 'ContentGroup.EncryptText',
                properties: {
                    label: 'Stonehenge diagrams',
                },
                styles: ['Content-title'],
            },
            '2.content.overlays.3': {
                type: 'ContentGroup.EncryptText',
                properties: {
                    'margin-left': 523,
                    'margin-top': 322,
                    label: `\
The outer ring was made up of
30 stones to represent an
average of 30 days in a month`,
                },
                styles: ['Content-text', 'Content-text-ring'],
            },
            '2.content.overlays.4': {
                type: 'ContentGroup.EncryptText',
                properties: {
                    'margin-left': 520,
                    'margin-top': 820,
                    label: 'Stonehenge may have been\nused as a compass',
                },
                styles: ['Content-text', 'Content-text-compass'],
            },
            '2.content.overlays.5': {
                type: 'ContentGroup.HackdexText',
                properties: {
                    'margin-left': 1096,
                    'margin-top': 351,
                    text: `\
- hmm, looks like Leviathan had a thing for Stonehenge.
Sometimes he used symbols related to Stonehenge
in his legendary hacks. Another coincidence with Saniel!

- Saniel talks about Stonehenge so frequently, it's
as if he thinks of Stonehenge as his own
personal watch!

- I've noticed that sometimes Saniel arranges the
items on his desk in the same pattern of concentric
circles as the stones in this diagram. Knowing him,
he probably really can tell time that way!
`,
                },
                styles: [
                    'Content-text',
                    'Content-text-paragraph',
                    'Content-Stonehenge-paragraph-first',
                ],
            },
            '3.content.overlays.3': {
                type: 'ContentGroup.EncryptText',
                properties: {
                    label: 'Clipping of a whale song',
                },
                styles: ['Content-title'],
            },
            '3.content.overlays.4': {
                type: 'ContentGroup.EncryptText',
                properties: {
                    'margin-left': 981,
                    'margin-top': 583,
                    label: 'Each of these ticks is a unit\nwhich is equivalent to a note',
                },
                styles: ['Content-text', 'Content-text-ticks'],
            },
            '3.content.overlays.5': {
                type: 'ContentGroup.EncryptText',
                properties: {
                    'margin-left': 1078,
                    'margin-top': 778,
                    label: `\
Whales kind of sing for
the same reason humans do!
They want to show their
friends how they sing and
to share their song`,
                },
                styles: ['Content-text', 'Content-text-friends'],
            },
            '3.content.overlays.6': {
                type: 'ContentGroup.EncryptText',
                properties: {
                    'margin-left': 1590,
                    'margin-top': 653,
                    label: "Units make up a phrase\nwhich are repeated to\nmake a whale's song",
                },
                styles: ['Content-text', 'Content-text-phrase'],
            },
            '3.content.overlays.7': {
                type: 'ContentGroup.HackdexText',
                properties: {
                    'margin-left': 234,
                    'margin-top': 310,
                    text: `\
- Leviathan: the great whale. The whale is a very
important symbol for Saniel.

- We've all heard about Saniel's keen interest in whales,
especially in regard to his famous sleeping habits.

- When Saniel is deep in concentration, I swear I can
faintly hear whale songs. I don't know how he does that
on land! I know that when he's in that zone, he always
comes up with new solutions!

- Saniel also often delivers random whale facts: the
other day, he told me that whales learn a new song
every few years by hearing the songs of other
populations. So interesting.
`,
                },
                styles: [
                    'Content-text',
                    'Content-text-paragraph',
                    'Content-Whale-paragraph-first',
                ],
            },
            '4.content.overlays.3': {
                type: 'ContentGroup.EncryptText',
                properties: {
                    label: "Benjamin Franklin's daily schedule",
                },
                styles: ['Content-title'],
            },
            '4.content.overlays.4': {
                type: 'ContentGroup.EncryptText',
                properties: {
                    label: 'Wake up at 5am!!!',
                },
                styles: ['Content-text', 'Content-text-wake'],
            },
            '4.content.overlays.5': {
                type: 'ContentGroup.EncryptText',
                properties: {
                    label: `\
Ben Franklin was known to say
that he wasn't perfect and often
broke his strict schedule for leisure!`,
                },
                styles: ['Content-text', 'Content-text-perfect'],
            },
            '4.content.overlays.6': {
                type: 'ContentGroup.EncryptText',
                properties: {
                    label: "Rise, wash, contrive day's\nbusiness; and breakfast",
                },
                styles: ['Content-text', 'Content-text-rise'],
            },
            '4.content.overlays.7': {
                type: 'ContentGroup.EncryptText',
                properties: {
                    label: 'Work',
                },
                styles: ['Content-text', 'Content-text-work'],
            },
            '4.content.overlays.8': {
                type: 'ContentGroup.EncryptText',
                properties: {
                    label: 'Read and dine',
                },
                styles: ['Content-text', 'Content-text-read'],
            },
            '4.content.overlays.9': {
                type: 'ContentGroup.EncryptText',
                properties: {
                    label: 'work',
                },
                styles: ['Content-text', 'Content-text-work-last'],
            },
            '4.content.overlays.10': {
                type: 'ContentGroup.EncryptText',
                properties: {
                    label: 'Put things in their\nplace; examine the day',
                },
                styles: ['Content-text', 'Content-text-examine'],
            },
            '4.content.overlays.11': {
                type: 'ContentGroup.EncryptText',
                properties: {
                    label: 'sleep',
                },
                styles: ['Content-text', 'Content-text-sleep'],
            },
            '4.content.overlays.12': {
                type: 'ContentGroup.HackdexText',
                properties: {
                    'margin-left': 266,
                    'margin-top': 283,
                    text: `\
- Leviathan? this scrap from the original Leviathan
file matches the handwritten scrap on the wall
above Saniel's Desk.

- I asked him what the numbers meant and he said it
was Ben Franklin's daily schedule! I'm not surprised
because Saniel is fascinated with perfecting
how he uses his time.

- He said he's inspired by Franklin's methodical approach,
but he keeps his own schedule very open. "Data never
sleeps," he always says.

- Franklin began his day with this question, "what good
shall i do this day?" I have heard Saniel say those exact
words so many times.
`,
                },
                styles: [
                    'Content-text',
                    'Content-text-paragraph',
                    'Content-Franklin-paragraph-first',
                ],
            },
        };

        const overridesString = Object.entries(labelOverrides)
            .map(([key, module]) => {
                Object.assign(module.properties, {valign: 'start'},
                    hackableTextProperties);
                return `${root}.${key}: ${JSON.stringify(module)}`;
            })
            .join('\n  ');

        const arrangementProperties = Object.assign({
            halign: 'fill',
            valign: 'fill',
            vexpand: true,
        }, soundpackProperties);

        return `---
overrides:
  home-articles-card:
    type: Card.Hackdex
    properties: ${JSON.stringify(hackableTextProperties)}

  home-articles-arrangement:
    type: Arrangement.PinterestNoise
    properties: ${JSON.stringify(arrangementProperties)}

  document-view:
    type: View.DocumentDev
    properties: ${JSON.stringify(hackableTextProperties)}

  ${overridesString}
---
!import 'Hackdex_chapter_two'
`;
    }
    default:
        return '!import "library"';
    }
}
