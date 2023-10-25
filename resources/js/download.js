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

  if (platform.indexOf("win64") !== -1 || platform.indexOf("wow64") !== -1 || platform.indexOf("x86_64") !== -1) {
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

  '21_macOS_ARM': "https://download.oracle.com/graalvm/21/latest/graalvm-jdk-21_macos-aarch64_bin.tar.gz",
  '21_macOS_x64': "https://download.oracle.com/graalvm/21/latest/graalvm-jdk-21_macos-x64_bin.tar.gz",
  '21_Linux_ARM': "https://download.oracle.com/graalvm/21/latest/graalvm-jdk-21_linux-aarch64_bin.tar.gz",
  '21_Linux_x64': "https://download.oracle.com/graalvm/21/latest/graalvm-jdk-21_linux-x64_bin.tar.gz",
  '21_Windows_x64': "https://download.oracle.com/graalvm/21/latest/graalvm-jdk-21_windows-x64_bin.zip"

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
  '21': "Java 21"
};

let currentJavaType = '21';
let currentOsType = osTypes[currentOS + '_' + cpuArchitecture] ? currentOS + '_' + cpuArchitecture : 'empty_choice';
let currentDownloadLink = null;

function changeVersion(javaType, osType) {

  let fullVersionText='';
  if (javaType === '21') {
    fullVersionText = '21.0.1'
  } else if (javaType === '17') {
    fullVersionText = '17.0.9'
  }
  const sdkCommand = `sdk install java ${fullVersionText}-graal`

  $('#sdk_command').text(sdkCommand);

  currentDownloadLink = downloadLinks[javaType + '_' + osType];
  currentJavaType = javaType;
  currentOsType = osType;

  $('#selector-java-version').html(javaTypes[javaType]);
  $('#selector-os-version').html(osTypes[osType]);
  if (currentDownloadLink) {
    $('#download-main-btn').attr("href", currentDownloadLink).removeClass('download-inactive').removeClass('btn-secondary');
  } else {
    $('#download-main-btn').attr("href", "#").addClass('download-inactive').addClass('btn-secondary');
  }
}

// function changeVersion(javaType, osType) {

//   let fullVersionText='';
//   if (javaType === '21') {
//     fullVersionText = '21.35'
//     $("div.sdk__text").css("display", "none").css("overflow", "hidden");
//     $("div.sdk__snippet").css("display", "none").css("overflow", "hidden");
//   } else if (javaType === '17') {
//     fullVersionText = '17.0.8'
//     $("div.sdk__text").css("display", "block");
//     $("div.sdk__snippet").css("display", "flex");
//     $("div.sdk__snippet").addClass("sdk__snippet");
//   }
//   const sdkCommand = `sdk install java ${fullVersionText}-graal`

//   $('#sdk_command').text(sdkCommand);

//   currentDownloadLink = downloadLinks[javaType + '_' + osType];
//   currentJavaType = javaType;
//   currentOsType = osType;

//   $('#selector-java-version').html(javaTypes[javaType]);
//   $('#selector-os-version').html(osTypes[osType]);
//   if (currentDownloadLink) {
//     $('#download-main-btn').attr("href", currentDownloadLink).removeClass('download-inactive').removeClass('btn-secondary');
//   } else {
//     $('#download-main-btn').attr("href", "#").addClass('download-inactive').addClass('btn-secondary');
//   }
// }

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