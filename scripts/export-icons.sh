#!/bin/bash

# todo: centralize primary color
npx svgexport $1 $2/icon-16.png 3:3:19:19 16: "svg{fill:#87A9CC}"
npx svgexport $1 $2/icon-32.png 3:3:19:19 32: "svg{fill:#87A9CC}"
npx svgexport $1 $2/icon-48.png 3:3:19:19 48: "svg{fill:#87A9CC}"
npx svgexport $1 $2/icon-128.png 3:3:19:19 128: "svg{fill:#87A9CC}"