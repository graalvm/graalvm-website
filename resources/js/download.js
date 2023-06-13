// On-load actions
$(window).on("load", function () {
  $("body").removeClass("preload");
  changeVersion(currentJavaType, currentOsType);
});

// Download Oracle GraalVM JDK Scripts
function getOS() {
  const userAgent = navigator.userAgent;
  let os = "Unknown OS";

  if (userAgent.indexOf("Win") !== -1) {
      os = "Windows";
  } else if (userAgent.indexOf("Mac") !== -1) {
      os = "macOS";
  } else if (userAgent.indexOf("Linux") !== -1) {
      os = "Linux";
  }

  return os;
}
  
const currentOS = getOS();

function getCPUArchitecture() {
  const platform = navigator.platform.toLowerCase();
  let architecture = "Unknown Architecture";

  if (platform.indexOf("win64") !== -1 || platform.indexOf("wow64") !== -1 || platform.indexOf("macintel") !== -1 || platform.indexOf("x86_64") !== -1) {
      architecture = "x64";
  } else if (platform.indexOf("arm") !== -1) {
      architecture = "ARM";
  }

  return architecture;
}

const cpuArchitecture = getCPUArchitecture();

const downloadLinks = {
  '17_macOS_ARM': "https://download.oracle.com/graalvm/17/latest/graalvm-jdk-17_macos-aarch64_bin.tar.gz",
  '17_macOS_x64': "https://download.oracle.com/graalvm/17/latest/graalvm-jdk-17_macos-x64_bin.tar.gz",
  '17_Linux_ARM': "https://download.oracle.com/graalvm/17/latest/graalvm-jdk-17_linux-aarch64_bin.tar.gz",
  '17_Linux_x64': "https://download.oracle.com/graalvm/17/latest/graalvm-jdk-17_linux-x64_bin.tar.gz",
  '17_Windows_x64': "https://download.oracle.com/graalvm/17/latest/graalvm-jdk-17_windows-x64_bin.zip",

  '20_macOS_ARM': "https://download.oracle.com/graalvm/20/latest/graalvm-jdk-20_macos-aarch64_bin.tar.gz",
  '20_macOS_x64': "https://download.oracle.com/graalvm/20/latest/graalvm-jdk-20_macos-x64_bin.tar.gz",
  '20_Linux_ARM': "https://download.oracle.com/graalvm/20/latest/graalvm-jdk-20_linux-aarch64_bin.tar.gz",
  '20_Linux_x64': "https://download.oracle.com/graalvm/20/latest/graalvm-jdk-20_linux-x64_bin.tar.gz",
  '20_Windows_x64': "https://download.oracle.com/graalvm/20/latest/graalvm-jdk-20_windows-x64_bin.zip"
};

const osTypes = {
  'empty_choice': "Choose a platform",
  'macOS_ARM': "macOS (AArch64)",
  'macOS_x64': "macOS (x64)",
  'Linux_ARM': "Linux (AArch64)",
  'Linux_x64': "Linux (x64)",
  'Windows_x64': "Windows (x64)"
};

const javaTypes = {
  '17': "Java 17",
  '20': "Java 20"
};

let currentJavaType = '20';
let currentOsType = osTypes[currentOS + '_' + cpuArchitecture] ? currentOS + '_' + cpuArchitecture : 'empty_choice';
let currentDownloadLink = null;

function changeVersion(javaType, osType) {
  currentDownloadLink = downloadLinks[javaType + '_' + osType];
  currentJavaType = javaType;
  currentOsType = osType;

  $('#selector-java-version').html(javaTypes[javaType]);
  $('#selector-os-version').html(osTypes[osType]);
  if (currentDownloadLink) {
    $('#download-main-btn').attr("href", currentDownloadLink).removeClass('btn-secondary');
  } else {
    $('#download-main-btn').attr("href", "#").addClass('download-inactive');
  }
}

function downloadGraalVMJDK() {
  if (!currentDownloadLink) {
    return; // Nothing selected, do not do anything
  }

  // Open download link
  window.open(currentDownloadLink, '_blank');

  // Redirect to success page
  window.location="/downloads-thanks/";
  window.focus();
}