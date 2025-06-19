const postCss = require("postcss-scss")

module.exports = {
  plugins: ["stylelint-scss"],
  extends: "stylelint-config-recommended",
  customSyntax: postCss,
  rules: {
    "at-rule-no-unknown": null,
    "scss/at-rule-no-unknown": null,
    "selector-pseudo-class-no-unknown": null,
    "function-linear-gradient-no-nonstandard-direction": null,
    "font-family-no-missing-generic-family-keyword": null,
    "selector-pseudo-element-no-unknown": null,
    "no-descending-specificity": null,
    "function-no-unknown": null,
    "media-query-no-invalid": null,
    "at-rule-empty-line-before": [
      "always",
      {
        except: ["blockless-after-same-name-blockless"],
        ignore: ["after-comment", "first-nested"],
        severity: "warning"
      }
    ],
    "custom-property-empty-line-before": [
      "always",
      {
        except: ["after-custom-property"],
        ignore: ["after-comment", "first-nested", "inside-single-line-block"],
        severity: "warning"
      }
    ],
    "declaration-empty-line-before": [
      "always",
      {
        except: ["after-declaration"],
        ignore: ["after-comment", "first-nested", "inside-single-line-block"],
        severity: "warning"
      }
    ],
    "rule-empty-line-before": [
      "always",
      {
        ignore: ["after-comment", "first-nested"],
        severity: "warning"
      }
    ],
    "scss/load-partial-extension": "always"
  }
}
