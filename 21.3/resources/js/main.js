// On-load actions
$(window).on("load", function () {
  $("body").removeClass("preload");
});

function copySnippet(elem) {
  var div = $(elem.parentElement.parentElement);
  text = "";
  div.find("figure").each(function () {
    var currentText = $(this).text();
    text += currentText;
  });
  copyTextToClipboard(text);
}

function copyTextToClipboard(text) {
  var textArea = document.createElement("textarea");

  textArea.style.position = 'fixed';
  textArea.style.top = 0;
  textArea.style.left = 0;
  textArea.style.width = '2em';
  textArea.style.height = '2em';
  textArea.style.padding = 0;
  textArea.style.border = 'none';
  textArea.style.outline = 'none';
  textArea.style.boxShadow = 'none';
  textArea.style.background = 'transparent';
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    // console.log('Copying text command was ' + msg);
  } catch (err) {
    // console.log('Oops, unable to copy');
  }
  document.body.removeChild(textArea);
}

function fiddleSnippet(elem, fileName) {
  elem.onclick = null; // do not call this function on the same elem again
  var className = fileName.match(/([^/]*)\.java$/)[1];
  var div = elem.parentElement.parentElement;
  displayFiddleLoadingMessage(div);
  GraalVMFiddle.replace(div, div._snippets, {className: className});
}

function displayFiddleLoadingMessage(elem) {
  var w = elem.clientWidth;
  var h = elem.clientHeight;
  var outer = document.createElement('div');
  outer.style.position = 'relative';
  var inner = document.createElement('div');
  inner.style.position = 'absolute';
  inner.style.left = (w/4) + 'px';
  inner.style.top = (h/3) + 'px';
  inner.style.width = (w/2) + 'px';
  inner.style.height = (h/3) + 'px';
  inner.style.lineHeight = (h/3) + 'px';
  inner.className = 'fiddle-loading-message';
  inner.appendChild(document.createTextNode('Loading...'));
  outer.appendChild(inner);
  elem.prepend(outer);
}

// Create terminal function 
function createTerminal(serverUrl, containerId, terminalId, uid) {
  var appearDuration = 350;
  var revealDuration = 750;
  var bootTerminalDuration = 750;

  $(containerId).animate({
    padding: "8px",
    opacity: 1.0
  }, appearDuration)

  $(terminalId).animate({
    height: "260px"
  }, revealDuration, function () {
    $(terminalId).terminal(function (command) {
      var shell = this;

      if (command !== "") {
        shell.freeze(true);
        var currentPrompt = shell.get_prompt();
        shell.set_prompt("");
        var escapedLine = encodeURIComponent(command);
        var url = serverUrl + "/send-line?uid=" + uid + "&line=" + escapedLine;
        $.get(url).done(function (data) {
          console.log(data);
          data = JSON.parse(data);
          if (data["language"]) {
            currentPrompt = data["language"] + "> ";
          }
          if (data["error"]) {
            shell.echo(data["error"]);
            if (!data["terminate"]) {
              shell.freeze(false);
              shell.set_prompt(currentPrompt);
            }
          } else {
            console.log(data)
            var output = JSON.parse("\"" + data["output"] + "\"");
            shell.echo(output);
            shell.freeze(false);
            shell.set_prompt(currentPrompt);
          }
        }).fail(function (r) {
          shell.echo("Server error code " + r.status + ": " + r.statusText);
          shell.enable();
        })
      } else {
        shell.echo("");
      }
    }, {
      greetings: "GraalVM Shell (type 'js', 'ruby' or 'R' to switch languages)",
      name: "graalvm_shell",
      height: 240,
      prompt: "js> ",
      onInit: function () {
        var shell = this;
        $(terminalId).click(function () {
          console.log("Focused terminal.");
          shell.focus(true);
        });
        shell.disable();
        shell.enable();
      }
    });

    $(terminalId).animate({
      opacity: 1.0
    }, bootTerminalDuration);
  });
}

function establishSessionAndCreateTerminal(serverUrl) {
  console.log("Establishing shell session with " + serverUrl);
  $.get(serverUrl + "/start-session").done(function (data) {
    console.log(data);
    data = JSON.parse(data);
    if (data["error"]) {
      console.error(data["error"]);
    } else {
      console.log("Starting terminal session...");
      createTerminal(serverUrl, "#terminal-container", "#terminal", data["uid"]);
    }
  }).fail(function (r) {
    console.error(r);
  });
}

