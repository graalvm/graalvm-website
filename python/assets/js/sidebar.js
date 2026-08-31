//Expand&Collapse sidebar&changing icon onclick

const menuabout = document.querySelector(".menuabout");
menuabout && menuabout.addEventListener("click", function () {
    expandSidebar();
});
function expandSidebar() {
  document.querySelector("article").classList.toggle("short");
  $('#sidebarClose').toggleClass("no-display")
  $('#sidebarOpen').toggleClass("no-display")
}