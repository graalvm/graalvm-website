let currentMajorJavaVersion = "25";
let currentPlatform = "empty-choice";
let currentDownloadLink = null;

$(window).on("load", async function () {
  $("body").removeClass("preload");
  await detectPlatform();
  installTabSwitcher();

  $("#selector-platform").on("change", function () {
    const selected = $(this).val();
    if (platforms[selected]) {
      currentPlatform = selected;
      changeVersion(currentMajorJavaVersion, selected);
    }
  });

  changeVersion(currentMajorJavaVersion, currentPlatform);
});

async function detectPlatform() {
  const detectedPlatform = `${getOS()}-${await getCPUArchitecture()}`;
  if (platforms[detectedPlatform]) {
    currentPlatform = detectedPlatform;
  } else {
    currentPlatform = "empty-choice";
  }

  updateDownloadButton(currentMajorJavaVersion);
}

function installTabSwitcher() {
  $(".download-tab").click(function () {
		$(".download-tab").removeClass("active");
		$(this).addClass("active");
		const selectedIndex = $(this).index();
		$("#dl-tab-gha").toggle(selectedIndex === 0);
		$("#dl-tab-containers").toggle(selectedIndex === 1);
		$("#dl-tab-sdkman").toggle(selectedIndex === 2);
		$("#dl-tab-script-friendly-urls").toggle(selectedIndex === 3);
		$("#dl-tab-buildpacks").toggle(selectedIndex === 4);
	});
}

function getOS() {
  const userAgent = navigator.userAgent;
  if (userAgent.indexOf("Win") !== -1) {
      return "windows";
  } else if (userAgent.indexOf("Mac") !== -1) {
      return "macos";
  } else if (userAgent.indexOf("Linux") !== -1) {
      return "linux";
  }
  return "Unknown OS";
}

async function getCPUArchitecture() {
  if (navigator.userAgent.indexOf("Mac") !== -1) {
    try {
      const platformInfo = await navigator.userAgentData.getHighEntropyValues(["architecture"]);
      if (platformInfo.architecture === "arm") {
        return "aarch64";
      }
      // x86 macOS - not supported
    } catch (error) {
    }
    // Fallback: assume aarch64 for Mac if detection fails
    return "aarch64";
  }

  const platform = navigator.platform.toLowerCase();
  if (platform.indexOf("win32") !== -1 || platform.indexOf("wow64") !== -1 || platform.indexOf("x86_64") !== -1) {
    return "x64";
  } else if (platform.indexOf("arm") !== -1) {
    return "aarch64";
  }

  return "Unknown Architecture";
}

const platforms = {
  "empty-choice": "Choose a platform",
  "macos-aarch64": "macOS M1/AArch64",
  "linux-aarch64": "Linux AArch64",
  "linux-x64": "Linux x64",
  "windows-x64": "Windows x64",
};

const fullJavaVersions = {
  "17": "17.0.12",
  "21": "21.0.10",
  "25": "25.0.2",
}

function updateGHASnippet(majorJavaVersion) {
  $("#dl-snippet-gha").text(`- uses: graalvm/setup-graalvm@v1
  with:
    java-version: '${majorJavaVersion}'
    distribution: 'graalvm'
    github-token: \$\{\{ secrets.GITHUB_TOKEN \}\}`);
}

function updateContainerSnippet(majorJavaVersion) {
  $("#dl-snippet-containers").text(`# GraalVM JDK with Native Image
docker pull container-registry.oracle.com/graalvm/native-image:${majorJavaVersion}

# GraalVM JDK without Native Image
docker pull container-registry.oracle.com/graalvm/jdk:${majorJavaVersion}`);
}

function updateSDKMANSnippet(majorJavaVersion) {
  const fullJavaVersion = fullJavaVersions[majorJavaVersion];
  // const comment = majorJavaVersion === "25" ? ' <span class="no-strip"># coming soon</span>' : '';
  $("#dl-snippet-sdkman").html(`sdk install java ${majorJavaVersion}-graal`);
}

