# Mi Biblioteca Personal (Frontend con Supabase)

Esta es una aplicación web para gestionar tu biblioteca personal. El frontend está construido con HTML, CSS y JavaScript, y utiliza Supabase como base de datos en la nube.

## Tecnologías Utilizadas

* HTML
* CSS
* JavaScript
* [Supabase](https://supabase.com/) - Backend como servicio (base de datos PostgreSQL)
* [Netlify](https://www.netlify.com/) - Alojamiento del frontend
* [Font Awesome](https://fontawesome.com/) - Para los iconos

## Instrucciones de Despliegue

1.  **Crea una cuenta en Supabase:** Ve a [https://supabase.com/](https://supabase.com/) y crea una cuenta.
2.  **Crea un nuevo proyecto en Supabase:** Sigue las instrucciones para crear un nuevo proyecto y obtén tus credenciales (URL y clave anónima).
3.  **Crea una tabla `books` en Supabase:** Define las columnas `id` (INTEGER, Primary Key, Auto Increment), `title` (TEXT, Not Null), `author` (TEXT), `isbn` (TEXT, Unique), y `status` (TEXT, Not Null, CHECK ('en-posesion', 'lo-quiero')).
4.  **Sube este código a un repositorio en GitHub.**
5.  **Crea una cuenta en Netlify:** Ve a [https://www.netlify.com/](https://www.netlify.com/) y crea una cuenta.
6.  **Conecta tu repositorio de GitHub a Netlify:**
    * Haz clic en "Add new site" y luego "Import an existing project".
    * Selecciona tu repositorio de GitHub.
    * Netlify debería detectar automáticamente la configuración. Asegúrate de que la "Build command" esté vacío y el "Publish directory" sea la raíz (`/`).
    * Haz clic en "Deploy site".
7.  **Configura las variables de entorno en Netlify (opcional pero recomendado para mayor seguridad):**
    * Ve a la configuración de tu sitio en Netlify.
    * Busca la sección "Environment variables".
    * A