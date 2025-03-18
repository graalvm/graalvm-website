function setLightFavicon() {
    var favicon = document.getElementById('favicon');
    favicon.href = '/resources/img/favicon/favicon-light/favicon-light.ico';
}
function setDarkFavicon() {
    var favicon = document.getElementById('favicon');
    favicon.href = '/resources/img/favicon/favicon-dark/favicon-dark.ico';
}
var isDarkTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

if (isDarkTheme) {
    setDarkFavicon();
} else {
    setLightFavicon();
}