function updateScriptFriendlyURLsSnippet(majorJavaVersion, platform, fileExtension) {
  $("#dl-snippet-script-friendly-urls").text(`# Download with wget
wget https://download.oracle.com/graalvm/${majorJavaVersion}/latest/graalvm-jdk-${majorJavaVersion}_${platform}_bin.${fileExtension}

# Download with curl
curl https://download.oracle.com/graalvm/${majorJavaVersion}/latest/graalvm-jdk-${majorJavaVersion}_${platform}_bin.${fileExtension}

# Download from archive
curl https://download.oracle.com/graalvm/${majorJavaVersion}/archive/graalvm-jdk-${majorJavaVersion}_${platform}_bin.${fileExtension}`);
}


function updateDownloadButton(majorJavaVersion) {
  let versionLabel = '';
  if (majorJavaVersion === "25") {
    versionLabel = "GraalVM 25";
  } else if (majorJavaVersion === "21") {
    versionLabel = "GraalVM for JDK 21";
  } else if (majorJavaVersion === "17") {
    versionLabel = "GraalVM for JDK 17";
  } else {
    versionLabel = `Java ${majorJavaVersion}`;
  }
  $("#selector-java-version").html(versionLabel);
  $("#selector-platform").html(platforms[currentPlatform])
  .toggleClass("dropdown--empty", currentPlatform === "empty-choice")
  .attr("aria-invalid", currentPlatform === "empty-choice" ? "true" : "false");

  const isValid = currentPlatform !== "empty-choice";

  if (isValid) {
    const fileExtension = currentPlatform.indexOf("windows") === 0 ? "zip" : "tar.gz";
    currentDownloadLink = `https://download.oracle.com/graalvm/${majorJavaVersion}/latest/graalvm-jdk-${majorJavaVersion}_${currentPlatform}_bin.${fileExtension}`;

    $("#download-main-btn")
      .attr("href", currentDownloadLink)
      .removeClass("download-inactive btn-secondary");
  } else {
    currentDownloadLink = null;
    $("#download-main-btn")
      .attr("href", "#")
      .addClass("download-inactive btn-secondary");
  }
}


function toggleJDK17Banner(majorJavaVersion) {
  const jdk17Banner = document.getElementById("jdk17-banner");
  const allJdkBanner = document.getElementById("all-jdk-banner");
  const optionTabs = document.querySelector(".downloads__option-tabs");

  if (majorJavaVersion === "17") {
    jdk17Banner.style.display = "block";
    allJdkBanner.style.display = "block";
    setTimeout(() => {
      jdk17Banner.classList.add("visible");
      allJdkBanner.classList.add("visible");
    }, 10);
    optionTabs.style.display = "none";
  } else {
    jdk17Banner.classList.remove("visible");
    jdk17Banner.style.display = "none";
    allJdkBanner.style.display = "block";
    setTimeout(() => allJdkBanner.classList.add("visible"), 10);
    optionTabs.style.display = "";
  }
}

function toggleInteractivityForJava17(majorJavaVersion) {
  const platformSelector = document.getElementById("selector-platform");
  const downloadButton = document.getElementById("download-main-btn");

  if (majorJavaVersion === "17") {
    platformSelector.disabled = true;
    platformSelector.classList.add("disabled");
  } else {
    platformSelector.disabled = false;
    platformSelector.classList.remove("disabled");
  }
}

function changeVersion(majorJavaVersion, platform) {
  currentMajorJavaVersion = majorJavaVersion;
  currentPlatform = platform;
  const fileExtension = platform.indexOf("windows") === 0 ? "zip" : "tar.gz";
  currentDownloadLink = `https://download.oracle.com/graalvm/${majorJavaVersion}/latest/graalvm-jdk-${majorJavaVersion}_${platform}_bin.${fileExtension}`;

  updateDownloadButton(majorJavaVersion);
  updateGHASnippet(majorJavaVersion);
  updateContainerSnippet(majorJavaVersion);
  updateSDKMANSnippet(majorJavaVersion);
  updateScriptFriendlyURLsSnippet(majorJavaVersion, platform, fileExtension);

  toggleJDK17Banner(majorJavaVersion);
  toggleInteractivityForJava17(majorJavaVersion);
}


function downloadGraalVMJDK() {
  // Special handling for Java 17 - redirect to Oracle support
  if (currentMajorJavaVersion === "17") {
    window.open("https://www.oracle.com/downloads/graalvm-downloads.html", "_blank");
    return;
  }

  if (!currentDownloadLink) {
    return;
  }

  window.open(currentDownloadLink, "_blank");

  // Redirect to success page
  window.location="/downloads-thanks/";
  window.focus();
}