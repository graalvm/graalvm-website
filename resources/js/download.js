let currentMajorJavaVersion = "22";
let currentPlatform = "empty-choice";
let currentDownloadLink = null;

$(window).on("load", async function () {
  $("body").removeClass("preload");
  await detectPlatform();
  installTabSwitcher();
  changeVersion(currentMajorJavaVersion, currentPlatform);
});

async function detectPlatform() {
  const detectedPlatform = `${getOS()}-${await getCPUArchitecture()}`;
  currentPlatform = platforms[detectedPlatform] ? detectedPlatform : currentPlatform;
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
      } else if (platformInfo.architecture === "x86") {
        return "x64";
      }
    } catch (error) {
    }
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
  "macos-x64": "macOS x64",
  "linux-aarch64": "Linux AArch64",
  "linux-x64": "Linux x64",
  "windows-x64": "Windows x64",
};

const fullJavaVersions = {
  "17": "17.0.12",
  "21": "21.0.4",
  "22": "22.0.2",
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
  $("#dl-snippet-sdkman").text(`sdk install java ${fullJavaVersion}-graal`);
}

function updateScriptFriendlyURLsSnippet(majorJavaVersion, platform, fileExtension) {
  $("#dl-snippet-script-friendly-urls").text(`# Download with wget
wget https://download.oracle.com/graalvm/${majorJavaVersion}/latest/graalvm-jdk-${majorJavaVersion}_${platform}_bin.${fileExtension}

# Download with curl
curl https://download.oracle.com/graalvm/${majorJavaVersion}/latest/graalvm-jdk-${majorJavaVersion}_${platform}_bin.${fileExtension}

# Download from archive
curl https://download.oracle.com/java/${majorJavaVersion}/archive/jdk-${majorJavaVersion}_${platform}_bin.${fileExtension}`);
}

function updateDownloadButton(majorJavaVersion) {
  $("#selector-java-version").html(`Java ${majorJavaVersion}`);
  $("#selector-platform").html(platforms[currentPlatform]);
  if (currentDownloadLink) {
    $("#download-main-btn").attr("href", currentDownloadLink).removeClass("download-inactive").removeClass("btn-secondary");
  } else {
    $("#download-main-btn").attr("href", "#").addClass("download-inactive").addClass("btn-secondary");
  }
}

function changeVersion(majorJavaVersion, platform) {
  currentMajorJavaVersion = majorJavaVersion;
  currentPlatform = platform;
  const fileExtension = platform.indexOf("windows") === 0 ? "zip" : "tar.gz";
  currentDownloadLink = `https://download.oracle.com/graalvm/${majorJavaVersion}/latest/graalvm-jdk-${majorJavaVersion}_${platform}_bin.${fileExtension}`

  updateDownloadButton(majorJavaVersion);
  updateGHASnippet(majorJavaVersion);
  updateContainerSnippet(majorJavaVersion);
  updateSDKMANSnippet(majorJavaVersion);
  updateScriptFriendlyURLsSnippet(majorJavaVersion, platform, fileExtension);
}

function downloadGraalVMJDK() {
  if (!currentDownloadLink) {
    return; // Nothing selected, do not do anything
  }

  // Open download link
  window.open(currentDownloadLink, "_blank");

  // Redirect to success page
  window.location="/downloads-thanks/";
  window.focus();
}
