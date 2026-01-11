
PASO 1

Cree el directorio: /Users/elizabethmunoz/GIT-REPOS/cursor-redes-sociales-solo-cursor-esp

luego cree una aplicacion base next.js dentro de ese directorio: npx create-next-app .

luego conecte las fuentes con un repo git: https://github.com/emunozmejias/CURSOR-redes-sociales-solo-cursor-esp.git

en terminal de curso indico nvm use 20.19.6

pruebo: npm run dev

PASO 2

PROMPT:

Crea archivo .cursorrules para este proyecto

PROMPT:

Crea una componente react en este proyecto para que se convierta en una aplicación de redes sociales con las siguientes características:

Navegación por pestañas a diferentes rutas: Inicio, Perfil y Crear publicación.
Perfiles de usuario con información personalizable.
Posibilidad de crear publicaciones con texto e imágenes.
Un feed de inicio para mostrar las publicaciones de todos los usuarios.
Función para dar "me gusta" y comentar en las publicaciones.
Crea un header y un footer para la componente.


PROMPT:

Mueve el codigo de este proyecto a una carpeta llamada frontend en la raiz del proyecto. Tambien crea una carpeta llamada backend en la raiz del proyecto y elimina la carpeta node_modules de la raiz del proyecto.


PROMPT:

Explicame paso a paso como puedo crear en la carpeta backend un backend de microservicios usando node.js y express.js que ademas maneje un API Gateway para las funcionalidades que estan en el frontend. Para la persistencia de los datos y para el registro y login de usuarios explicame como puedo usar una base de datos postgres en https://neon.tech/. 

(Esto creo el archivo backend/README.md con los pasos de creación del backend)


PROMPT: 

Quiero que implementes uno a uno cada uno de los pasos descritos en el documento bacend/README.md pero antes de avanzar al paso siguiente realiza una verificación del paso y espera mi confirmación. Durante todo este proceso no sobreescribas el archivo backend/README.md

1. Configuración de Neon.tech
2. Arquitectura de microservicios
3. Configurar el Workspace
4. Conexión a PostgreSQL 

(Aqui le digo en un prompt de cursor que genere uan configuracion centralizada para los servicios)

PROMPT:
como puedo centralizar la configuracion de los servicios, incluida la variable DATABASE_URL usando un backend/shared ?

5. Crear Auth Service
6. Crear API Gateway
7. crear los otros tres microservicios (Users, Posts y Comments)
8. Inicializar la Base de Datos
9. Ejecutar el Backend
10. Ejecute pruebas de backend

(creo el archivo backend/test-api.sh)


PROMPT:

ahora explicame como puedo probar el frontend con el backend

(Hago un commit a git)

PROMPT:

Corrige la pagina de Perfil por que no se ven las publicaciones del usuario que inicio sesion 

PROMPT:
Por que en el frontend  al recargar la pagina desde el browser se cambia el usuario que hizo login a un usuario por defecto @Usuario ?

PROMPT:

Agregar en la pagina de Perfil las funcionalidades para editar y eliminar publicaciones. Modifica el frontend y el backend si es necesario para estas nuevas funcionalidades


PROMPT:

Explicame la estructura del proyecto, sus componentes y aquitectura. Explicame si existe un frontend y un backend definido para este proyecto, en que tecnologias estan construidos y como interactuan entre ellos.

(Creo el archivo ARCHITECTURE.md)