# webgl-gpu-power-estimation

Catering a 3d web-based experience to the power of a target platform is difficult when little information is available about the current graphics hardware. This utility aims to provide performance benchmark, clock speed, and memory information about the current hardware if available by guessing type of hardware using webgl `UNMASKED_RENDERER_WEBGL` parameter.

GPU benchmark and spec information scraped from https://www.videocardbenchmark.net/GPU_mega_page.html.

## Guessing the Hardware

The values from `UNMASKED_RENDERER_WEBGL` are irregular and relatively unpredictable. To find the corresponding hardware in the database list we

- Check if there is a version number in the current GPU hardware name (assuming the version number includes > 3 digits to filter other unreleated numbers).
- Filter the database of GPUs to those that include that version number (or to those that have no version number if none was found).
- From that list pick the hardware the has the most matching tokens between the names.

## Caveats

For privacy reasons the availability of the `UNMASKED_RENDERER_WEBGL` parameter may be disabled in which no estimate can be provided.

## References
- Infomation on the WebGL debug extension
  - https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_debug_renderer_info
  
- Blog with information about the extension and sampling of possible values
  - http://codeflow.org/entries/2016/feb/10/webgl_debug_renderer_info-extension-survey-results/

## TODO
- Add tests
- Get more `UNMASKED_RENDERER_WEBGL` example data
- Add interface for using a custom database
- Create module and umd formats
