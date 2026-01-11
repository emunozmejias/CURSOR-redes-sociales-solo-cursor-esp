#!/bin/bash
# Script para corregir rutas en todos los servicios

# Función para corregir un archivo
fix_file() {
  local file=$1
  local is_controller=$2
  
  if [ "$is_controller" = "true" ]; then
    # Desde controllers/, necesitamos subir 4 niveles
    sed -i '' "s|require('../../\\.\\./../shared/|require(path.join(path.resolve(__dirname, '../../..'), 'shared/|g" "$file"
    sed -i '' "s|require(\"../../\\.\\./../shared/|require(path.join(path.resolve(__dirname, '../../..'), 'shared/|g" "$file"
    # Agregar require de path si no existe
    if ! grep -q "const path = require('path')" "$file"; then
      sed -i '' '1a\
const path = require('\''path'\'');
' "$file"
    fi
  else
    # Desde src/ o middleware/, necesitamos subir 3 niveles
    sed -i '' "s|require('../../\\.\\./../shared/|require(path.join(path.resolve(__dirname, '../../..'), 'shared/|g" "$file"
    sed -i '' "s|require(\"../../\\.\\./../shared/|require(path.join(path.resolve(__dirname, '../../..'), 'shared/|g" "$file"
    # Agregar require de path si no existe
    if ! grep -q "const path = require('path')" "$file"; then
      sed -i '' '1a\
const path = require('\''path'\'');
' "$file"
    fi
  fi
}

echo "Corrigiendo rutas..."

