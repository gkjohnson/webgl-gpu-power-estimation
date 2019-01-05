# webgl-gpu-power-estimation

Catering a 3d web-based experience to the power of a target platform is difficult when little information is available about the current graphics hardware. This utility aims to provide performance benchmark, clock speed, and memory information about the current hardware if available by guessing type of hardware using webgl `UNMASKED_RENDERER_WEBGL` parameter.

GPU benchmark and spec information scraped from [videocardbenchmark.net](https://www.videocardbenchmark.net/GPU_mega_page.html) and [techpowerup.com](https://www.techpowerup.com/gpu-specs/).

See your hardware info [here[(https://gkjohnson.github.io/webgl-gpu-power-estimation/example/)!

## Guessing the Graphics Hardware

The values from `UNMASKED_RENDERER_WEBGL` are irregular and relatively unpredictable. To find the corresponding hardware in the database list we

- Check if there is a version number in the current GPU hardware name (assuming the version number includes > 3 digits to filter other unreleated numbers).
- Filter the database of GPUs to those that include that version number (or to those that have no version number if none was found).
- From that list pick the hardware the has the most matching tokens between the names.

## Use

```js
import { getDetailedInfo, getBasicInfo } from 'gpu-power-estimate';
import { database } from 'gpu-power-estimate/database';

const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl');

console.log(getBasicInfo(gl));
console.log(getDetailedInfo(database, gl));
```

### API

#### getBasicInfo(context = null)

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

#### getBasicInfo(database, contextOrCard = null)

Returns more detailed hardware information based on the information in the provided database. The database is expected to be an object where the keys are the names of graphics cards and the values are objects with detail information. A pre-made databased is availabe in the repo at `src/database.js`.

If a WebGL context _or_ card name to search is not provided then a temporary context will be created.

The pre-made database provides the following data. Fields are null if unavailable.
```js
{

  // Name of the GPU
  name,

  // Type of graphics card
  // Workstation, Desktop, Mobile, Unknown
  type,

  // The 3d and 2d performance results as provided by the
  // PassMark g3d and g2d benchmarks
  performance,
  performance2d,

  // thermal design power
  tdp,

  // total available vram in MB
  memory,

  // clock speeds in MHz
  clock,
  memoryClock

}
```

### Caveats

For privacy reasons the availability of the `UNMASKED_RENDERER_WEBGL` parameter may be disabled in which case no estimate can be provided.

## References
- Infomation on the WebGL debug extension
  - https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_debug_renderer_info

- Blog with information about the extension and sampling of possible values
  - http://codeflow.org/entries/2016/feb/10/webgl_debug_renderer_info-extension-survey-results/

## TODO
- Get more `UNMASKED_RENDERER_WEBGL` example data.
- Pull more information from other sources to fill out database
