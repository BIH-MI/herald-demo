#!/bin/bash

# Trigger compilation
if [ -d "../herald-lang" ] && [ -d "../herald-demo" ]; then
    cd "../herald-lang"
    ./bundling.sh
    cd "../herald-demo"
fi

# Copy compiled files if they exist
if [ -d "../herald-lang/dist" ] && [ -d "./js" ]; then
    echo "Copying files to demo"
    cp -r ../herald-lang/dist/* ./js/
fi