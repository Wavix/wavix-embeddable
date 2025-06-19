export const getWidgetPath = () => {
  const apiDomain = window.location.origin

  return apiDomain.includes("localhost")
    ? apiDomain
    : `${import.meta.env.VITE_WIDGET_URI}/v${import.meta.env.PACKAGE_VERSION}`
}

export const injectFonts = async () => {
  const url = getWidgetPath()

  const currentFonts = document.querySelector("style[data-fonts]")

  if (currentFonts) {
    currentFonts.remove()
  }

  const newFonts = document.createElement("style")
  newFonts.setAttribute("data-fonts", "true")

  newFonts.innerHTML = `
  @font-face {
    font-family: "HelveticaNeue";
    src: url(${url}/fonts/HelveticaNeue-Roman.otf);
    font-weight: normal;
    font-style: normal;
    font-display: swap;
  }
  @font-face {
    font-family: "HelveticaNeue";
    src: url(${url}/fonts/HelveticaNeue-Roman.otf);
    font-weight: 100;
    font-style: normal;
    font-display: swap;
  }
  @font-face {
    font-family: "HelveticaNeue";
    src: url(${url}/fonts/HelveticaNeue-Roman.otf);
    font-weight: 200;
    font-style: normal;
    font-display: swap;
  }
  @font-face {
    font-family: "HelveticaNeue";
    src: url(${url}/fonts/HelveticaNeue-Light.otf);
    font-weight: 300;
    font-style: normal;
    font-display: swap;
  }
  @font-face {
    font-family: "HelveticaNeue";
    src: url(${url}/fonts/HelveticaNeue-Roman.otf);
    font-weight: 400;
    font-style: normal;
    font-display: swap;
  }
  @font-face {
    font-family: "HelveticaNeue";
    src: url(${url}/fonts/HelveticaNeue-Medium.otf);
    font-weight: 500;
    font-style: normal;
    font-display: swap;
  }

  @font-face {
    font-family: "HelveticaNeue";
    src: url(${url}/fonts/HelveticaNeue-Bold.otf);
    font-weight: 600;
    font-style: normal;
    font-display: swap;
  }
`

  document.head.appendChild(newFonts)
  await document.fonts.ready
}
