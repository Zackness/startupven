# Script de Importación de Personal (Obreros y Docentes)

Proyecto: Base de datos Bienestar Estudiantil  
Modelo: User (Prisma)

## Objetivo

Importar **personal obrero** y **docentes** desde `base_datos_bienestar_estudiantil.md` al modelo `User`, con la misma lógica de no duplicar y credenciales por defecto.

Condiciones:

- **Solo se importan** filas con GREMIO: `Obrero`, `Obrera` o `Docente`. El personal **Administrativo** se omite.
- No se insertan duplicados (comparación por nombre completo o nombre + apellido).
- **Email:** si en el archivo viene "CORREO INSTITUCIONAL", se usa ese; si no, `nombreapellido@gmail.com` (y si ya existe, `nombreapellido` + cédula).
- **Contraseña temporal:** `123456`
- **Rol:** CLIENTE  
- **Gremio:** OBRERO (Obrero/Obrera) o PROFESORES (Docente)
- Se guardan: cedula, primerNombre, segundoNombre, primerApellido, segundoApellido, name. **expediente** queda en null (solo estudiantes lo tienen).

## Cómo ejecutar

```bash
npx tsx scripts/import-bienestar.ts
```

El script lee `base_datos_bienestar_estudiantil.md`, filtra solo Obrero/Obrera y Docente, omite duplicados e inserta el resto.

## Dependencias

Mismas que el proyecto: `bcryptjs`, `dotenv`. No hace falta instalar nada extra.

## Nota

Si la base de datos tiene límite de conexiones (`max_user_connections`), ejecuta el script cuando haya menos carga o aumenta el límite en el servidor.
