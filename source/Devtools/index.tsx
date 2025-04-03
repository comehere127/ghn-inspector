import browser from "webextension-polyfill";

browser.devtools.panels.create(
  "GHN inspector", // Panel name
  "", // Optional icon
  "panel.html", // HTML file to show in the panel
).then(res => {
  console.log({ res });
  console.log("DevTools panel created");
}).catch(error => {
  console.error("Error creating DevTools panel:", error);
});