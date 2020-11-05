# webgl-gpu-power-estimation

Catering a 3d web-based experience to the power of a target platform is difficult with such a small amount of information available about the current graphics hardware. This utility aims to provide performance information about the current hardware by guessing the type of graphics hardware using webgl `UNMASKED_RENDERER_WEBGL` parameter and looking it up in a provided list of hardware.

See your hardware info [here](https://gkjohnson.github.io/webgl-gpu-power-estimation/example/)!

## Example Data Information

Data used in the example is for demonstration purposes. See the [webgl-gpu-power-estimation-data](https://github.com/gkjohnson/webgl-gpu-power-estimation-data/) repo for more information.

## Matching the Graphics Hardware Name

The values from `UNMASKED_RENDERER_WEBGL` are irregular and relatively unpredictable. To find the corresponding hardware in the database list we

- Check if there is a version number in the current GPU hardware name.
- Filter the database of GPUs to those that include that version number (or to those that have no version number if none was found).
- From that list pick the hardware the has the most matching tokens between the names.

## Installation

The package can be installed using npm via the Github repo by adding this to the package.json dependencies. See [here] for more information.

```js
"webgl-gpu-power-estimation": "gkjohnson/webgl-gpu-power-estimation@<release>"
```

## Use

```js
import { getDetailedInfo, getBasicInfo } from 'gpu-power-estimate';

fetch( './path/to/database.json' )
  .then( res => res.json() )
  .then( database => {

    // get the hardware information
    const canvas = document.createElement( 'canvas' );
    const gl = canvas.getContext( 'webgl' );
    const basicInfo = getBasicInfo( gl );
    const detailedInfo = getDetailedInfo( database, gl );

    // scale the application
    const capability = detailedInfo ? detailedInfo.performance : 0;
    if ( capability > 6000 ) {

      // initialize highest fidelity scene

    } else if ( capability > 3000 ) {

      // initialize moderately complex scene

    } else {

      // initialize simplified scene

    }

  } );

```

## API

### getBasicInfo
```js
getBasicInfo( context = null : WebGLContext ) : Object | null
```

Returns some basic info about the hardware based on the `WEBGL_debug_renderer_info` extension or `null` if it's unavailable.

If the context is not provided then a temporary one will be created.

```js
{
  // The full graphics hardware
  name,

  // A guess as to whether or not the hardware is integrated graphics
  integrated,

  // The raw unmasked fields returned from the extension
  unmasked: { vendor, renderer }

}
```

### getDetailedInfo

```js
getDetailedInfo(
  database : Object,
  contextOrCard = null : WebGLContext | string
) : Object | null
```

Returns more detailed hardware information based on the information in the provided database. The database is expected to be an object where the keys are the names of graphics hardware and the values are objects with detail information.

The `database` argument is expected to be an object with GPU names as key entries and an object of detailed information as a result. The value of the closest matching key will be returned.

If a WebGL context _or_ card name to search is not provided then a temporary context will be created.

### Caveats

For privacy reasons the availability of the `UNMASKED_RENDERER_WEBGL` parameter may be disabled in which case no estimate can be provided.

## References
- Infomation on the WebGL debug extension
  - https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_debug_renderer_info

- Blog with information about the extension and sampling of possible values
  - http://codeflow.org/entries/2016/feb/10/webgl_debug_renderer_info-extension-survey-results/

