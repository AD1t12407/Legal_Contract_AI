#!/bin/bash

# Base64 encoded minimal valid PNG (a blue square)
BASE64_PNG_16="iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAAKUlEQVQ4jWNgGAXowP/BwcGMo0aNGgZxAQsjI+P/0aNHj2JiZBwNg+EAAC6BBTmnVXtFAAAAAElFTkSuQmCC"
BASE64_PNG_48="iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAAAPklEQVRoge3PMQEAIAzAMIZ/z0MGRxTQZE8f9UxsAQAAAADwwZ7Smia0p7CntKawp7CnsKewp7CnsKcAAAAA8MIFaD8Fr5qm3c4AAAAASUVORK5CYII="
BASE64_PNG_128="iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAABmJLR0QA/wD/AP+gvaeTAAAAMUlEQVR4nO3BAQ0AAADCoPdPbQ8HFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAL8GFHgAAVu11FUAAAAASUVORK5CYII="

echo $BASE64_PNG_16 | base64 --decode > icon16.png
echo $BASE64_PNG_48 | base64 --decode > icon48.png
echo $BASE64_PNG_128 | base64 --decode > icon128.png

echo "Icons generated successfully" 