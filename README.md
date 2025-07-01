# Wavix Embeddable

Wavix Embeddable is a ready-to-use web phone you can embed in any web app, like a CRM or Support portal.

## Prerequisites

### Create an account

Skip this step if you already have an active account with Wavix.

Before you can use the Wavix Embeddable, sign up for a Wavix account:

1. Go to [https://wavix.com/](https://wavix.com/).
2. Register your email address.
3. Check your email inbox for the activation message.
4. Follow the link in the email to activate your account.

After a Wavix sales rep approves your account, select the **Flex Pro** account level to use the Wavix Embeddable.

> **Note:** The Wavix Embeddable is exclusively available for Flex Pro users.

### Get your API key

Wavix Embeddable uses API keys to authenticate with the Wavix APIs. To get your API key:

1. Sign in to your Wavix account at [https://app.wavix.com](https://app.wavix.com).
2. Go to **Administration > API keys**.

You'll see a list of your account's API keys.

## Before you start

To make or receive calls, you need:

- An active phone number
- A SIP trunk on Wavix

## Buy a phone number

### Using GUI

To buy a number:

1. Sign in to your Wavix account.
2. Select **Numbers & trunks > Buy**.
3. Select a country and region.
4. Choose one or more numbers and click **Buy now**.

You’ll be redirected to the Cart to complete the purchase.

> **Note:** Some numbers may require proof of local address and other documents before activation.
> Upload the requested documents and wait for the Wavix provisioning team to approve them.

### Using API

To buy numbers through the API, follow the guide at
[https://wavix.com/api#/rest/voice/did-numbers/buy-dids](https://wavix.com/api#/rest/voice/did-numbers/buy-dids).

## Create a SIP trunk

### Using GUI

To create a new SIP trunk:

1. Go to **Numbers & trunks > Trunks**.
2. Click **Create new**.
3. Choose the **Digest** authentication method and enter a strong trunk password.
4. Enter the trunk name and select a Caller ID.
5. (Optional) Set limits for outbound call duration, simultaneous calls, and call costs.
6. Click **Save**.

The new SIP trunk will appear on your SIP trunk list.

### Using API

To set up SIP trunks via the API, follow the guide at
[https://wavix.com/api#/rest/voice/sip-trunks](https://wavix.com/api#/rest/voice/sip-trunks).

## Configure inbound call routing

### Using GUI

For inbound calls to be routed to your Wavix Embeddable instance, follow these steps:

1. Sign in to your Wavix account.
2. Go to **Numbers & trunks > My numbers**.
3. Select the three dots next to the number you want to update, then choose **Edit number**.
4. In the **Destination** section, select the created SIP trunk and click **Add**.
5. Click **Save**.

To update multiple numbers:

1. Select the numbers.
2. Click **Bulk actions**.

### Using API

To configure inbound call routing using the Wavix API, follow the guide at
[https://wavix.com/api#/rest/voice/did-numbers/update-did-destination](https://wavix.com/api#/rest/voice/did-numbers/update-did-destination).

## Install the Wavix Embeddable

You can install Wavix embeddable as either:

- As a single-page application (SPA)
- As a dialog window

### Install as an SPA

Paste the following code into your web app’s `<head>` section.

```html
<script src="https://api.wavix.com/webrtc/v2.0.0/widget.js" type="module"></script>
<script>
  ;(() => {
    const initWidget = () => {
      wavixWebRTC.init({
        widget: {
          containerId: "webrtc-widget",
          customStyles: "",
          customLogo: "",
          customLink: "",
          withLogo: false
        },
        sip: {
          server: "WAVIX_SIP_PROXY",
          token: "WIDGET_TOKEN",
          autoDial: false
        }
      })
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initWidget)
    } else {
      initWidget()
    }
  })()
</script>
```

Add the following HTML snippet to the webpage where you want the widget to appear.

```html
<div id="webrtc-widget" />
```

### Install as a dialog window

Paste the following code into your web app’s `<head>` section.

```html
<script src="https://api.wavix.com/webrtc/v2.0.0/widget.js" type="module"></script>

<script>
  ;(() => {
    let configToken

    const initWidget = async () => {
      configToken = await wavixWebRTC.init({
        widget: {
          windowTitle: "WIDGET_TITLE",
          customStyles: "",
          customLogo: "",
          customLink: "",
          withLogo: false
        },
        sip: {
          server: "WAVIX_SIP_PROXY",
          token: "WIDGET_TOKEN",
          autoDial: false
        }
      })
    }

    const openWidgetWindow = async to => {
      if (!configToken) {
        await initWidget()
      }

      const width = window_width
      const height = window_height

      const top = window.screen.height - height - 50
      const left = window.screen.width - width - 50

      const params = `width=${width}, height=${height}, top=${top}, left=${left}, resizable=no, scrollbars=no, status=yes`
      const urlParams = `config_token=${configToken}${to ? `&to=${to}` : ""}`

      wavixWebRTC.widgetWindowLink = window.open(
        `https://api.wavix.com/webrtc/v2.0.0/widget.html?${urlParams}`,
        null,
        params
      )
    }

    window.openWidgetWindow = openWidgetWindow
  })()
</script>
```

Replace `window_width` and `window_height` with the desired dimensions. The recommended width is `264`, and the height is `460`.

Replace `WIDGET_TITLE` with the text to be shown in the dialog window title.

## Launch the Wavix Embeddable

To place or receive calls via the widget, you need to:

1. Generate the widget token.
2. Choose a primary Wavix SIP Gateway.
3. Launch the widget.

### Generate the widget token

To generate the widget authentication token, make a `POST` request to:

```
https://api.wavix.com/v2/webrtc/tokens?appid=API_KEY
```

Paste the following JSON into the request body:

```json
{
  "sip_trunk": "YOUR_SIP_TRUNK",
  "payload": {},
  "ttl": "WIDGET_ACTIVITY_TIME"
}
```

Where:

- `API_KEY` - an API key on your account.
- `YOUR_SIP_TRUNK` – the SIP trunk ID that will be associated with the widget.
- `WIDGET_ACTIVITY_TIME` – time, in seconds, for how long the widget session lasts.

You can associate a payload with the widget – a JSON object with arbitrary data. The payload can include an agent’s details or other relevant information.

If successful, Wavix returns the **HTTP 201 Created** status code. The response body will contain the following details:

```json
{
  "token": "WIDGET_TOKEN",
  "uuid": "TOKEN_ID",
  "sip_trunk": "SIP trunk ID",
  "payload": {},
  "ttl": "WIDGET_ACTIVITY_TIME"
}
```

Where:

- `token`: Use this to authenticate your widget.
- `uuid`: The token’s unique ID. You can manipulate your token using its unique ID.
- `sip_trunk`, `payload`, `ttl`: Echo your request data.

### Choose a primary Wavix SIP Gateway

Select the SIP gateway with the lowest ping from your location. See the full list of the Wavix regional gateways at the bottom of the page [https://app.wavix.com/trunks](https://app.wavix.com/trunks)

### Launch the widget

If the Wavix Embeddable is installed as a single-page application (SPA), it opens automatically when a webpage with the widget loads.

If you install the Wavix Embeddable as a dialog, add the following JavaScript onclick event handler to open the widget. You can optionally specify a destination number.

```html
<button onclick="javascript: openWidgetWindow(to)">Call</button>
```

## Customize the Wavix Embeddable

You can customize the Wavix Embeddable styles and branding when initializing it.

```html
<script src="https://api.wavix.com/webrtc/v2.0.0/widget.js" type="module"></script>

<script>
  ;(() => {
    const initWidget = () => {
      wavixWebRTC.init({
        widget: {
          customStyles: "", // URL to your custom CSS
          customLogo: "",   // URL to your logo SVG
          customLink: "",   // Link when logo is clicked
          withLogo: false,  // Set to false to hide logo
        },
        sip: {...},
      })
    }
    ...
  })()
</script>
```

## Widget customization

You can configure the following properties to customize the widget's look and feel:

| Property     | Description                                                |
| ------------ | ---------------------------------------------------------- |
| customStyles | Absolute URL to a CSS file that defines your custom theme. |
| customLogo   | Absolute URL to an SVG logo shown in the widget.           |
| customLink   | URL to open when a user clicks the logo.                   |
| withLogo     | Set to false to hide the logo. The default is true.        |

## Custom CSS file structure

In your CSS file (linked via `customStyles`), define style variables inside the `#webrtc-widget` selection. These variables control colors and component styling of the widget. Only override the variables you need. Any unspecified variable will fall back to the default value.

An example of a custom CSS file with the widget’s dark theme:

```css
#webrtc-widget {
  /* text */
  --text-high-contrast: #fff;
  --text-medium-contrast: #d0d5dd;
  --text-low-contrast: #667085;
  --text-accent: #d4efdf;
  --text-inverted: #fff;
  --text-negative: #ff5655;

  /* background */
  --bg-background: #292d33;
  --bg-header: #292d33;
  --bg-navigation: #292d33;
  --bg-status: #333842;
  --bg-brand: #333842;
  --bg-border: #333842;

  /* foreground */
  --fg-high-contrast: #667085;
  --fg-accent: #22aa5c;
  --fg-negative: #ff5655;
  --fg-warning: #e7b006;
  --fg-brand: #34c1ca;
  --fg-inverted: #fff;
  --fg-logo: #fff;

  /* actions */
  --a-high-contrast: #fff;
  --a-active: #22aa5c;
  --a-inactive: #667085;

  /* text states */
  --text-inverted-disabled: #98a2b3;

  /* background states */
  --bg-hover: #333842;
  --bg-pressed: #333842;
  --bg-border-active: #22aa5c;

  /* foreground states */
  --fg-accent-hover: #289c5c;
  --fg-accent-pressed: #2c7351;
  --fg-accent-disabled: #333842;
  --fg-negative-hover: #e52625;
  --fg-negative-pressed: #b61f1e;
  --fg-negative-disabled: #333842;
  --fg-high-contrast-hover: #333842;
  --fg-high-contrast-pressed: #333842;
  --fg-high-contrast-disabled: #333842;
  --fg-inverted-disabled: #98a2b3;

  /* actions states */
  --a-hover: #98a2b3;
  --a-pressed: #fff;
  --a-disabled: #333842;

  /* components */
  --switch-background: #333842;
  --switch-background-checked: #22aa5c;
  --switch-foreground: #fff;
}
```

---

## Widget authentication token management

### Create a new authentication token

To generate a new widget authentication token, send a `POST` request to the endpoint:

```
https://api.wavix.com/v2/webrtc/tokens?appid=your_api_key
```

Paste the following JSON into the request body:

```json
{
  "sip_trunk": "SIP_TRUNK_ID",
  "payload": {},
  "ttl": "WIDGET_ACTIVITY_TIME"
}
```

Where:

- `your_api_key` — Your Wavix API key.
- `SIP_TRUNK_ID` — The SIP trunk ID associated with the widget.
- `payload` — A JSON object with optional metadata, such as an agent’s details.
- `WIDGET_ACTIVITY_TIME` — Time for how long the widget stays active, in seconds.

If successful, Wavix returns the **HTTP 201 Created** status code. The response body will contain the following details:

```json
{
  "token": "WIDGET_TOKEN",
  "uuid": "TOKEN_ID",
  "sip_trunk": "SIP trunk ID",
  "payload": {},
  "ttl": "WIDGET_ACTIVITY_TIME"
}
```

Where:

- `token` — Authentication token for the widget.
- `uuid` — The token’s unique ID. You can manipulate your token using its unique ID.
- `sip_trunk`, `payload`, `ttl` — Echo your request data.

### Get a list of active authentication tokens

To get a list of active tokens, send a `GET` request to:

```
https://api.wavix.com/v2/webrtc/tokens/?appid=your_api_key
```

Where:

- `your_api_key` — Your Wavix API key.

> **Note:** A token is considered active if it hasn’t expired or been deleted.

If successful, Wavix returns the **HTTP 200** status code. The response body contains a list of active authentication tokens:

```json
[
  {
    "uuid": "Unique token ID",
    "sip_trunk": "SIP trunk ID",
    "payload": {},
    "ttl": "WIDGET_ACTIVITY_TIME"
  }
]
```

### Get a specific authentication token

To retrieve a specific token, send a `GET` request to:

```
https://api.wavix.com/v2/webrtc/tokens/{token_id}/?appid=your_api_key
```

Where:

- `your_api_key` — Your Wavix API key.
- `token_id` — The unique ID of the authentication token.

> **Note:** A token is considered active if it hasn’t expired or been deleted.

If successful, Wavix returns the **HTTP 200** status code. The response body contains the authentication token:

```json
{
  "uuid": "Unique token ID",
  "sip_trunk": "SIP trunk ID",
  "payload": {},
  "ttl": "WIDGET_ACTIVITY_TIME"
}
```

### Update an authentication token’s payload

To replace a token’s payload, send a `PUT` request to:

```
https://api.wavix.com/v2/webrtc/tokens/{token_id}/?appid=your_api_key
```

Where:

- `your_api_key` — Your Wavix API key.
- `token_id` — An authentication token unique identifier.

Paste the following JSON into the request body:

```json
{
  "payload": {}
}
```

> **Important:** This method replaces the payload and does not append to it.

### Delete an authentication token

To remove an authentication token, send a `DELETE` request to:

```
https://api.wavix.com/v2/webrtc/tokens/{token_id}?appid=your_api_key
```

Where:

- `your_api_key` — Your Wavix API key.
- `token_id` — The token’s unique ID.

> **Important:** Deleting the authentication token automatically disconnects the widget. An agent will not be able to place or receive calls.

If successful, Wavix returns the **HTTP 200** status code. The response body will indicate a successful request:

```json
{
  "success": true
}
```

### Support and Contact
If you have questions or run into issues with the widget, [open an issue](https://github.com/Wavix/wavix-embeddable/issues).
For direct support, contact support@wavix.com.

### License
This widget is distributed under the MIT License. See [LICENSE](https://github.com/Wavix/wavix-embeddable/blob/main/LICENSE) for more detailed information.