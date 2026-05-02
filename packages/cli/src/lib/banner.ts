import cfonts from "cfonts";

export function displayBanner(): void {
  const logo = cfonts.render("nvii", {
    font: "block",
    colors: ["yellow"],

    align: "left",
  });

  if (logo) {
    console.log(logo.string);
  }
}