$(document).ready(function () {

// Highlightjs init
$('pre code').each(function (i, block) {
  hljs.highlightBlock(block);
});


//Header loading
(document, 'script', 'twitter-wjs');
(function () {
    var topBanner = $('.showcase-banner');
    var header = $('.header');
    var topBannerHeight = topBanner.innerHeight();
    var showed = false;

    $(window).scroll(function () {
      var scrollTop = $(document).scrollTop();

      if (scrollTop > topBannerHeight && !showed) {
        header.addClass('header--filled animated fadeIn');
        showed = true;
      } else if (scrollTop <= topBannerHeight && showed) {
        header.removeClass('header--filled animated fadeIn').addClass('header--filled animated fadeOut');
        setTimeout(function () {
          header.removeClass('header--filled animated fadeOut');
        }, 500);
        showed = false;
      }
    });
  }());

  // Sticky content menu
  (function () {
    var headerHeight = $('.header').innerHeight();
    var sectionHeadingHeight = $('.section-heading').innerHeight();
    var offsetTop = parseInt(headerHeight) + parseInt(sectionHeadingHeight);

    var contentMenuHorixontal = $(".toc-bullets--horizontal");
    var showed = false;

    $(window).scroll(function () {
      var scrollTop = $(document).scrollTop();

      if (scrollTop > offsetTop && !showed) {
        contentMenuHorixontal.addClass('toc-bullets--horizontal-stiky');
        showed = true;
      } else if (scrollTop <= sectionHeadingHeight && showed) {
        contentMenuHorixontal.removeClass('toc-bullets--horizontal-stiky');
        showed = false;
      }
    });
  }());


  // Mobile menu
  if ($('.js-show-menu').length) {
    $(".js-show-menu, .overlay").click(function (e) {
      e.preventDefault();
      $('body').toggleClass('overflow-hidden');
      $(".menu-btn--menu").toggleClass('menu-open').toggleClass('close');
      $('.menu__list').toggleClass('open');
      $('.menu__logo').toggleClass('open');
      $('.menu__downloads').toggleClass('open');
      $('.menu').toggleClass('open');
      $('.overlay').fadeToggle();
    });
  }

  if ($(".js-show-sidebar").length) {
    $(".js-show-sidebar, .overlay").click(function (e) {
      e.preventDefault();
      $('body').toggleClass('overflow-hidden');
      $(".menu-btn--sidebar").toggleClass('menu-open');
      $('.sidebar').toggleClass('open');
      $('.overlay').fadeToggle();
    });
  }

});

// Sticky sidebar
var sidebar = document.querySelector('.sidebar-wrap');

if (sidebar) {
  var stickySidebar = new StickySidebar(sidebar, {
    topSpacing: 74,
    bottomSpacing: 40
  });

  sidebar.addEventListener('affix.container-bottom.stickySidebar', function (event) {
    window.dispatchEvent(new Event('resize'));
  });
}

// Highlight active header menu item
$("a").each(function() {
    if ((window.location.pathname.indexOf($(this).attr('href'))) > -1) {
        $(this).addClass('activeMenuItem');
    }
});

// Copy to clipboard
const copyButtonLabel = "Copy";

// Only add a button if browser supports Clipboard API
if (navigator.clipboard) {

  let blocks = document.querySelectorAll("pre");

  blocks.forEach((block) => {
    let button = document.createElement("button");
    button.innerText = copyButtonLabel;
    button.addEventListener("click", copyCode);
    block.appendChild(button);
  });
}

async function copyCode(event) {
  const button = event.srcElement;
  const pre = button.parentElement;
  let code = pre.querySelector("code");
  let text = code.innerText;
  await navigator.clipboard.writeText(text);

  button.innerText = "Copied";

  setTimeout(() => {
    button.innerText = copyButtonLabel;
  }, 1000)
}

// Highlightjs init
$('pre code').each(function (i, block) {
  hljs.highlightBlock(block);
});

// Redirect to latest documentation version
function selected(val, version) {
   // Get the current URL path and split it
   var pathArray = window.location.pathname.split('/');
   // Remove the current version (for example, "jdk22") from the path
   pathArray[1] = version;
   // Join the path back together and redirect to the new URL
   var newPath = pathArray.join('/');
   
   location = newPath;
}